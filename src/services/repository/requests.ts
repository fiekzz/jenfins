import { BodyType, NetworkRequestable, NetworkRequestableOptions, NetworkRequestableResponse } from "../../utils/network-requestable";
import { IJenkinsBuildTriggerRequest, IJenkinsCrumbResponse } from "./models";


export async function GETJenkinsCrumb(
    jenkinsUrl: string,
    username: string,
    password: string,
) {

    const headers: HeadersInit = {}

    headers['Authorization'] = 'Basic ' + btoa(`${username}:${password}`)

    const options: NetworkRequestableOptions<null> = {
        url: `${jenkinsUrl}/crumbIssuer/api/json`,
        body: null,
        bodyType: BodyType.JSON,
        method: "GET",
        additionalHeaders: headers,
        returnHeaders: true,
    }

    const response = await NetworkRequestable<null, IJenkinsCrumbResponse>(options) as NetworkRequestableResponse<IJenkinsCrumbResponse>

    const cookies = response?.headers?.get('set-cookie') || ''

    return {
        data: response?.data,
        cookie: cookies,
    }
}

export async function POSTJenkinsBuildTrigger(
    props: IJenkinsBuildTriggerRequest,
) {
    const headers: HeadersInit = {}

    headers['Authorization'] = 'Basic ' + btoa(`${props.username}:${props.password}`)
    headers[props.crumbRequestField] = props.crumb
    
    if (props.cookie) {
        headers['Cookie'] = props.cookie
    }

    const parameters: Record<string, string> = {
        'CUSTOM_BRANCH': props.parameters.CUSTOM_BRANCH,
        'BUILD_TYPE': props.parameters.BUILD_TYPE,
        'BUILD_VARIANT': props.parameters.BUILD_VARIANT,
        'MESSAGE': props.parameters.MESSAGE || '',
        'token': props.parameters.token || '',
        'BEARER_TOKEN': props.parameters.BEARER_TOKEN || '',
    }

    const options: NetworkRequestableOptions<null> = {
        url: `${props.jenkinsUrl}/job/${encodeURIComponent(props.jobName)}/buildWithParameters`,
        body: null,
        bodyType: BodyType.JSON,
        method: "POST",
        additionalHeaders: headers,
        queryParams: parameters,
    }

    const response = await NetworkRequestable<null, null>(options)

    return response
}