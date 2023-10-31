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

class Foobar {
    #data: unknown;

    #isFulfilled: boolean = false;
    #isRejected: boolean = false;

    #fulfillmentListeners = new Set<any>();
    #rejectedListeners = new Set<any>();

    constructor(callback: any) {
        callback();
    }

    then(onFulfillment: any, onRejection: any) {
        this.#fulfillmentListeners.add(onFulfillment);
        this.#rejectedListeners.add(onRejection);
        return new Foobar((fulfill: any, reject: any) => {
            setTimeout(this.#trigger);
        });
    }

    get #isResolved() {
        return this.#isFulfilled || this.#isRejected;
    }

    get #isPending() {
        return !this.#isResolved;
    }

    #resolve(data: unknown) {
        this.#isFulfilled = true;
        this.#data = data;
    }

    #reject(data: unknown) {
        this.#isRejected = true;
        this.#data = data;
    }

    #trigger() {
        if (this.#isResolved) {
            const listeners = this.#isFulfilled
                ? this.#fulfillmentListeners
                : this.#rejectedListeners;
            for (const listener of listeners) {
                if (isPromiseLike(this.#data)) {
                    this.#data.then(listener);
                } else {
                    listener(this.#data);
                }
                listeners.delete(listener);
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
