let none: Option<any>;

class Option<TValue> {

    constructor(private readonly value?: TValue) {}

    public static Some<T>(value: T) {
        return Object.freeze(new Option<T>(value));
    }

    public static None<TValue>() {
        if (!none) {
            none = Object.freeze(new Option());
        }
        return none as Option<TValue>;
    }

    map<TTarget>(fn: (v: TValue) => TTarget): Option<TTarget> {
        if (this.value !== undefined) {
            return Option.Some(fn(this.value));
        } else {
            return Option.None<TTarget>();
        }
    }

    or(_default: TValue) {
        if (this.value === undefined) {
            return _default;
        } else {
            return this.value;
        }
    }

    or_fn(fn: () => TValue) {
        if (this.value === undefined) {
            return fn();
        } else {
            return this.value;
        }
    }
}


const one = Option.Some<string>('Foobar')
const two = Option.None<string>()


console.assert('Hello Foobar' === one.map(str => `Hello ${str}`).or('Defaults'));
console.assert('Hello Foobar' === one.map(str => `Hello ${str}`).or_fn(() => 'Defaults'));
console.assert('Defaults' === two.map(str => `Hello ${str}`).or('Defaults'));
console.assert('Defaults' === two.map(str => `Hello ${str}`).or_fn(() => 'Defaults'));
console.assert('Defaults' === two.map(str => `Hello ${str}`).or_fn(() => 'Defaults'));

export {
    Option
}
