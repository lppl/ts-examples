import { Err, Ok } from "./result";

test("Result.ok", function () {
    const res = Ok("Im Ok");
    expect(res.ok().value("Im not ok")).toBe("Im Ok");
});

test("Result.match for ok", () => {
    expect(
        Ok("Foobar").match(
            (str) => `Hello ${str}`,
            () => `Hello Error`,
        ),
    ).toBe("Hello Foobar");
});

test("Result.match for err", () => {
    expect(
        Err(Error("Legion")).match(
            (str) => `Hello ${str}`,
            (error) => `My name is ${error.message}`,
        ),
    ).toBe("My name is Legion");
});

test("Result.and for ok", () => {
    expect(
        Ok("Foobar")
            .and((str) => `Hello ${str}`)
            .unwrap(),
    ).toBe("Hello Foobar");
});

test("Result.and for err", () => {
    expect(() =>
        Err(Error("Should not flow"))
            .and((str) => `Hello ${str}`)
            .unwrap(),
    ).toThrow();
});
