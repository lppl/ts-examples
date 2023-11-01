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

class ResolvementCallbacks {
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
    get #isSettled(): boolean {
        return this.#isFulfilled || this.#isRejected;
    }

    #resolvements = new Set<ResolvementCallbacks>();

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

    #resolve = (data: unknown): void => {
        if (this.#isSettled) {
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
        this.#resolvements.add(
            new ResolvementCallbacks(
                fulfill,
                reject,
                onFulfillment,
                onRejection,
            ),
        );
        this.#trigger();
    };

    #trigger(): void {
        if (this.#isSettled) {
            for (const listener of this.#resolvements) {
                this.#processFulfillment(listener);
                this.#resolvements.delete(listener);
            }
        }
    }

    #processFulfillment(listener: ResolvementCallbacks): void {
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
