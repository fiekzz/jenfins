import { Context } from "hono"
import { BlankEnv, BlankInput } from "hono/types"


export interface ISuccessType {
    message: string
    code: number
}

export const SuccessType = {
    BUILD_STARTED: { code: 2001, message: "Build process started successfully" },
    BUILD_COMPLETED: { code: 2002, message: "Build process completed successfully" },
    SUCCESS: { code: 2000, message: "Request processed successfully" },
} as const

export function ContextSuccess<T>(context: Context<BlankEnv, "", BlankInput>, data: T, type: ISuccessType, message?: string) {
    return context.json({
        data,
        message: message || type.message,
        success: true,
    }, type.code >= 2000 && type.code < 3000 ? 200 : 201)
}