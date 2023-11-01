import { createPromise } from "./promise";

jest.setTimeout(50);

describe("Promise", () => {
    test("executor runs synchronously", () => {
        const fn = jest.fn();

        createPromise(fn);

        expect(fn).toBeCalled();
    });

    test(".then(onFulfillment) happy path", (cb) => {
        createPromise((resolve) => resolve(42)).then((data) => {
            expect(data).toBe(42);
            cb();
        });
    });

    test("executor can fulfill asynchronously", (done) => {
        const promise = createPromise((resolve) =>
            setTimeout(() => resolve(42)),
        );

        promise.then((result) => {
            expect(result).toBe(42);
            done();
        });
    });

    test(".then(onFulfillment) callback is run asynchronously", async () => {
        const fn = jest.fn();
        const promise = createPromise<void>((resolve) => resolve()).then(fn);

        expect(fn).toBeCalledTimes(0);

        await promise;

        expect(fn).toBeCalledTimes(1);
    });

    test(".then(onFulfillment) chain with another .then(onFulfillment)", (cb) => {
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
        title                  | fn
        ${"built in Promise"}  | ${(value: unknown) => Promise.resolve(value)}
        ${"my implementation"} | ${(value: unknown) => createPromise((resolve) => resolve(value))}
    `("executor(resolve) flattens thenable result ($title)", ({ fn }, done) => {
        const promise = createPromise((resolve) => {
            resolve(fn(42));
        });

        promise.then((data) => {
            expect(data).toBe(42);
            done();
        });
    });

    test.each`
        title                  | fn
        ${"built in Promise"}  | ${(value: unknown) => Promise.resolve(value)}
        ${"my implementation"} | ${(value: unknown) => createPromise((resolve) => resolve(value))}
    `(".then(onFulfill) flattens thenable result ($title)", ({ fn }, done) => {
        const promise = createPromise((resolve) => {
            resolve(undefined);
        }).then(() => {
            return fn(42);
        });

        promise.then((data) => {
            expect(data).toBe(42);
            done();
        });
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
        "executor throws TypeError when $title have been passed instead of resolver",
        ({ resolver }) => {
            expect(() => createPromise(resolver)).toThrowError();
        },
    );

    test.each`
        title             | incorrectOnFulfillment
        ${"an undefined"} | ${undefined}
        ${"a number"}     | ${1}
        ${"a null"}       | ${null}
        ${"a NaN"}        | ${NaN}
        ${"an object"}    | ${{}}
    `(
        ".then(onFulfill) fails silently with $title instead of onFulfill callback",
        ({ incorrectOnFulfillment }, done) => {
            const promise = createPromise<void, unknown>((resolve) =>
                resolve(),
            ).then(incorrectOnFulfillment);

            promise.then((data) => {
                expect(data).toBeUndefined();
                done();
            });
        },
    );

    test("executor can reject a promise", (done) => {
        const rejectedPromise = createPromise((_, reject) => reject(21));

        const fixedPromise = rejectedPromise.then(undefined, (reason) => {
            return reason;
        });

        fixedPromise.then((correct) => {
            expect(correct).toBe(21);
            done();
        });
    });

    test(".catch(onReject) returns resolved promise", (done) => {
        createPromise((_, reject) => reject(21))
            .catch((reason) => {
                expect(reason).toBe(21);
                return 42;
            })
            .then((data) => {
                expect(data).toBe(42);
                done();
            });
    });

    test(".catch(onReject) runs onReject callback asynchronously ", async () => {
        const fn = jest.fn();
        const promise = createPromise<void>((_, reject) => reject()).catch(fn);

        expect(fn).toBeCalledTimes(0);

        await (promise as any);

        expect(fn).toBeCalledTimes(1);
    });

    test(".then(onFulfill) return rejected promise when onFulfill throw an Error", (done) => {
        createPromise((resolve) => resolve(21))
            .then(() => {
                throw Error("Promise resolver failed.");
            })
            .catch((reason) => {
                expect(reason).toEqual(Error("Promise resolver failed."));
                done();
            });
    });

    test(".then(_, onReject) return rejected promise when onReject throws an errors ", async () => {
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
});
