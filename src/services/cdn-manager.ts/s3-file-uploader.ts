import { CompleteMultipartUploadCommandOutput, DeleteObjectsCommand, DeleteObjectsCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import EnvLoader from "../env-loader";

interface IS3Upload {
    fileName: string;
    file: Buffer | Uint8Array;
    publicACL?: boolean;
    contentType?: string;
}

export interface IS3UploadResponse {
    $metadata: Metadata;
    ETag: string;
    Bucket: string;
    Key: string;
    Location: string;
}

export interface Metadata {
    httpStatusCode: number;
    requestId: string;
    attempts: number;
    totalRetryDelay: number;
}

export interface IUploadedMedia {
    mediaURL: string;
    fileType: "image" | "video" | "cover" | "document" | any;
    fileRelation?: string;
    relatedFileKey?: string;
    hasCover?: boolean;
    position?: number;
    fileName?: string;
    mediaName?: string;
    fileHash?: string;
}

export interface IUploadTaskFile {
    name: string;
    type: string;
    size: number;
    blob: Blob | File;
}

export class S3FileUploader {

    client: S3Client

    constructor() {

        const envLoader = EnvLoader.getInstance()

        this.client = new S3Client({
            region: envLoader.S3Region,
            credentials: {
                accessKeyId: envLoader.S3AccessKeyId || '',
                secretAccessKey: envLoader.S3SecretAccessKey || ''
            },
            endpoint: `${envLoader.S3Endpoint}`,
            forcePathStyle: false
        })
    }

    uploadToS3 = async ({
        fileName,
        file,
        publicACL = false,
        contentType = "image/webp",
    }: IS3Upload) => {

        const envLoader = EnvLoader.getInstance()

        return new Promise<CompleteMultipartUploadCommandOutput>(async (resolve, reject) => {
            try {
                const parallelUploads3 = new Upload({
                    client: this.client,
                    params: {
                        Bucket: envLoader.BucketName || '',
                        Key: fileName,
                        Body: file,
                        ContentType: contentType,
                        ACL: publicACL ? "public-read" : "private",
                    },

                    // optional tags
                    tags: [
                        /*...*/
                    ],

                    // additional optional fields show default values below:

                    // (optional) concurrency configuration
                    queueSize: 4,

                    // (optional) size of each part, in bytes, at least 5MB
                    partSize: 1024 * 1024 * 5,

                    // (optional) when true, do not automatically call AbortMultipartUpload when
                    // a multipart upload fails to complete. You should then manually handle
                    // the leftover parts.
                    leavePartsOnError: false,
                });

                parallelUploads3.on("httpUploadProgress", (progress) => {
                    console.log(progress);
                });

                const res = await parallelUploads3.done();

                resolve(res)
            } catch (e) {
                console.log(e);
                reject(e)
            }
        })
    }

    deleteObjectFromS3 = ({ keys }: { keys: string[] }) => {

        const envLoader = EnvLoader.getInstance()

        return new Promise<DeleteObjectsCommandOutput>(
            async (resolve, reject) => {
                const command = new DeleteObjectsCommand({
                    Bucket: envLoader.BucketName || '',
                    Delete: {
                        Objects: keys.map((item) => ({
                            Key: item
                        }))
                    }
                })

                try {

                    const response = await this.client.send(command)
                    resolve(response)

                } catch (err) {
                    console.error(err)
                    reject(err)
                }
            }
        )
    }

}