import { None, Some, TOption } from "./option";

type InnerResult<TValue> = {
    ok(): TOption<TValue>;
    err(): TOption<Error>;
    and<TTarget>(fn: (v: TValue) => TTarget): TResult<TTarget>;
    match<TTarget>(
        okFn: (value: TValue) => TTarget,
        errFn: (err: Error) => TTarget,
    ): TTarget;
    unwrap(): TValue;
};

type TResult<TValue> = TValue extends Result<infer U> ? TValue : Result<TValue>;

class Result<TValue> implements InnerResult<TValue> {
    readonly #value?: TValue;
    readonly #error?: Error;
    readonly #isOk: boolean;

    constructor(isOk: boolean, value?: TValue, error?: Error) {
        this.#isOk = isOk;
        this.#value = value;
        this.#error = error;
    }

    ok(): TOption<TValue> {
        if (this.#isOk) {
            return Some(this.#value!);
        } else {
            return None();
        }
    }

    err(): TOption<Error> {
        if (!this.#isOk) {
            return Some(this.#error!);
        } else {
            return None<Error>();
        }
    }

    and<TTarget>(
        fn: (value: TValue) => TTarget,
        errFn?: (err: Error) => TTarget,
    ): TResult<TTarget> {
        if (this.#isOk) {
            return Ok(fn(this.#value!));
        } else {
            return Err(this.#error!);
        }
    }

    match<TTarget>(
        okFn: (value: TValue) => TTarget,
        errFn: (error: Error) => TTarget,
    ): TTarget {
        if (this.#isOk) {
            return okFn(this.#value!);
        } else {
            return errFn(this.#error!);
        }
    }

    unwrap(): TValue {
        if (this.#isOk) {
            return this.#value!;
        } else {
            throw Error("Tried to unwrap of Err Result", {
                cause: this.#error,
            });
        }
    }
}

function Ok<TValue>(value: TValue): TResult<TValue> {
    if (value instanceof Result) {
        return value as TResult<TValue>;
    } else {
        return new Result<TValue>(true, value, undefined) as TResult<TValue>;
    }
}

function Err<TValue>(error: Error): TResult<TValue> {
    return new Result<TValue>(false, undefined, error) as TResult<TValue>;
}

export { TResult, Ok, Err };
