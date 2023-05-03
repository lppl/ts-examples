type TResult<T, E> = Readonly<Result<T, E>>;

class Result<T, E = Error> {
    private constructor(private readonly _isOk: boolean, private readonly value?: T, private readonly error?: E) {
    }

    public static Ok<T, E = Error>(value: T) : TResult<T, E>{
        return Object.freeze(new Result<T, never>(true, value))
    }

    public static Err<T, E = Error>(error: E): TResult<never, E> {
        return Object.freeze(new Result<never, E>(false, undefined as never, error))
    }

    get isOk() {
        return this._isOk;
    }

    get isError() {
        return !this._isOk;
    }

    match<U>(
        ok: (v: T) => U,
        err: (e: E) => U
    ) {
        if (this.isOk) {
            return ok(this.value);
        } else {
            return err(this.error);
        }
    }

    or(_default: T): T {
        if (this.isOk) {
            return this.value;
        } else {
            return _default;
        }
    }

    or_fn(fn: () => T): T {
        if (this.isOk) {
            return this.value;
        } else {
            return fn();
        }
    }
}

test('Result.match', function () {
    const res : TResult<string, Error> = Result.Ok("Im Ok");
    expect(res.or('Im not ok')).toBe('Im Ok')
});
