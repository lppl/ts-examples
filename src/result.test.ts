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

test("Result for another resul", () => {
    expect(
        Ok(Ok(Ok("Should flow")))
            .and((str) => Ok(`Hello ${str}`))
            .unwrap(),
    ).toBe("Hello Should flow");
});

test("Result behave like promise for string value", () => {
    return Ok("Foobar").then((str) => expect(str).toBe("Foobar"));
});

test("Result Ok behave like promise for resolved promise value", () => {
    return Ok(Promise.resolve("Foobar")).then((str) =>
        expect(str).toBe("Foobar"),
    );
});

test("Result Ok work with async await", async () => {
    expect(await Ok("Foobar")).toBe("Foobar");
});

test("Result Ok behave like promise for reject promise value", () => {
    return Ok(Promise.reject(Error("some failure")))
        .then(
            () => fail("never"),
            (error: Error) => `Failed with message: ${error.message}`,
        )
        .then((str) => {
            expect(str).toBe("Failed with message: some failure");
        });
});

test("Result Error works with promise on reject", () => {
    return Err(Error("some failure"))
        .then(
            () => fail("never"),
            (error: Error) => `Failed with message: ${error.message}`,
        )
        .then((str) => {
            expect(str).toBe("Failed with message: some failure");
        });
});

test("Result Ok works with async/await try/catch", () => {
    expect(async () => {
        await Ok(Promise.reject(Error("some failure")));
    }).rejects.toThrow("some failure");
});

test("Result Error works with async/await try/catch", () => {
    expect(async () => {
        await Err(Error("some failure"));
    }).rejects.toThrow("some failure");
});
