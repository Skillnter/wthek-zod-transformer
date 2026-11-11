import { KitHttpError } from "http-error-kit";
import { KitZodTransformer, fromZodError } from "../src";
import { z, ZodError } from "zod";
import { UNPROCESSABLE_ENTITY } from "http-response-status-code";

describe("KitZodTransformer", () => {
    const sampleZodError = z
        .object({ username: z.string() })
        .safeParse({ username: 123 }).error!;

    it("should throw KitHttpError when provided error is ZodError", () => {
        expect(() => KitZodTransformer(sampleZodError)).toThrow(KitHttpError);
    });

    it("should throw KitHttpError with default message and status code", () => {
        try {
            KitZodTransformer(sampleZodError);
        } catch (err: any) {
            expect(err).toBeInstanceOf(KitHttpError);
            expect(err.message).toBe("Zod Validation Failed");
            expect(err.getInputs()?.statusCode).toBe(400);
            expect((err.details as any)?.issues).toEqual(sampleZodError.issues);
        }
    });

    it("should respect custom message and status code options when throwing", () => {
        try {
            KitZodTransformer(sampleZodError, {
                message: "Custom Validation Error",
                statusCode: UNPROCESSABLE_ENTITY,
            });
        } catch (err: any) {
            expect(err).toBeInstanceOf(KitHttpError);
            expect(err.message).toBe("Custom Validation Error");
            expect(err.getInputs()?.statusCode).toBe(422);
        }
    });

    it("should throw original error when error is not a ZodError", () => {
        const regularError = new Error("Standard runtime error");
        expect(() => KitZodTransformer(regularError)).toThrow(regularError);
    });

    it("should rethrow non-error values unchanged", () => {
        expect(() => KitZodTransformer("string error")).toThrow("string error");
    });
});

describe("fromZodError", () => {
    const sampleZodError = z
        .object({ email: z.string() })
        .safeParse({ email: 123 }).error!;

    it("should return KitHttpError when error is a ZodError", () => {
        const result = fromZodError(sampleZodError);
        expect(result).toBeInstanceOf(KitHttpError);
        expect(result?.message).toBe("Zod Validation Failed");
        expect(result?.getInputs()?.statusCode).toBe(400);
        expect((result?.details as any)?.issues).toEqual(sampleZodError.issues);
    });

    it("should respect custom options for message and status code", () => {
        const result = fromZodError(sampleZodError, {
            message: "Input validation error",
            statusCode: UNPROCESSABLE_ENTITY,
        });
        expect(result).toBeInstanceOf(KitHttpError);
        expect(result?.message).toBe("Input validation error");
        expect(result?.getInputs()?.statusCode).toBe(422);
    });

    it("should return null when error is a standard Error", () => {
        const result = fromZodError(new Error("Generic error"));
        expect(result).toBeNull();
    });

    it("should return null when error is null or undefined", () => {
        expect(fromZodError(null)).toBeNull();
        expect(fromZodError(undefined)).toBeNull();
    });
});
