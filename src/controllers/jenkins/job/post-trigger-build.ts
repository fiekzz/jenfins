import { Hono } from "hono";
import z, { ZodError } from "zod";
import { BuildType } from "../../../utils/build-type";
import { BuildVariant } from "../../../utils/build-variant";
import { zValidator } from "@hono/zod-validator";
import { NetworkRequestable } from "../../../utils/network-requestable";
import { GETJenkinsCrumb, POSTJenkinsBuildTrigger } from "../../../services/repository/requests";
import { ContextSuccess } from "../../../utils/response/context-success";
import { ContextError } from "../../../utils/response/context-error";
import { IJenkinsBuildTriggerRequest } from "../../../services/repository/models";

const postTriggerBuild = new Hono()

const bodySchema = z.object({
    username: z.string(),
    password: z.string(),
    branchName: z.string(),
    buildType: z.string().transform((val) => val.toUpperCase()).pipe(z.enum(Object.values(BuildType))).refine((type) => Object.values(BuildType).includes(type), { message: "Invalid build type" }),
    buildVariant: z.string().transform((val) => val.toLowerCase()).pipe(z.enum(Object.values(BuildVariant))).refine((type) => Object.values(BuildVariant).includes(type), { message: "Invalid build variant" }),
    message: z.string().optional(),
    token: z.string().optional(),
})

type BodySchema = z.infer<typeof bodySchema>

postTriggerBuild.post(
    '/trigger-build',
    zValidator("json", bodySchema, (result, c) => {
        if (!result.success) {

            const error = JSON.parse(result.error.message)

            const errorMessage = error[0]?.message || "Invalid request body"

            return ContextError(
                c,
                { code: 2302, message: errorMessage },
                "The request body is invalid.",
                { errors: error }
            )
        }
    }),
    async (c) => {

        try {

            const body = await c.req.json<BodySchema>()

            const getCrumbResponse = await GETJenkinsCrumb(
                'https://fiekzz-jenkins.fiekzz.com',
                body.username,
                body.password,
            )

            if (!getCrumbResponse?.data?.crumb || !getCrumbResponse?.data?.crumbRequestField) {
                throw new Error("Failed to fetch Jenkins crumb")
            }

            const request: IJenkinsBuildTriggerRequest = {
                crumb: getCrumbResponse.data.crumb,
                crumbRequestField: getCrumbResponse.data.crumbRequestField,
                username: body.username,
                password: body.password,
                cookie: getCrumbResponse.cookie,
                jenkinsUrl: 'https://fiekzz-jenkins.fiekzz.com',
                jobName: 'Flutter-iOS-Build',
                parameters: {
                    CUSTOM_BRANCH: body.branchName,
                    BUILD_TYPE: body.buildType,
                    BUILD_VARIANT: body.buildVariant,
                    MESSAGE: body.message,
                    token: body.token,
                },
            }

            const triggerBuildResponse = await POSTJenkinsBuildTrigger(request)

            return ContextSuccess(
                c,
                {
                    jenkinsResponse: triggerBuildResponse,
                },
                { message: "Jenkins crumb fetched successfully", code: 2300 },
                "Jenkins crumb fetched successfully"
            )

        } catch (error) {

            console.error("Error in /jenkins trigger-build:", error)

            return ContextError(
                c,
                { code: 2301, message: "Internal server error" },
                "An error occurred while triggering the build."
            )

        }

    }
)

export default postTriggerBuild