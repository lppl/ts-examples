type Option<TValue> = Readonly<{
    and<TTarget>(
        fn: (v: TValue) => TTarget,
    ): Option<
        TTarget extends Option<infer TNestedValue> ? TNestedValue : TTarget
    >;
    else(
        fn: () => TValue,
    ): Option<
        TValue extends Option<infer TNestedValue> ? TNestedValue : TValue
    >;
    match<TExpected>(
        someFn: (value: TValue) => TExpected,
        noneFn: () => TExpected,
    ): TExpected;
    value(_default: TValue): TValue;
}>;

class OptionSome<TValue> implements Option<TValue> {
    readonly #value: TValue;

    constructor(value: TValue) {
        this.#value = value;
    }

    and<TTarget>(
        fn: (v: TValue) => TTarget,
    ): Option<
        TTarget extends Option<infer TNestedValue> ? TNestedValue : TTarget
    > {
        return Some(fn(this.#value));
    }

    else(
        fn: () => TValue,
    ): Option<
        TValue extends Option<infer TNestedValue> ? TNestedValue : TValue
    > {
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
}

class OptionNone<TValue> implements Option<TValue> {
    and<TTarget>(): Option<TTarget> {
        return this as unknown as Option<TTarget>;
    }

    else(
        fn: () => TValue,
    ): Option<
        TValue extends Option<infer TNestedValue> ? TNestedValue : TValue
    > {
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
}

function Some<TValue extends unknown>(
    value: TValue,
): Option<TValue extends Option<infer TNestedValue> ? TNestedValue : TValue> {
    if (value instanceof OptionSome) {
        return value;
    } else if (value instanceof OptionNone) {
        return value;
    } else {
        return Object.freeze(new OptionSome(value)) as unknown as Option<
            TValue extends Option<infer TNestedValue> ? TNestedValue : TValue
        >;
    }
}

const none = Object.freeze(new OptionNone<unknown>());

function None<T>(): Option<T> {
    return none as Option<T>;
}

const someVar = Some("Foobar");
const noneVar = None<string>();

console.assert(
    "Hello Foobar" === someVar.and((str) => `Hello ${str}`).value("_"),
);

console.assert("_" === noneVar.value("_"));
console.assert(
    "Hello Foobar" ===
        noneVar
            .else(() => "Foobar")
            .and((str) => `Hello ${str}`)
            .value("_"),
);

console.assert(
    "None var found" ===
        noneVar.match(
            (str) => `Found string ${str}`,
            () => "None var found",
        ),
);

console.assert(
    "Found string Foobar" ===
        someVar.match(
            (str) => `Found string ${str}`,
            () => "None var found",
        ),
);

console.assert(
    Some(Some(Some("Roll it out"))).value("did not work") === "Roll it out",
    "Some flattens options",
);

console.assert(
    Some(Some(None())).value("None also work") === "None also work",
    "Some flattens options",
);

export { Some, None, Option };
