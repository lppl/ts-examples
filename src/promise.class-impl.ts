import { TResult } from "./result";

function isThenable<T>(
    value: unknown | PromiseLike<T>,
): value is PromiseLike<T> {
    return Boolean(value && typeof (value as any).then === "function");
}

const ident = <T>(data: T): T => data;

class Resolve {
    constructor(
        readonly fulfill: any,
        readonly reject: any,
        readonly onfulfilled: any,
        readonly onreject: any,
    ) {
        this.onfulfilled = this.#fnOrIdent(onfulfilled);
        this.onreject = this.#fnOrIdent(onreject);
    }

    #fnOrIdent(fn: unknown) {
        return typeof fn === "function" ? fn : ident;
    }
}

class MyPromise<T> {
    #data: unknown;

    #isFulfilled: boolean = false;
    #isRejected: boolean = false;

    get #isSettled(): boolean {
        return this.#isFulfilled || this.#isRejected;
    }

    #resolves = new Set<Resolve>();

    constructor(
        executor: (
            resolve: (value: T | PromiseLike<T>) => void,
            reject: (reason?: any) => void,
        ) => void,
    ) {
        executor(this.#resolve, this.#reject);
    }

    then<TResult1 = T, TResult2 = never>(
        onfulfilled?:
            | ((value: T) => PromiseLike<TResult1> | TResult1)
            | undefined
            | null,
        onrejected?:
            | ((reason: any) => PromiseLike<TResult2> | TResult2)
            | undefined
            | null,
    ): MyPromise<TResult1 | TResult2> {
        return new MyPromise((fulfill: any, reject: any) => {
            setTimeout(
                this.#register,
                0,
                fulfill,
                reject,
                onfulfilled,
                onrejected,
            );
        });
    }

    catch<TResult = never>(
        onrejected?:
            | ((reason: any) => PromiseLike<TResult> | TResult)
            | undefined
            | null,
    ): MyPromise<T | TResult> {
        return new MyPromise((fulfill: any, reject: any) => {
            setTimeout(
                this.#register,
                0,
                fulfill,
                reject,
                undefined,
                onrejected,
            );
        });
    }

    #resolve = (data: unknown): void => {
        if (this.#isSettled) {
            return;
        }
        if (isThenable(data)) {
            data.then(this.#resolve, this.#reject);
            return;
        }
        this.#isFulfilled = true;
        this.#data = data;
        this.#trigger();
    };

    #reject = (data: unknown): void => {
        if (this.#isSettled) {
            return;
        }
        this.#isRejected = true;
        this.#data = data;
        this.#trigger();
    };

    #register = (
        fulfill: any,
        reject: any,
        onFulfillment: any,
        onRejection: any,
    ): void => {
        this.#resolves.add(
            new Resolve(fulfill, reject, onFulfillment, onRejection),
        );
        this.#trigger();
    };

    #trigger(): void {
        if (this.#isSettled) {
            for (const listener of this.#resolves) {
                this.#processResolve(listener);
                this.#resolves.delete(listener);
            }
        }
    }

    #processResolve(resolve: Resolve): void {
        if (this.#isFulfilled) {
            try {
                resolve.fulfill(resolve.onfulfilled(this.#data));
            } catch (error) {
                resolve.reject(resolve.onreject(error));
            }
        }
        if (this.#isRejected) {
            try {
                resolve.fulfill(resolve.onreject(this.#data));
            } catch (error) {
                resolve.reject(error);
            }
        }
    }
}

function createPromise<T>(
    executor: (
        resolve: (value: T | PromiseLike<T>) => void,
        reject: (reason?: any) => void,
    ) => void,
): MyPromise<T> {
    return new MyPromise(executor) as any;
}

export { createPromise };
