type TPromise<InType, OutType = unknown> = {
    then: (
        onResolve?: (v: InType) => OutType,
        onReject?: (v: unknown) => OutType,
    ) => TPromise<OutType>;
    catch: (onReject: (v: unknown) => OutType) => TPromise<unknown, OutType>;
};

function createPromise<InType, OutType>(
    resolver: (
        resolve: (v: InType) => void,
        reject: (v: unknown) => void,
    ) => void,
): TPromise<InType, OutType> {
    const _resolveListeners = new Set<any>();
    const _rejectListeners = new Set<any>();
    let _isResolved = false;
    let _isSuccess: boolean;
    let _data: any;
    let _isDataAPromise: boolean;

    function resolve(data: any) {
        if (_data && typeof _data.then === "function") {
            data.then(
                (newData: any) => resolve(newData),
                (newData: any) => reject(newData),
            );
        } else {
            _data = data;
            _isResolved = true;
            _isSuccess = true;
            trigger();
        }
    }

    function reject(data: any) {
        if (_data && typeof _data.then === "function") {
            data.then(
                (newData: any) => resolve(newData),
                (newData: any) => reject(newData),
            );
        } else {
            _data = data;
            _isResolved = true;
            _isSuccess = false;
            trigger();
        }
    }

    function trigger() {
        if (_isResolved) {
            const listeners = _isSuccess ? _resolveListeners : _rejectListeners;
            for (const listener of listeners) {
                if (_isDataAPromise) {
                    _data.then(listener);
                } else {
                    listener(_data);
                }
                _resolveListeners.delete(listener);
            }
        }
    }

    if (typeof resolver !== "function") {
        throw TypeError(`Promise resolver ${resolver} is not a function`);
    }

    resolver(resolve, reject);

    return {
        then(onResolve?: any, onReject?: any) {
            return createPromise((resolve: any, reject: any) => {
                if (typeof onResolve === "function") {
                    _resolveListeners.add((data: any) => {
                        try {
                            resolve(onResolve(data));
                        } catch (error) {
                            if (typeof onReject === "function") {
                                reject(onReject(error));
                            } else {
                                reject(error);
                            }
                        }
                    });
                } else {
                    _resolveListeners.add(() => resolve(undefined));
                }
                if (typeof onReject === "function") {
                    _rejectListeners.add((data: any) => {
                        try {
                            resolve(onReject(data));
                        } catch (error) {
                            reject(error);
                        }
                    });
                } else {
                    _rejectListeners.add(() => resolve(undefined));
                }
                trigger();
            });
        },
        catch(onReject: any) {
            return createPromise((resolve: any) => {
                if (typeof onReject === "function") {
                    _rejectListeners.add((data: any) =>
                        resolve(onReject(data)),
                    );
                } else {
                    _rejectListeners.add(() => resolve(undefined));
                }
                trigger();
            });
        },
    };
}

export { createPromise };
