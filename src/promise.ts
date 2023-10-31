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

    #listeners = new Set<[any, any, any, any]>();

    constructor(callback: any) {
        callback(this.#resolve, this.#reject);
    }

    then(onFulfillment: any, onRejection: any) {
        console.log(".then");
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

    get #isResolved(): boolean {
        return this.#isFulfilled || this.#isRejected;
    }

    get #isPending(): boolean {
        return !this.#isResolved;
    }

    #resolve = (data: unknown): void => {
        if (this.#isFulfilled) {
            return;
        }
        this.#isFulfilled = true;
        this.#data = data;
        this.#trigger();
    };

    #reject = (data: unknown): void => {
        if (this.#isFulfilled) {
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
        console.log(".register");
        this.#listeners.add([fulfill, reject, onFulfillment, onRejection]);
        this.#trigger();
    };

    #trigger() {
        console.log(".trigger");
        if (this.#isResolved) {
            for (const listener of this.#listeners) {
                this.#processListener(...listener);
                this.#listeners.delete(listener);
            }
        } else {
            console.log(".trigger unresolved");
        }
    }

    #processListener(
        fulfill: any,
        reject: any,
        onFulfillment: any = (data: any) => data,
        onReject: any = (data: any) => data,
    ) {
        if (this.#isFulfilled) {
            try {
                fulfill(onFulfillment(this.#data));
            } catch (error) {
                reject(onReject(error));
            }
        }
        if (this.#isRejected) {
            try {
                reject(onReject(this.#data));
            } catch (error) {
                reject(error);
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
