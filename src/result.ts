import { Option, Some, None } from "./option";

type Result<TValue, TError = Error> = Readonly<{
    ok(): Option<TValue>;
    err(): Option<TError>;
    match<TExpected>(
        someFn: (value: TValue) => TExpected,
        noneFn: (err: TError) => TExpected,
    ): TExpected;
}>;

class ResultOk<TValue, TError> implements Result<TValue, TError> {
    readonly #value: TValue;
    constructor(value: TValue) {
        this.#value = value;
    }

    ok(): Option<TValue> {
        return Some(this.#value);
    }

    err(): Option<TError> {
        return None();
    }

    match<TExpected>(okFn: (value: TValue) => TExpected): TExpected {
        return okFn(this.#value);
    }
}

class ResultErr<TValue, TError> implements Result<TValue, TError> {
    readonly #error: TError;
    constructor(error: TError) {
        this.#error = error;
    }

    ok(): Option<TValue> {
        return None();
    }

    err(): Option<TError> {
        return Some(this.#error);
    }

    match<TExpected>(_: any, errFn: (error: TError) => TExpected): TExpected {
        return errFn(this.#error);
    }
}

function Ok<TValue, TError>(value: TValue): Result<TValue, TError> {
    return Object.freeze(new ResultOk<TValue, TError>(value));
}

function Err<TValue, TError = Error>(error: TError): Result<TValue, TError> {
    return Object.freeze(new ResultErr<TValue, TError>(error));
}

export { Result, Ok, Err };

test("Result.match", function () {
    const res: Result<string, Error> = Ok("Im Ok");
    expect(res.ok().value("Im not ok")).toBe("Im Ok");
});
