import { Hono } from "hono";
import { ContextSuccess } from "../../utils/response/context-success";
import { ContextError } from "../../utils/response/context-error";
import { z } from "zod";
import { sendTelegramMessage } from "../../services/send-telegram-message";
import { BuildStatus } from "../../utils/build-status";
import { TelegramMessages } from "../../utils/messages/telegram-messages";
import { zValidator } from "@hono/zod-validator";
import AuthenticationService from "../../services/auth/authentication-service";
import { authenticatedAppRoute } from "../../services/hono/hono-app";
import { appValidator } from "../../services/hono/validator";

const postNotify = authenticatedAppRoute()

const bodySchema = z.object({
    jobName: z.string(),
    branchUrl: z.string(),
    buildStatus: z.enum(Object.values(BuildStatus)).refine((status) => Object.values(BuildStatus).includes(status), { message: "Invalid build status" }),
    buildNumber: z.string(),
    message: z.string().optional(),
})

type BodySchema = z.infer<typeof bodySchema>

postNotify.post(
    "/session/notify",
    async (c, next) => {
        const authService = AuthenticationService.getInstance()
        return authService.checkRevokation(c, next)
    },
    appValidator('json', bodySchema),
    async (c) => {

        try {

            const body = await c.req.json<BodySchema>()

            const message = TelegramMessages.jenkinsNotifyBuilding(
                body.jobName,
                body.branchUrl,
                body.buildStatus,
                body.buildNumber,
                body.message,
            )

            const teleResponse = await sendTelegramMessage(message)

            return ContextSuccess(
                c,
                { telegramResponse: teleResponse },
                { message: "Jenkins notification sent successfully", code: 2100 },
                "Jenkins notification sent successfully"
            )

        } catch (error) {

            console.error("Error in /jenkins notify:", error)

            return ContextError(
                c,
                { code: 2001, message: "Internal server error" },
                "An error occurred while processing the notification."
            )

        }

    }
)

export default postNotify