
class EnvLoader {

    private static instance: EnvLoader;

    TelegramApiKey: string | undefined
    TelegramBotName: string | undefined
    TelegramChannelLink: string | undefined
    TelegramChannelId: string | undefined

    CdnUrl: string | undefined
    BucketName: string | undefined

    S3AccessKeyId: string | undefined
    S3SecretAccessKey: string | undefined
    S3Endpoint: string | undefined
    S3Path: string | undefined
    S3Region: string | undefined

    JenkinsEndpoint: string | undefined

    JwtSecretKey: string | undefined

    constructor(env?: any) {
        const envSource = env || process.env
        
        this.TelegramApiKey = envSource.TELEGRAM_API_KEY
        this.TelegramBotName = envSource.TELEGRAM_BOT_NAME
        this.TelegramChannelLink = envSource.TELEGRAM_CHANNEL_LINK
        this.TelegramChannelId = envSource.TELEGRAM_CHANNEL_ID

        this.CdnUrl = envSource.CDN_URL
        this.BucketName = envSource.BUCKET_NAME

        this.S3AccessKeyId = envSource.S3_ACCESS_KEY_ID
        this.S3SecretAccessKey = envSource.S3_SECRET_ACCESS_KEY
        this.S3Endpoint = envSource.S3_ENDPOINT
        this.S3Path = envSource.S3_PATH
        this.S3Region = envSource.S3_REGION

        this.JenkinsEndpoint = envSource.JENKINS_ENDPOINT

        this.JwtSecretKey = envSource.JWT_SECRET_KEY

        this.verifyEnv()
    }

    private verifyEnv() {

        if (!this.TelegramApiKey || !this.TelegramBotName || !this.TelegramChannelLink || !this.TelegramChannelId) {
            throw new Error("Telegram environment variables are not properly set.")
        }

        if (!this.CdnUrl || !this.BucketName) {
            throw new Error("CDN environment variables are not properly set.")
        }

        if (!this.S3AccessKeyId || !this.S3SecretAccessKey || !this.S3Endpoint || !this.S3Path || !this.S3Region) {
            throw new Error("S3 environment variables are not properly set.")
        }

        if (!this.JwtSecretKey) {
            throw new Error("JWT secret key is not properly set.")
        }
    }

    public static getInstance(env?: any): EnvLoader {
        if (!EnvLoader.instance) {
            EnvLoader.instance = new EnvLoader(env);
        }
        return EnvLoader.instance;
    }
    
    public static reset(): void {
        EnvLoader.instance = undefined as any;
    }

}

export default EnvLoader;