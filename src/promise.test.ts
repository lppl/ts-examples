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
    title             | value
    ${"an undefined"} | ${undefined}
    ${"a number"}     | ${1}
    ${"a null"}       | ${null}
    ${"a NaN"}        | ${NaN}
    ${"an object"}    | ${{}}
`(
    "Promise then fails silently with $title instead of callback",
    async (callback) => {
        const fn = jest.fn();

        const value = await (createPromise((resolve: any) => resolve()).then(
            callback,
        ) as any);
        expect(value).toBeUndefined();
    },
);
