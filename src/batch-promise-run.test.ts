import { batchPromiseRun } from "./batch-promise-run";

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
});
