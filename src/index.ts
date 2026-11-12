import { ZodError } from "zod";
import { KitHttpError } from "http-error-kit";
import { BAD_REQUEST } from "http-response-status-code";

/**
 * Configuration options for KitZodTransformer and fromZodError.
 */
export interface IKitZodTransformerOptions {
    /**
     * Custom message for the transformed error.
     *
     * @default "Zod Validation Failed"
     */
    message?: string;

    /**
     * Custom HTTP status code for the validation error.
     *
     * @default 400 (BAD_REQUEST)
     */
    statusCode?: number;
}

/**
 * Converts a ZodError into a KitHttpError instance without throwing.
 * Returns null if the provided error is not an instance of ZodError.
 *
 * @param {unknown} error The error to check and transform.
 * @param {IKitZodTransformerOptions} [options] Optional configuration for the transformed error.
 * @returns {KitHttpError | null} The transformed KitHttpError, or null if not a ZodError.
 *
 * @example
 * ```typescript
 * import { fromZodError } from "@wthek/zod-transformer";
 *
 * const kitError = fromZodError(error, { message: "Invalid Input" });
 * if (kitError) {
 *     // handle kitError
 * }
 * ```
 */
export function fromZodError(
    error: unknown,
    options?: IKitZodTransformerOptions
) {
    if (error instanceof ZodError) {
        const { message = "Zod Validation Failed", statusCode = BAD_REQUEST } =
            options ?? {};
        return new KitHttpError(statusCode, message, {
            issues: error.issues,
        });
    }
    return null;
}

/**
 * Transforms a ZodError into a structured KitHttpError with a BadRequest status
 * and throws it. If the provided error is not an instance of ZodError, it is
 * thrown unchanged.
 *
 * @param {unknown} error The error to check and transform.
 * @param {IKitZodTransformerOptions} [options] Optional configuration for the transformed error.
 * @throws {KitHttpError} If the error is a ZodError.
 * @throws {unknown} If the error is not a ZodError, it is thrown as-is.
 *
 * @example
 * ```typescript
 * import { KitZodTransformer } from "@wthek/zod-transformer";
 *
 * try {
 *     schema.parse(data);
 * } catch (err) {
 *     KitZodTransformer(err); // Throws KitHttpError if ZodError, or rethrows err
 * }
 * ```
 */
export function KitZodTransformer(
    error: unknown,
    options?: IKitZodTransformerOptions
): never {
    const kitError = fromZodError(error, options);
    if (kitError) {
        throw kitError;
    }
    throw error;
}
