function createPromise(resolver: any) {
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
            return createPromise((resolve: any) => {
                if (typeof onResolve === "function") {
                    _resolveListeners.add((data: any) =>
                        resolve(onResolve(data)),
                    );
                } else {
                    _resolveListeners.add(() => resolve(undefined));
                }
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
