import { Result, Ok, Err } from "./result";

type InnerOption<TValue> = Readonly<{
    and<TTarget>(fn: (v: TValue) => TTarget): TOption<TTarget>;
    else<TTarget>(fn: () => TTarget): TOption<TTarget>;
    match<TExpected>(
        someFn: (value: TValue) => TExpected,
        noneFn: () => TExpected,
    ): TExpected;
    value(_default: TValue): TValue;
    result(error: Error): Result<TValue>;
    unwrap(): TValue;
}>;

type TOption<TValue> = InnerOption<
    TValue extends InnerOption<infer TNestedValue> ? TNestedValue : TValue
>;

class OptionSome<TValue> implements InnerOption<TValue> {
    readonly #value: TValue;

    constructor(value: TValue) {
        this.#value = value;
    }

    and<TTarget>(
        fn: (v: TValue) => TTarget,
    ): InnerOption<
        TTarget extends InnerOption<infer TNestedValue> ? TNestedValue : TTarget
    > {
        return Some(fn(this.#value));
    }

    else<TTarget>(fn: () => TTarget): TOption<TTarget> {
        return this as any;
    }

    match<TExpected>(
        someFn: (value: TValue) => TExpected,
        noneFn: () => TExpected,
    ) {
        return someFn(this.#value);
    }

    value(_default: TValue): TValue {
        return this.#value;
    }

    result(): Result<TValue> {
        return Ok(this.#value);
    }

    unwrap(): TValue {
        return this.#value;
    }
}

class OptionNone<TValue> implements InnerOption<TValue> {
    and<TTarget>(): InnerOption<TTarget> {
        return this as unknown as InnerOption<TTarget>;
    }

    else<TTarget>(fn: () => TTarget): TOption<TTarget> {
        return Some(fn());
    }

    match<TExpected>(
        someFn: (value: TValue) => TExpected,
        noneFn: () => TExpected,
    ) {
        return noneFn();
    }

    value(_default: TValue): TValue {
        return _default;
    }

    result(error: Error): Result<TValue> {
        return Err(error);
    }

    unwrap(): TValue {
        throw Error("Tried to unwrap empty Option");
    }
}

function Some<TValue extends unknown>(value: TValue): TOption<TValue> {
    if (value instanceof OptionSome) {
        return value;
    } else if (value instanceof OptionNone) {
        return value;
    } else {
        return Object.freeze(new OptionSome(value)) as unknown as InnerOption<
            TValue extends InnerOption<infer TNestedValue>
                ? TNestedValue
                : TValue
        >;
    }
}

const none = Object.freeze(new OptionNone<unknown>());

function None<T>(): TOption<T> {
    return none as TOption<T>;
}

function Option<TValue>(value: TValue | undefined): TOption<TValue> {
    if (value === undefined) {
        return None();
    } else {
        return Some(value);
    }
}

export { Some, None, Option, TOption };
