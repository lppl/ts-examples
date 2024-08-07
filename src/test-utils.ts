import { mock } from "bun:test";

function createExposedPromise<T>() {
    let resolve = (v: T | PromiseLike<T>) => {},
        reject = () => {};
    return {
        promise: new Promise<T>((_res, _rej) => {
            resolve = _res;
            reject = _rej;
        }),
        resolve,
        reject,
    };
}

export function createPromiseSpy() {
    const { promise, resolve, reject } = createExposedPromise();
    const fn = mock(() => promise);
    return {
        fn,
        resolve,
        reject,
    };
}

export function waitFor(fn: () => void, timeoutMs = 10, intervalMs = 2) {
    return new Promise<void>((resolve, reject) => {
        let endTime = Date.now() + timeoutMs;
        let no = 0;

        function run() {
            try {
                fn();
                resolve();
            } catch (cause) {
                if (endTime > Date.now()) {
                    setTimeout(run, intervalMs);
                } else {
                    reject(Error("waitFor failed", { cause }));
                }
            }
        }

        run();
    });
}

export function waitForMs(ms = 1) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
