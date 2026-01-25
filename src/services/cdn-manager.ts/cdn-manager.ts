import { fileTypeFromBuffer } from "file-type";
import { IUploadTaskFile, S3FileUploader } from "./s3-file-uploader";
import EnvLoader from "../env-loader";


export interface ICdnManagerFile {
    file: File
    mediaKey: string
}

export class CdnManager {

    private uploader: S3FileUploader
    private envLoader: EnvLoader

    constructor() {
        this.uploader = new S3FileUploader()
        this.envLoader = EnvLoader.getInstance()
    }

    async uploadFile(prop: ICdnManagerFile): Promise<string> {

        const uploader = this.uploader

        const document: IUploadTaskFile = {
            name: prop.file.name,
            type: prop.file.type,
            size: prop.file.size,
            blob: prop.file
        }

        const arrBuf = await document.blob.arrayBuffer()
        const fileMime = await fileTypeFromBuffer(arrBuf)

        await uploader.uploadToS3({
            file: new Uint8Array(arrBuf),
            fileName: prop.mediaKey,
            publicACL: true,
            contentType: fileMime?.mime ?? document.type
        })

        const fullPath = `${this.envLoader.CdnUrl}/${prop.mediaKey}`

        return fullPath
    }

    async uploadMultipleFiles(props: ICdnManagerFile[]): Promise<string[]> {
        const uploadPromises = props.map(prop => this.uploadFile(prop));
        const uploadedUrls = await Promise.all(uploadPromises);
        return uploadedUrls;
    }

    async deleteFiles(mediaKeys: string[]) {
        await this.uploader.deleteObjectFromS3({
            keys: mediaKeys
        })
    }
}