type TPromise<InType, OutType = unknown> = {
    then: (
        onResolve?: (v: InType) => OutType,
        onReject?: (v: unknown) => OutType,
    ) => TPromise<OutType>;
    catch: (onReject: (v: unknown) => OutType) => TPromise<unknown, OutType>;
};

function isThenable<T>(data: unknown | TPromise<T>): data is TPromise<T> {
    return Boolean(data && typeof (data as any).then === "function");
}

const noop = (): void => undefined;
const ident = <T>(data: T): T => data;

class Resolve {
    constructor(
        readonly fulfill: any,
        readonly reject: any,
        readonly onFulfillment: any,
        readonly onReject: any,
    ) {
        this.onFulfillment = this.#fnOrIdent(onFulfillment);
        this.onReject = this.#fnOrIdent(onReject);
    }

    #fnOrIdent(fn: unknown) {
        return typeof fn === "function" ? fn : ident;
    }
}

class MyPromise {
    #data: unknown;

    #isFulfilled: boolean = false;
    #isRejected: boolean = false;
    get #isSettled(): boolean {
        return this.#isFulfilled || this.#isRejected;
    }

    #resolves = new Set<Resolve>();

    constructor(callback: any) {
        callback(this.#resolve, this.#reject);
    }

    then(onFulfillment: any, onRejection: any) {
        return new MyPromise((fulfill: any, reject: any) => {
            setTimeout(
                this.#register,
                0,
                fulfill,
                reject,
                onFulfillment,
                onRejection,
            );
        });
    }

    catch(onRejection: any) {
        return new MyPromise((fulfill: any, reject: any) => {
            setTimeout(
                this.#register,
                0,
                fulfill,
                reject,
                undefined,
                onRejection,
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

    #processResolve(listener: Resolve): void {
        if (this.#isFulfilled) {
            try {
                listener.fulfill(listener.onFulfillment(this.#data));
            } catch (error) {
                listener.reject(listener.onReject(error));
            }
        }
        if (this.#isRejected) {
            try {
                listener.fulfill(listener.onReject(this.#data));
            } catch (error) {
                listener.reject(error);
            }
        }
    }
}

function createPromise<InType, OutType = unknown>(
    executor: (
        resolve: (v: InType | TPromise<InType>) => void,
        reject: (v?: unknown) => void,
    ) => void,
): TPromise<InType, OutType> {
    return new MyPromise(executor) as any;
}

export { createPromise };
