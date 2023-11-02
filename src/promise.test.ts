import { createPromise as createPromiseClassImpl } from "./promise.class-impl";
import { createPromise as createPromiseBBOMImpl } from "./promise.bbom-impl";

jest.setTimeout(50);

describe.each`
    name                   | createPromise
    ${"a class"}           | ${createPromiseClassImpl}
    ${"a Big Bowl of Mud"} | ${createPromiseBBOMImpl}
`(
    "Tests for $name implementation",
    ({
        createPromise,
    }: {
        name: string;
        createPromise: typeof createPromiseClassImpl;
    }) => {
        test("executor runs synchronously", () => {
            const fn = jest.fn();

            createPromise(fn);

            expect(fn).toBeCalled();
        });

        test("executor can resolve asynchronously", (done) => {
            const promise = createPromise((fulfill) =>
                setTimeout(() => fulfill(42)),
            );

            promise.then((value) => {
                expect(value).toBe(42);
                done();
            });
        });

        test.each`
            title                  | fn
            ${"built in Promise"}  | ${(value: unknown) => Promise.resolve(value)}
            ${"my implementation"} | ${(value: unknown) => createPromise((fulfill) => fulfill(value))}
        `(
            "executor(resolve) flattens thenable result ($title)",
            ({ fn }, done) => {
                const promise = createPromise((fulfill) => {
                    fulfill(fn(42));
                });

                promise.then((value) => {
                    expect(value).toBe(42);
                    done();
                });
            },
        );

        test.each`
            title             | executor
            ${"an undefined"} | ${undefined}
            ${"a number"}     | ${1}
            ${"a null"}       | ${null}
            ${"a NaN"}        | ${NaN}
            ${"an object"}    | ${{}}
        `(
            "executor throws TypeError when $title have been passed instead of resolver",
            ({ executor }) => {
                expect(() => createPromise(executor)).toThrowError();
            },
        );

        test("executor can reject a promise", (done) => {
            const rejectedPromise = createPromise((_, reject) => reject(21));

            const fixedPromise = rejectedPromise.then(undefined, (reason) => {
                return reason;
            });

            fixedPromise.then((value) => {
                expect(value).toBe(21);
                done();
            });
        });

        test(".then(onfulfilled) happy path", (done) => {
            createPromise((fulfill) => fulfill(42)).then((value) => {
                expect(value).toBe(42);
                done();
            });
        });

        test(".then(onfulfilled) callback is run asynchronously", async () => {
            const fn = jest.fn();
            const promise = createPromise<void>((fulfill) => fulfill()).then(
                fn,
            );

            expect(fn).toBeCalledTimes(0);

            await promise;

            expect(fn).toBeCalledTimes(1);
        });

        test(".then(onfulfilled) chain with another .then(onfulfilled)", (done) => {
            createPromise((fulfill) => fulfill(21))
                .then((value) => {
                    expect(value).toBe(21);
                    return 42;
                })
                .then((value) => {
                    expect(value).toBe(42);
                    done();
                });
        });

        test.each`
            title                  | fn
            ${"built in Promise"}  | ${(value: unknown) => Promise.resolve(value)}
            ${"my implementation"} | ${(value: unknown) => createPromise((resolve) => resolve(value))}
        `(
            ".then(onFulfill) flattens thenable result ($title)",
            ({ fn }, done) => {
                const promise = createPromise((fulfill) => {
                    fulfill(undefined);
                }).then(() => {
                    return fn(42);
                });

                promise.then((value) => {
                    expect(value).toBe(42);
                    done();
                });
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
                const promise = createPromise<void>((fulfill) =>
                    fulfill(),
                ).then(incorrectOnFulfillment);

                promise.then((value) => {
                    expect(value).toBeUndefined();
                    done();
                });
            },
        );

        test(".then(onFulfill) rejects when onFulfill throw an Error", (done) => {
            createPromise((resolve) => resolve(21))
                .then(() => {
                    throw Error("Promise resolver failed.");
                })
                .then(
                    () => undefined,
                    (reason) => {
                        expect(reason).toEqual(
                            Error("Promise resolver failed."),
                        );
                        done();
                    },
                );
        });

        test(".then(_, onReject) rejects promise when onReject throws an errors ", async () => {
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
                    (reason) => {
                        expect(reason).toEqual(Error("Promise reject failed."));
                    },
                ) as any);
        });

        test(".catch(onReject) resolves promise", (done) => {
            createPromise((_, reject) => reject(21))
                .catch((reason) => {
                    expect(reason).toBe(21);
                    return 42;
                })
                .then((value) => {
                    expect(value).toBe(42);
                    done();
                });
        });

        test(".catch(onReject) runs onReject callback asynchronously ", (done) => {
            const fn = jest.fn();
            const promise = createPromise<void>((_, reject) => reject()).catch(
                fn,
            );

            expect(fn).toBeCalledTimes(0);

            promise.then(() => {
                expect(fn).toBeCalledTimes(1);
                done();
            });
        });
    },
);
