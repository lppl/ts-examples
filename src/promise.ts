type TPromise<InType, OutType = unknown> = {
    then: (
        onResolve?: (v: InType) => OutType,
        onReject?: (v: unknown) => OutType,
    ) => TPromise<OutType>;
    catch: (onReject: (v: unknown) => OutType) => TPromise<unknown, OutType>;
};

function isPromiseLike<T>(data: unknown | TPromise<T>): data is TPromise<T> {
    return Boolean(data && typeof (data as any).then === "function");
}

const noop = (): void => undefined;
const ident = <T>(data: T): T => data;

class Listener {
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

class Foobar {
    #data: unknown;

    #isFulfilled: boolean = false;
    #isRejected: boolean = false;

    #listeners = new Set<Listener>();

    constructor(callback: any) {
        callback(this.#resolve, this.#reject);
    }

    then(onFulfillment: any, onRejection: any) {
        return new Foobar((fulfill: any, reject: any) => {
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
        return new Foobar((fulfill: any, reject: any) => {
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

    get #isResolved(): boolean {
        return this.#isFulfilled || this.#isRejected;
    }

    #resolve = (data: unknown): void => {
        if (this.#isResolved) {
            return;
        }
        this.#isFulfilled = true;
        this.#data = data;
        this.#trigger();
    };

    #reject = (data: unknown): void => {
        if (this.#isResolved) {
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
        this.#listeners.add(
            new Listener(fulfill, reject, onFulfillment, onRejection),
        );
        this.#trigger();
    };

    #trigger(): void {
        if (this.#isResolved) {
            for (const listener of this.#listeners) {
                this.#processListener(listener);
                this.#listeners.delete(listener);
            }
        }
    }

    #processListener(listener: Listener): void {
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
    return new Foobar(executor) as any;
}

export { createPromise };
