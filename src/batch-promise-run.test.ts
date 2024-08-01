import { batchPromiseRun } from "./batch-promise-run";

describe("batchPromiseRun", () => {
    it("Collects job results as data", async () => {
        const result = await batchPromiseRun([
            () => Promise.resolve("Foobar"),
            () => Promise.resolve("BazBar"),
        ]);
        expect(result.length).toBe(2);
        expect((result[0] as any).data).toBe("Foobar");
        expect((result[1] as any).data).toBe("BazBar");
    });

    it("Collects job failures", async () => {
        const result = await batchPromiseRun([
            () => Promise.reject(Error("Job failed")),
            () => Promise.resolve("Ok"),
        ]);

        expect(result.length).toBe(2);
        expect(result[0]).toEqual({
            isResolved: false,
            isRejected: true,
            error: Error("Job failed"),
        });

        expect(result[1]).toEqual({
            isResolved: true,
            isRejected: false,
            data: "Ok",
        });
    });
});
