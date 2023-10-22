import { createPromise } from "./promise";

test("Promise run its callback function synchronously", () => {
    const fn = jest.fn();

    createPromise(fn);

    expect(fn).toBeCalled();
});

test("Promise happy path with then", (cb) => {
    const fn = jest.fn();

    createPromise((resolve: any) => resolve(42)).then((data: any) => {
        expect(data).toBe(42);
        cb();
    });
});

test("Promise run its callback function asynchronously", async () => {
    const result = await (createPromise((resolve: any) =>
        setTimeout(() => resolve(42)),
    ) as any);

    expect(result).toBe(result);
});

test("Promise then transformation happy path", (cb) => {
    const fn = jest.fn();

    createPromise((resolve: any) => resolve(21))
        .then((data: any) => {
            return data * 2;
        })
        .then((data: any) => {
            expect(data).toBe(42);
            cb();
        });
});

test.each`
    title                 | fn
    ${"built in Promise"} | ${(value: any) => Promise.resolve(value)}
    ${"createPromise"}    | ${(value: any) => createPromise((resolve: any) => resolve(value))}
`("createPromise flattens return promise for $title", async ({ fn }) => {
    const ret = await (createPromise((resolve: any) => resolve(fn(42))) as any);

    expect(ret).toBe(42);
});

test.each`
    title                 | fn
    ${"built in Promise"} | ${(value: any) => Promise.resolve(value)}
    ${"createPromise"}    | ${(value: any) => createPromise((resolve: any) => resolve(value))}
`("createPromise.then flattens return promise for $title", async ({ fn }) => {
    const ret = await (createPromise((resolve: any) => resolve(42)).then(
        fn,
    ) as any);

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
    async ({ value }: any) => {
        const fn = jest.fn();

        const v = await (createPromise((resolve: any) => resolve()).then(
            value,
        ) as any);
        expect(v).toBeUndefined();
    },
);

test("Promise can be rejected in constructor", (cb) => {
    createPromise((_: any, reject: any) => reject(21))
        .then(undefined, (reason: any) => {
            expect(reason).toBe(21);
            return reason * 2;
        })
        .then((correct: any) => {
            expect(correct).toBe(42);
            cb();
        });
});

test("Promise catch ", (cb) => {
    createPromise((_: any, reject: any) => reject(21))
        .catch((reason: any) => {
            expect(reason).toBe(21);
            return 42;
        })
        .then((data: any) => {
            expect(data).toBe(42);
            cb();
        });
});

test("When .then onResolve callback throws an error then promise is rejected", async () => {
    await (createPromise((resolve: any) => resolve(21))
        .then((reason: any) => {
            throw Error("Promise resolver failed.");
        })
        .then(
            (data: any) => {
                throw Error("This should not run");
            },
            (error: any) => {
                expect(error).toEqual(Error("Promise resolver failed."));
            },
        ) as any);
});

test("When .then onReject callback throws an error then promise is rejected", async () => {
    await (createPromise((_: any, reject: any) => reject(21))
        .then(
            () => undefined,
            () => {
                throw Error("Promise reject failed.");
            },
        )
        .then(
            (data: any) => {
                throw Error("This should not run");
            },
            (error: any) => {
                expect(error).toEqual(Error("Promise reject failed."));
            },
        ) as any);
});
