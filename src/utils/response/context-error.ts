import { Context } from "hono";
import { BlankEnv, BlankInput } from "hono/types";


interface IErrorType {
    code: number,
    message: string
}

export const ErrorType = {
    BAD_REQUEST: { code: 1001, message: "Invalid request parameters" },
    UNAUTHORIZED: { code: 1002, message: "Unauthorized access" },
    BUILD_FAILED: { code: 1003, message: "Build process failed" },
    NOT_FOUND: { code: 1004, message: "Requested resource not found" },
    BAD_GATEWAY: { code: 1005, message: "Bad gateway" },
    INTERNAL_SERVER_ERROR: { code: 2001, message: "Internal server error" },
} as const

export function ContextError(context: Context<BlankEnv, "/build", BlankInput>, type: IErrorType, message: string, data: object = {}) {
    return context.json({
        error: message,
        success: false,
        data: data,
    }, type.code >= 1000 && type.code < 2000 ? 400 : 500)
}