const gen_with_padstart = (length = 4, radix = 36) => {
    assert(
        1 <= length && length <= 64,
        "length must be positive number and smaller than 64",
    );
    assert(2 <= radix && radix <= 36, "radix is number between 2 and 36");
    return ""
        .padStart(length, "x")
        .replaceAll("x", () => ((Math.random() * radix) | 0).toString(radix));
};

const arr = [...new Array(64)];
const gen_with_array = (length = 4, radix = 36) => {
    assert(
        1 <= length && length <= 64,
        "length must be positive number and smaller than 64",
    );
    assert(2 <= radix && radix <= 36, "radix is number between 2 and 36");
    return arr
        .slice(0, length)
        .map(() => ((Math.random() * radix) | 0).toString(radix))
        .join("");
};

const gen_with_array_console_assert = (length = 4, radix = 36) => {
    console.assert(
        1 <= length && length <= 64,
        "length must be positive number and smaller than 64",
    );
    console.assert(
        2 <= radix && radix <= 36,
        "radix is number between 2 and 36",
    );
    return arr
        .slice(0, length)
        .map(() => ((Math.random() * radix) | 0).toString(radix))
        .join("");
};

function assert(predicate, message) {
    if (!predicate) {
        throw Error("Assertion failed: " + message);
    }
}

const gen_with_string = (length = 4, radix = 36) => {
    assert(
        1 <= length && length <= 64,
        "length must be positive number and smaller than 64",
    );
    assert(2 <= radix && radix <= 36, "radix is number between 2 and 36");
    return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        .slice(0, length)
        .replaceAll("x", () => ((Math.random() * radix) | 0).toString(radix));
};

const results = [];
[10, 100, 1_000, 10_000, 100_000].forEach((repeats) => {
    return [
        gen_with_padstart,
        gen_with_array,
        gen_with_string,
        gen_with_array_console_assert,
    ].forEach((fn) => {
        const start = performance.now();
        for (let i = repeats; i > 0; i--) {
            fn();
        }
        const end = performance.now() - start;

        results.push([fn.name, repeats, end]);
    });
});

console.log(results);
