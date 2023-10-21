function createPromise(resolver: any) {
    const _resolveListeners = new Set<any>();
    let _isResolved = false;
    let _data: any;
    let _isDataAPromise: boolean;

    function resolve(data: any) {
        if (_data && typeof _data.then === "function") {
            data.then((newData: any) => resolve(newData));
        } else {
            _data = data;
            _isResolved = true;
            trigger();
        }
    }

    function trigger() {
        if (_isResolved) {
            for (const listener of _resolveListeners) {
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

    resolver(resolve);

    return {
        then(fn: any) {
            return createPromise((resolve: any) => {
                if (typeof fn === "function") {
                    _resolveListeners.add((data: any) => resolve(fn(data)));
                } else {
                    _resolveListeners.add(() => resolve(undefined));
                }
                trigger();
            });
        },
    };
}

export { createPromise };
