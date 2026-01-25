import { Hono } from "hono";
import z from "zod";
import { BuildStatus } from "../../utils/build-status";
import { zValidator } from "@hono/zod-validator";
import { ContextError } from "../../utils/response/context-error";
import { BuildType } from "../../utils/build-type";
import { CdnManager } from "../../services/cdn-manager.ts/cdn-manager";
import EnvLoader from "../../services/env-loader";
import { ContextSuccess } from "../../utils/response/context-success";
import { ipaManifestGenerator } from "../../services/manifest/ipa-manifest-generator";
import { sendTelegramMessage, sendTelegramMessageWithPhoto } from "../../services/send-telegram-message";
import { qrcodeGenerator } from "../../services/qrcode/qrcode-generator";


const postUploadArtifacts = new Hono()

const bodySchema = z.object({
    buildFile: z.instanceof(File).refine((file) => file.size > 0, { message: "buildFile must not be empty" }),
    buildType: z.string().transform((val) => val.toUpperCase()).pipe(z.enum(Object.values(BuildType))).refine((type) => Object.values(BuildType).includes(type), { message: "Invalid build type" }),
    metadataFile: z.instanceof(File).refine((file) => file.size > 0, { message: "metadataFile must not be empty" }),
    jobName: z.string(),
    branchUrl: z.string(),
    buildStatus: z.string().transform((val) => val.toUpperCase()).pipe(z.enum(Object.values(BuildStatus))).refine((status) => Object.values(BuildStatus).includes(status), { message: "Invalid build status" }),
    buildNumber: z.string(),
    bundleIdentifier: z.string(),
    bundleVersion: z.string(),
    title: z.string(),
    message: z.string().optional(),
    buildEnvironment: z.string().optional(),
})

postUploadArtifacts.post(
    "/upload-artifacts",
    zValidator("form", bodySchema),
    async (c) => {
        try {

            const envLoader = EnvLoader.getInstance()

            const reqBody = await c.req.parseBody()

            const body = bodySchema.safeParse(reqBody)

            if (!body.success) {
                throw new Error("Invalid request body")
            }

            if (body.data.buildStatus !== BuildStatus.SUCCESS) {
                const message = `Build upload skipped for *Flutter-pipeline* - Build #${body.data.buildNumber} due to build status: ${body.data.buildStatus}`

                await sendTelegramMessage(message)

                return ContextSuccess(
                    c,
                    {},
                    { message: "Build not successful, upload skipped", code: 2201 },
                    "Build not successful, upload skipped"
                )
            }

            const cdnManager = new CdnManager()

            const buildFileKey = `${envLoader.S3Path}/builds/Flutter-pipeline/build-${body.data.buildNumber}/${body.data.buildFile.name}`

            const uploadBuild = await cdnManager.uploadFile({
                file: body.data.buildFile,
                mediaKey: buildFileKey,
            })

            const metadataFileKey = `${envLoader.S3Path}/builds/Flutter-pipeline/build-${body.data.buildNumber}/metadata.json`

            const uploadMetadata = await cdnManager.uploadFile({
                file: body.data.metadataFile,
                mediaKey: metadataFileKey,
            })

            switch (body.data.buildType) {
                case BuildType.APK:
                case BuildType.AAB:

                    const telegramResponse = await sendTelegramMessage(
                        `New ${body.data.buildType} build uploaded for *Flutter-pipeline* - Build #${body.data.buildNumber}\n\n` +
                        `Build URL: ${uploadBuild} \n\n` +
                        `Message: ${body.data.message ?? "No additional message provided."} \n\n` +
                        `Build Environment: ${body.data.buildEnvironment ?? "Not specified."}`
                    )
                    break
                case BuildType.IPA:
                    const manifestFileKey = `${envLoader.S3Path}/builds/Flutter-pipeline/build-${body.data.buildNumber}/manifest.plist`

                    const manifestFile = ipaManifestGenerator(
                        uploadBuild,
                        body.data.bundleIdentifier,
                        body.data.bundleVersion,
                        body.data.title
                    )

                    if (manifestFile) {
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
                            `New IPA build uploaded for *Flutter-pipeline* - Build #${body.data.buildNumber} \n\n` +
                            `Build URL: ${uploadBuild} \n\n` +
                            `Manifest URL: ${uploadManifest} \n\n` +
                            `Message: ${body.data.message ?? "No additional message provided."} \n\n` +
                            `Build Environment: ${body.data.buildEnvironment ?? "Not specified."}`
                        )

                        return ContextSuccess(
                            c,
                            {
                                buildFileUrl: uploadBuild,
                                metadataFileUrl: uploadMetadata,
                                manifestFileUrl: uploadManifest,
                            },
                            { message: "Artifacts uploaded successfully", code: 2200 },
                            "Artifacts uploaded successfully"
                        )
                    }
            }

            return ContextSuccess(
                c,
                {
                    buildFileUrl: uploadBuild,
                    metadataFileUrl: uploadMetadata,
                },
                { message: "Artifacts uploaded successfully", code: 2200 },
                "Artifacts uploaded successfully"
            )


        } catch (error) {

            console.error("Error in /jenkins upload-artifacts:", error)

            return ContextError(
                c,
                { code: 2002, message: "Internal server error" },
                "An error occurred while uploading artifacts."
            )

        }
    }
)

export default postUploadArtifacts