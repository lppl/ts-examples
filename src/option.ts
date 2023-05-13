type InnerOption<TValue> = Readonly<{
    and<TTarget>(fn: (v: TValue) => TTarget): Option<TTarget>;
    else<TTarget>(fn: () => TTarget): Option<TTarget>;
    match<TExpected>(
        someFn: (value: TValue) => TExpected,
        noneFn: () => TExpected,
    ): TExpected;
    value(_default: TValue): TValue;
    unwrap(): TValue;
}>;

type Option<TValue> = InnerOption<
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

    else<TTarget>(fn: () => TTarget): Option<TTarget> {
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

    unwrap(): TValue {
        return this.#value;
    }
}

class OptionNone<TValue> implements InnerOption<TValue> {
    and<TTarget>(): InnerOption<TTarget> {
        return this as unknown as InnerOption<TTarget>;
    }

    else<TTarget>(fn: () => TTarget): Option<TTarget> {
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

    unwrap(): TValue {
        throw Error("Tried to unwrap empty Option");
    }
}

function Some<TValue extends unknown>(value: TValue): Option<TValue> {
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

function None<T>(): Option<T> {
    return none as Option<T>;
}

export { Some, None, Option };
