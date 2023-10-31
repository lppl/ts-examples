import { createPromise } from "./promise";

test("Promise run its callback function synchronously", () => {
    const fn = jest.fn();

    createPromise(fn);

    expect(fn).toBeCalled();
});

test("Promise happy path with then", (cb) => {
    createPromise((resolve) => resolve(42)).then((data) => {
        expect(data).toBe(42);
        cb();
    });
});

test("Promise can resolve asynchronously", async () => {
    const result = await (createPromise((resolve) =>
        setTimeout(() => resolve(42)),
    ) as any);

    expect(result).toBe(42);
});

test("Resolved promise run its callback asynchronously", async () => {
    const fn = jest.fn();
    const promise = createPromise<void>((resolve) => resolve()).then(fn);

    expect(fn).toBeCalledTimes(0);

    await promise;

    expect(fn).toBeCalledTimes(1);
});

test("Promise then transformation happy path", (cb) => {
    createPromise((resolve) => resolve(21))
        .then((data) => {
            expect(data).toBe(21);
            return 42;
        })
        .then((data) => {
            expect(data).toBe(42);
            cb();
        });
});

test.each`
    title                 | fn
    ${"built in Promise"} | ${(value: unknown) => Promise.resolve(value)}
    ${"createPromise"}    | ${(value: unknown) => createPromise((resolve) => resolve(value))}
`("createPromise flattens return promise for $title", async ({ fn }) => {
    const ret = await (createPromise((resolve) => resolve(fn(42))) as any);

    expect(ret).toBe(42);
});

test.each`
    title                 | fn
    ${"built in Promise"} | ${(value: unknown) => Promise.resolve(value)}
    ${"createPromise"}    | ${(value: unknown) => createPromise((resolve) => resolve(value))}
`("createPromise.then flattens return promise for $title", async ({ fn }) => {
    const ret = await (createPromise((resolve) => resolve(42)).then(fn) as any);

    expect(ret).toBe(42);
});

test.each`
    title             | value              | error
    ${"an undefined"} | ${undefined}
    ${"a number"}     | ${1}
    ${"a null"}       | ${null}
    ${"a NaN"}        | ${NaN}
    ${"an object"}    | ${{}}
    ${"fn"}           | ${() => undefined}
`(
    "promise constructor throws TypeError with $title instead of resolver",
    async ({ resolver }) => {
        expect(() => createPromise(resolver)).toThrowError();
    },
);

test.each`
    title             | value
    ${"an undefined"} | ${undefined}
    ${"a number"}     | ${1}
    ${"a null"}       | ${null}
    ${"a NaN"}        | ${NaN}
    ${"an object"}    | ${{}}
`(
    "Promise then fails silently with $title instead of callback",
    async ({ value }) => {
        const v = await (createPromise<void, unknown>((resolve) =>
            resolve(),
        ).then(value) as any);
        expect(v).toBeUndefined();
    },
);

test("Promise can be rejected in constructor", (cb) => {
    createPromise((_, reject) => reject(21))
        .then(undefined, (reason) => {
            expect(reason).toBe(21);
            return 42;
        })
        .then((correct) => {
            expect(correct).toBe(42);
            cb();
        });
});

test("Promise catch ", (cb) => {
    createPromise((_, reject) => reject(21))
        .catch((reason) => {
            expect(reason).toBe(21);
            return 42;
        })
        .then((data) => {
            expect(data).toBe(42);
            cb();
        });
});

test("Rejected promise .catch runs callback asynchronously ", async () => {
    const fn = jest.fn();
    const promise = createPromise<void>((_, reject) => reject()).catch(fn);

    expect(fn).toBeCalledTimes(0);

    await (promise as any);

    expect(fn).toBeCalledTimes(1);
});

test("When .then onResolve callback throws an error then promise is rejected", async () => {
    await (createPromise((resolve) => resolve(21))
        .then(() => {
            throw Error("Promise resolver failed.");
        })
        .then(
            () => {
                throw Error("This should not run");
            },
            (error) => {
                expect(error).toEqual(Error("Promise resolver failed."));
            },
        ) as any);
});

test("When .then onReject callback throws an error then promise is rejected", async () => {
    await (createPromise((_, reject) => reject(21))
        .then(
            () => undefined,
            () => {
                throw Error("Promise reject failed.");
            },
        )
        .then(
            () => {
                throw Error("This should not run");
            },
            (error) => {
                expect(error).toEqual(Error("Promise reject failed."));
            },
        ) as any);
});
