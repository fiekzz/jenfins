import { BodyType, NetworkRequestable, NetworkRequestableOptions } from "../utils/network-requestable"
import EnvLoader from "./env-loader"

export async function sendTelegramMessage(message: string | null) {

    if (!message) {
        return
    }

    const envLoader = EnvLoader.getInstance()

    const chatId = envLoader.TelegramChannelId

    const botToken = envLoader.TelegramApiKey

    if (!chatId || !botToken) {
        return
    }

    var request: RequestBody = {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`

    const options: NetworkRequestableOptions<RequestBody> = {
        url: url,
        body: request,
        bodyType: BodyType.JSON,
        method: "POST",
    }

    const response = await NetworkRequestable<RequestBody, string>(options)

    if (!response) {
        return undefined
    }

    return response
}

export async function sendTelegramMessageWithPhoto(photo: File, caption: string | null) {

    if (!photo) {
        return
    }

    const envLoader = EnvLoader.getInstance()

    const chatId = envLoader.TelegramChannelId

    const botToken = envLoader.TelegramApiKey

    if (!chatId || !botToken) {
        return
    }

    // File in uint8array format

    const uint8Array = new Uint8Array(await photo.arrayBuffer())

    const photoBlob = new Blob([uint8Array], { type: photo.type })

    const formData = new FormData()

    formData.append('chat_id', chatId)
    formData.append('photo', photoBlob)

    if (caption) {
        formData.append('caption', caption)
        formData.append('parse_mode', 'HTML')
    }

    const url = `https://api.telegram.org/bot${botToken}/sendPhoto`

    const options: NetworkRequestableOptions<FormData> = {
        url: url,
        body: formData,
        bodyType: BodyType.FORMDATA,
        method: "POST",
    }

    const response = await NetworkRequestable<FormData, string>(options)

    if (!response) {
        return undefined
    }

    return response
}

export async function sendTelegramMessageWithDocument(document: File, caption: string | null) {

    if (!document) {
        return
    }

    const envLoader = EnvLoader.getInstance()

    const chatId = envLoader.TelegramChannelId

    const botToken = envLoader.TelegramApiKey

    if (!chatId || !botToken) {
        return
    }

    // File in uint8array format

    const uint8Array = new Uint8Array(await document.arrayBuffer())

    const documentBlob = new Blob([uint8Array], { type: document.type })

    const formData = new FormData()

    formData.append('chat_id', chatId)
    formData.append('document', documentBlob)

    if (caption) {
        formData.append('caption', caption)
        formData.append('parse_mode', 'Markdown')
    }

    const url = `https://api.telegram.org/bot${botToken}/sendDocument`

    const options: NetworkRequestableOptions<FormData> = {
        url: url,
        body: formData,
        bodyType: BodyType.FORMDATA,
        method: "POST",
    }

    const response = await NetworkRequestable<FormData, string>(options)

    if (!response) {
        return undefined
    }

    return response
}

interface RequestBody {
    chat_id: string,
    text: string,
    parse_mode: 'HTML' | 'Markdown'
}

interface ResponseBody {
    ok: boolean,
    result: {
        message_id: number,
        sender_chat: {
            id: number,
            title: string,
            type: string,
        },
        chat: {
            id: number,
            title: string,
            type: string,
        },
        date: number,
        text: string,
    },
}