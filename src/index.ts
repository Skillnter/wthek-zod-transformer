import { ZodError } from "zod";
import { KitHttpError } from "http-error-kit";
import { BAD_REQUEST } from "http-response-status-code";

/**
 * Transforms a ZodError into a structured KitHttpError with a BadRequest status.
 * If the provided error is not an instance of ZodError, it is thrown unchanged.
 *
 * @param {unknown} error The error to check and transform. If it is not a ZodError, it is thrown as-is.
 * @returns {unknown} The transformed error.
 * @throws {unknown} If the error is not a ZodError, it is thrown as-is.
 */
export function KitZodTransformer(error: unknown): unknown {
    try {
        if (error instanceof ZodError) {
            throw new KitHttpError(BAD_REQUEST, "Zod Validation Failed", {
                issues: error.issues,
            });
        }
    } catch (err) {
        throw err;
    }
    throw error;
}
