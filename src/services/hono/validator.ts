import { zValidator } from "@hono/zod-validator";
import { ContextError } from "../../utils/response/context-error";
import { ValidationTargets } from "hono";
import z from "zod";


export function appValidator<T extends z.ZodRawShape>(type: keyof ValidationTargets, bodySchema: z.ZodObject<T>) {

    return zValidator(type, bodySchema, (result, c) => {
        if (!result.success) {

            const error = JSON.parse(result.error.message)

            const errorMessage = error[0]?.message || "Invalid request body"

            console.error("Validation error:", error)

            return ContextError(
                c,
                { code: 2202, message: errorMessage },
                "The request body is invalid.",
                { errors: error }
            )
        }
    });
}