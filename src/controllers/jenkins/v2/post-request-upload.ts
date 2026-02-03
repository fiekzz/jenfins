import z from "zod";
import { authenticatedAppRoute } from "../../../services/hono/hono-app";
import { BuildType } from "../../../utils/build-type";
import { zValidator } from "@hono/zod-validator";
import { appValidator } from "../../../services/hono/validator";
import EnvLoader from "../../../services/env-loader";
import { AwsClient } from "aws4fetch";
import { ContextSuccess } from "../../../utils/response/context-success";
import { ContextError } from "../../../utils/response/context-error";
import { CdnManager, IPresignedConfig } from "../../../services/cdn-manager.ts/cdn-manager";
import AuthenticationService from "../../../services/auth/authentication-service";


const postRequestUpload = authenticatedAppRoute()

const bodySchema = z.object({
    buildType: z.string().transform((val) => val.toUpperCase()).pipe(z.enum(Object.values(BuildType))).refine((type) => Object.values(BuildType).includes(type), { message: "Invalid build type" }),
    fileName: z.string(),
    buildNumber: z.string()
})

type BodySchema = z.infer<typeof bodySchema>

postRequestUpload.post(
    '/session/request-upload',
    async (c, next) => {
        const authService = AuthenticationService.getInstance()
        return authService.checkRevokation(c, next)
    },
    appValidator('json', bodySchema),
    async (c) => {

        try {

            const envLoader = EnvLoader.getInstance()

            const body = await c.req.json<BodySchema>()

            const cdnManager = new CdnManager()

            // Generate presigned URL for the package file
            const fileKey = `${envLoader.S3Path}/builds/Flutter-pipeline/build-${body.buildNumber}/${body.fileName}`
            const expiresIn = 60 * 60 // 60 minutes
            const packageConfig: IPresignedConfig = {
                mediaKey: fileKey,
                expiresIn: expiresIn,
            }
            const packageObject = await cdnManager.createPresignedUrl(packageConfig)

            // Generate presigned URL for the metadata file
            const metadataFileKey = `${envLoader.S3Path}/builds/Flutter-pipeline/build-${body.buildNumber}/metadata.json`
            const metadataConfig: IPresignedConfig = {
                mediaKey: metadataFileKey,
                expiresIn: expiresIn,
            }
            const metadataObject = await cdnManager.createPresignedUrl(metadataConfig)


            return ContextSuccess(
                c,
                {
                    packageObject,
                    metadataObject
                },
                { message: "Presigned URL generated successfully", code: 2401 },
                "Presigned URL generated successfully"
            )

        } catch (error) {

            console.error("Error in /upload-artifacts:", error)

            return ContextError(
                c,
                { code: 2002, message: "Internal server error" },
                "An error occurred while uploading artifacts."
            )
        }
    }
)

export default postRequestUpload