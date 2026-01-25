export enum BodyType {
    JSON,
    FORMDATA,
}

export interface NetworkRequestableOptions<T> {
    url: string,
    body: T,
    bodyType: BodyType,
    method: 'POST' | 'GET',
    additionalHeaders?: HeadersInit,
    queryParams?: Record<string, string>,
    returnHeaders?: boolean,
}

export interface NetworkRequestableResponse<K> {
    data: K | undefined;
    headers: Headers;
}

export async function NetworkRequestable<T, K>(
    options: NetworkRequestableOptions<T>
): Promise<K | NetworkRequestableResponse<K> | undefined> {

    const { url, body, bodyType, method, additionalHeaders, queryParams } = options

    try {

        const headers: HeadersInit = {}
        
        let requestBody: BodyInit | undefined

        if (bodyType === BodyType.JSON) {
            headers['Content-Type'] = 'application/json'
            requestBody = JSON.stringify(body)
        } else if (bodyType === BodyType.FORMDATA) {
            requestBody = body as FormData
        }

        let finalUrl = url
        if (queryParams) {
            const params = new URLSearchParams(queryParams)
            finalUrl = `${url}?${params.toString()}`
        }

        console.log('--- Network Request ---')
        console.log(`Final URL: ${finalUrl}`)
        console.log(`Method: ${method}`)
        console.log('Headers:', { ...headers, ...additionalHeaders })
        console.log('Body:', bodyType === BodyType.JSON ? requestBody : 'FormData (not logged)')
        console.log('-----------------------')


        const response = await fetch(finalUrl, {
            method,
            headers: { ...headers, ...additionalHeaders },
            body: method === 'POST' ? requestBody : undefined,
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`Request failed with status code: ${response.status}`, errorText)
            return undefined
        }

        const responseText = await response.text()

        let data: K;
        try {
            data = JSON.parse(responseText) as K
        } catch (error) {
            data = responseText as K
        }

        if (options.returnHeaders) {
            return {
                data,
                headers: response.headers
            } as NetworkRequestableResponse<K>
        }

        return data

    } catch (error) {
        console.error('Network request failed:', error)
        return undefined
    }
}