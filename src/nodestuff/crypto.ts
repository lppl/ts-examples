import * as crypto from "node:crypto";
import { Buffer } from "node:buffer";
import assert from "node:assert/strict";

export function createEncoder(password: string, secret_iv: string) {
    assert(typeof password === "string");
    assert(typeof secret_iv === "string");

    const algorithm = "aes-256-cbc";
    const iv = crypto
        .createHash("sha512")
        .update(secret_iv)
        .digest("hex")
        .substring(0, 16);

    function createKey(salt: string) {
        return crypto
            .createHash("sha512")
            .update(password)
            .update(salt)
            .digest("hex")
            .substring(0, 32);
    }

    function encode(salt: string, rawText: string): string {
        try {
            const cipher = crypto.createCipheriv(
                algorithm,
                createKey(salt),
                iv,
                {},
            );
            let encoded = cipher.update(rawText, "utf8", "hex");
            encoded += cipher.final("hex");
            return Buffer.from(encoded).toString("base64");
        } catch (e) {
            throw Error("Failed to encode rawText", { cause: e });
        }
    }

    function decode(salt: string, encodedText: string): string {
        try {
            const decipher = crypto.createDecipheriv(
                algorithm,
                createKey(salt),
                iv,
                {},
            );
            let decoded = decipher.update(
                Buffer.from(encodedText, "base64").toString("utf8"),
                "hex",
                "utf8",
            );
            decoded += decipher.final("utf8");
            return decoded;
        } catch (e) {
            throw Error("Failed to decode encodedText", { cause: e });
        }
    }

    return {
        encode,
        decode,
    };
}
