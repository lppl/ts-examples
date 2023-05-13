import { None, Option, Some } from "./option";

type InnerResult<TValue> = Readonly<{
    ok(): Option<TValue>;
    err(): Option<Error>;
    and<TTarget>(fn: (v: TValue) => TTarget): Result<TTarget>;
    match<TTarget>(
        someFn: (value: TValue) => TTarget,
        noneFn: (err: Error) => TTarget,
    ): TTarget;
    unwrap(): TValue;
}>;

type Result<TValue> = InnerResult<
    TValue extends InnerResult<infer TNestedValue> ? TNestedValue : TValue
>;

class ResultOk<TValue> implements InnerResult<TValue> {
    readonly #value: TValue;

    constructor(value: TValue) {
        this.#value = value;
    }

    ok(): Option<TValue> {
        return Some(this.#value);
    }

    err(): Option<Error> {
        return None();
    }

    and<TTarget>(fn: (value: TValue) => TTarget): Result<TTarget> {
        return Ok(fn(this.#value));
    }

    match<TTarget>(okFn: (value: TValue) => TTarget): TTarget {
        return okFn(this.#value);
    }

    unwrap(): TValue {
        return this.#value;
    }
}

class ResultErr<TValue> implements InnerResult<TValue> {
    readonly #error: Error;

    constructor(error: Error) {
        this.#error = error;
    }

    ok(): Option<TValue> {
        return None();
    }

    err(): Option<Error> {
        return Some(this.#error);
    }

    and<TTarget>(_fn: (value: TValue) => TTarget): Result<TTarget> {
        return this as Result<TTarget>;
    }

    match<TTarget>(_: any, errFn: (error: Error) => TTarget): TTarget {
        return errFn(this.#error);
    }

    unwrap(): TValue {
        throw Error("Tried to unwrap of Err Result", { cause: this.#error });
    }
}

function Ok<TValue>(value: TValue): Result<TValue> {
    if (value instanceof ResultOk) {
        return value;
    } else if (value instanceof ResultErr) {
        return value;
    } else {
        return Object.freeze(new ResultOk<TValue>(value)) as Result<TValue>;
    }
}

function Err<TValue>(error: Error): Result<TValue> {
    return Object.freeze(new ResultErr<TValue>(error)) as Result<TValue>;
}

export { InnerResult, Ok, Err };
