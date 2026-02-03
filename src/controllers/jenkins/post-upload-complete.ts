import z from "zod";
import { authenticatedAppRoute } from "../../services/hono/hono-app";
import { appValidator } from "../../services/hono/validator";
import { ContextError } from "../../utils/response/context-error";
import { BuildType } from "../../utils/build-type";
import { ipaManifestGenerator } from "../../services/manifest/ipa-manifest-generator";
import EnvLoader from "../../services/env-loader";
import { CdnManager } from "../../services/cdn-manager.ts/cdn-manager";
import { qrcodeGenerator } from "../../services/qrcode/qrcode-generator";
import { sendTelegramMessage, sendTelegramMessageWithPhoto } from "../../services/send-telegram-message";
import { ContextSuccess } from "../../utils/response/context-success";
import AuthenticationService, { authenticatedMiddleware } from "../../services/auth/authentication-service";


const postUploadComplete = authenticatedAppRoute()

const bodySchema = z.object({
    buildUrl: z.string(),
    buildType: z.string().transform((val) => val.toUpperCase()).pipe(z.enum(Object.values(BuildType))).refine((type) => Object.values(BuildType).includes(type), { message: "Invalid build type" }),
    objectKey: z.string(),
    bundleIdentifier: z.string(),
    bundleVersion: z.string(),
    buildNumber: z.string(),
    title: z.string(),
    message: z.string().optional(),
    buildEnvironment: z.string().optional(),
})

type BodySchema = z.infer<typeof bodySchema>

postUploadComplete.post(
    '/session/upload-complete',
    authenticatedMiddleware,
    appValidator('json', bodySchema),
    async (c) => {
        try {

            const body = await c.req.json<BodySchema>()

            if (body.buildType === BuildType.IPA) {

                const envLoader = EnvLoader.getInstance()

                const manifestFileKey = `${envLoader.S3Path}/builds/Flutter-pipeline/build-${body.buildNumber}/manifest.plist`

                const manifestFile = ipaManifestGenerator(
                    body.buildUrl,
                    body.bundleIdentifier,
                    body.bundleVersion,
                    body.title
                )

                if (!manifestFile) {
                    throw new Error("Failed to generate IPA manifest file")
                }

                const cdnManager = new CdnManager()

                const uploadManifest = await cdnManager.uploadFile({
                    file: manifestFile,
                    mediaKey: manifestFileKey,
                })

                const photo = await qrcodeGenerator(`itms-services://?action=download-manifest&url=${encodeURIComponent(uploadManifest)}`)

                if (!photo) {
                    throw new Error("Failed to generate QR code for IPA manifest")
                }

                const telegramResponse = await sendTelegramMessageWithPhoto(
                    photo,
                    `New IPA build uploaded for <b>Flutter-pipeline</b> - Build #${body.buildNumber}\n\n` +
                    `Build URL: ${body.buildUrl}\n\n` +
                    `Manifest URL: ${uploadManifest}\n\n` +
                    `Message: ${body.message ?? "No additional message provided."}\n\n` +
                    `Build Environment: ${body.buildEnvironment ?? "Not specified."}`
                )
            } else {

                const telegramResponse = await sendTelegramMessage(
                    `New ${body.buildType} build uploaded for *Flutter-pipeline* - Build #${body.buildNumber}\n\n` +
                    `Build URL: ${body.buildUrl} \n\n` +
                    `Message: ${body.message ?? "No additional message provided."} \n\n` +
                    `Build Environment: ${body.buildEnvironment ?? "Not specified."}`
                )
            }

            return ContextSuccess(
                c,
                {},
                { message: "Upload completion processed successfully", code: 2501 },
                "Upload completion processed successfully"
            )


        } catch (error) {

            console.error("Error in /upload-complete:", error)

            return ContextError(
                c,
                { code: 2102, message: "Internal server error" },
                "An error occurred while completing the upload."
            )
        }
    }
)

export default postUploadComplete