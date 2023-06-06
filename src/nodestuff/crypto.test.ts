import { createEncoder } from "./crypto";

describe("Encoding and decoding strings", function () {
    describe.each([[""], ["Lorem ipsum dolor somit facken smash"]])(
        "Valid input no%#. %j",
        (rawText) => {
            const { encode, decode } = createEncoder("foo", "bar");
            const salt = "wieliczka-salt";
            const differentSalt = "himalayan-salt";

            it("encrypted should be different than encoded", function () {
                expect(encode(salt, rawText)).not.toBe(rawText);
            });
            it("decoded should be same as ", function () {
                expect(decode(salt, encode(salt, rawText))).toBe(rawText);
            });
            it("should create different text for different keys ", function () {
                expect(encode(salt, rawText)).not.toBe(
                    encode(differentSalt, rawText),
                );
            });
        },
    );

    describe.each([null, undefined, 3333, {}, new Date()])(
        "Invalid input no%#. %j",
        (invalidInput) => {
            const { encode, decode } = createEncoder("foo", "bar");
            const rawText = "foobar";
            const salt = "wieliczka-salt";

            it("encode throws for invalid rawText", function () {
                expect(() => encode(salt, invalidInput as any)).toThrow();
            });
            it("decode throws for invalid rawText", function () {
                expect(() => decode(salt, invalidInput as any)).toThrow();
            });
            it("encode throws for invalid salt", function () {
                expect(() => encode(invalidInput as any, rawText)).toThrow();
            });
            it("decode throws for invalid salt", function () {
                expect(() => decode(invalidInput as any, rawText)).toThrow();
            });
            it("createEncoder throws for invalid password", function () {
                expect(() =>
                    createEncoder(invalidInput as any, "bar"),
                ).toThrow();
            });
            it("createEncoder throws for invalid secret_iv", function () {
                expect(() =>
                    createEncoder("foo", invalidInput as any),
                ).toThrow();
            });
        },
    );
});
