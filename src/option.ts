type Option<TValue> = {
    and<TTarget>(fn: (v: TValue) => TTarget): Option<TTarget>;
    else(fn: () => TValue): Option<TValue>;
    map<TExpected>(
        someFn: (value: TValue) => TExpected,
        noneFn: () => TExpected,
    ): TExpected;
    value(_default: TValue): TValue;
};

class OptionSome<TValue> implements Option<TValue> {
    readonly #value: TValue;

    constructor(value: TValue) {
        this.#value = value;
    }

    and<TTarget>(fn: (v: TValue) => TTarget): Option<TTarget> {
        return new OptionSome(fn(this.#value));
    }

    else(fn: () => TValue): Option<TValue> {
        return this;
    }

    map<TExpected>(
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

    else(fn: () => TValue): Option<TValue> {
        return new OptionSome(fn());
    }

    map<TExpected>(
        someFn: (value: TValue) => TExpected,
        noneFn: () => TExpected,
    ) {
        return noneFn();
    }

    value(_default: TValue): TValue {
        return _default;
    }
}

function Some<T>(value: T): Option<T> {
    return new OptionSome(value);
}

const none = new OptionNone<unknown>();

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
        noneVar.map(
            (str) => `Found string ${str}`,
            () => "None var found",
        ),
);

console.assert(
    "Found string Foobar" ===
        someVar.map(
            (str) => `Found string ${str}`,
            () => "None var found",
        ),
);

export { Option };
