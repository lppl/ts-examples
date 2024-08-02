import { batchPromiseRun } from "./batch-promise-run";
import { createPromiseSpy, waitFor, waitForMs } from "./test-utils";
import { describe, it, afterEach, expect, setSystemTime } from "bun:test";

describe("batchPromiseRun", () => {
    it("Collects job results as data", async () => {
        const result = await batchPromiseRun([
            () => Promise.resolve("Foobar"),
            () => Promise.resolve("BazBar"),
        ]);
        expect(result.length).toBe(2);
        expect(result[0]).toHaveProperty("data", "Foobar");
        expect(result[1]).toHaveProperty("data", "BazBar");
    });

    it("Collects job failures as error", async () => {
        const result = await batchPromiseRun([
            () => Promise.reject(Error("Foobar")),
            () => Promise.reject(Error("BazBar")),
        ]);
        expect(result.length).toBe(2);
        expect(result[0]).toHaveProperty("error", Error("Foobar"));
        expect(result[1]).toHaveProperty("error", Error("BazBar"));
    });

    it("Indicates result status with flags isResolved/isRejected", async () => {
        const result = await batchPromiseRun([
            () => Promise.reject(Error("Job failed")),
            () => Promise.resolve("Ok"),
        ]);

        expect(result.length).toBe(2);
        expect(result[0]).toHaveProperty("isResolved", false);
        expect(result[0]).toHaveProperty("isRejected", true);
        expect(result[1]).toHaveProperty("isResolved", true);
        expect(result[1]).toHaveProperty("isRejected", false);
    });

    it("It takes number of jobs for one batch", async () => {
        const first = createPromiseSpy();
        const second = createPromiseSpy();
        const third = createPromiseSpy();

        const promiseRun = batchPromiseRun([first.fn, second.fn, third.fn], 1);

        expect(first.fn).toHaveBeenCalled();
        expect(second.fn).not.toHaveBeenCalled();

        first.resolve("First");
        await waitFor(() => expect(second.fn).toHaveBeenCalled());
        expect(third.fn).not.toHaveBeenCalled();

        second.resolve("Second");
        third.resolve("Third");

        const result = await promiseRun;

        expect(result[0]).toHaveProperty("data", "First");
        expect(result[1]).toHaveProperty("data", "Second");
        expect(result[2]).toHaveProperty("data", "Third");
    });

    it("Results of promise keep the order of job initiators", async () => {
        const first = createPromiseSpy();
        const second = createPromiseSpy();
        const third = createPromiseSpy();

        const promiseRun = batchPromiseRun([first.fn, second.fn, third.fn], 3);

        setTimeout(() => first.resolve("First"), 2);
        setTimeout(() => second.resolve("Second"), 3);
        setTimeout(() => third.resolve("Third"), 1);

        const result = await promiseRun;

        expect(result[0]).toHaveProperty("data", "First");
        expect(result[1]).toHaveProperty("data", "Second");
        expect(result[2]).toHaveProperty("data", "Third");
    });

    it("Results keep track of duration of the call", async () => {
        const first = createPromiseSpy();
        const second = createPromiseSpy();

        setSystemTime(new Date("2020-01-01T00:00:00.000Z"));
        const promiseRun = batchPromiseRun([first.fn, second.fn], 1);

        setSystemTime(new Date("2020-01-01T00:00:02.000Z"));
        first.resolve("First");

        await waitForMs();
        setSystemTime(new Date("2020-01-01T00:00:05.000Z"));
        second.reject();

        const result = await promiseRun;

        console.log(result);
        expect(result[0]).toHaveProperty("durationMs", 2000);
        expect(result[1]).toHaveProperty("durationMs", 3000);
    });

    afterEach(() => {
        setSystemTime();
    });
});
