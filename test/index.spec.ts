import { KitHttpError } from "http-error-kit";
import { KitZodTransformer } from "../src";
import { ZodError } from "zod";

describe("KitFastifyMiddleware", () => {
    it("should return Kit error when provided error is ZodError", () => {
        try {
            const error = new ZodError([
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "number",
                    path: ["b"],
                    message: "Expected string, received number",
                },
            ]);
            KitZodTransformer(error);
        } catch (error: any) {
            expect(error).toBeInstanceOf(KitHttpError);
        }
    });

    it("should return same error when provided error is not ZodError", () => {
        try {
            const error = new Error("Test error");
            KitZodTransformer(error);
        } catch (error: any) {
            expect(error).toBeInstanceOf(Error);
        }
    });

    it("should return same error when provided error is ZodError & some error occured", () => {
        try {
            jest.resetModules();
            jest.mock("http-error-kit", () => ({
                KitHttpError: jest.fn().mockImplementation(() => {
                    throw new Error("Mocked constructor failure");
                }),
            }));
            const error = new ZodError([]);
            KitZodTransformer(error);
        } catch (error: any) {
            expect(error).toBeInstanceOf(Error);
        }
    });
});
