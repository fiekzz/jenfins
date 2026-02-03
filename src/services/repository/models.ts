import { BuildType } from "../../utils/build-type";
import { BuildVariant } from "../../utils/build-variant";

export interface IJenkinsCrumbResponse {
    _class: string;
    crumb: string;
    crumbRequestField: string;
}

export interface IJenkinsBuildTriggerRequest {
    crumb: string;
    crumbRequestField: string;
    username: string;
    password: string;
    cookie?: string;
    jenkinsUrl: string;
    jobName: string;
    parameters: {
        CUSTOM_BRANCH: string;
        BUILD_TYPE: BuildType;
        BUILD_VARIANT: BuildVariant;
        MESSAGE?: string;
        token?: string;
        BEARER_TOKEN?: string;
    },
}