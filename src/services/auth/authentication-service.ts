import { Context, Next } from "hono";
import { ContextError } from "../../utils/response/context-error";
import { sign } from "hono/jwt";
import EnvLoader from "../env-loader";

export interface IGenerateTokenOptions {
    sub: string;
    exp?: number;
}

class AuthenticationService {

    private static instance: AuthenticationService;

    private TokenSecretKey: string | undefined

    private tokenBlacklist: Set<string> = new Set();

    constructor() {

        const envLoader = EnvLoader.getInstance()
        const secretKey = envLoader.JwtSecretKey

        this.TokenSecretKey = secretKey;
    }

    public static getInstance(): AuthenticationService {
        if (!AuthenticationService.instance) {
            AuthenticationService.instance = new AuthenticationService();
        }

        const instance = AuthenticationService.instance;

        return instance;
    }

    public checkRevokation = async (c: Context, next: Next) => {
        const authHeader = c.req.header('Authorization')
        const token = authHeader?.replace('Bearer ', '')

        if (token && this.isTokenRevoked(token)) {
            return ContextError(
                c,
                { code: 3001, message: "Token has been revoked" },
                "The provided token has been revoked. Please authenticate again."
            )
        }

        await next()
    }

    public async generateToken(options: IGenerateTokenOptions): Promise<string> {

        const tokensecretkey = this.TokenSecretKey || ''

        const token = await sign(
            {
                sub: options.sub,
                exp: options.exp,
            },
            tokensecretkey,
        )

        return token;
    }

    public clearRevokedTokens(): void {
        // const instance = AuthenticationService.getInstance();
        // instance.tokenBlacklist.clear();
        this.tokenBlacklist.clear();
    }

    public revokeToken(token: string): void {
        // const instance = AuthenticationService.getInstance();
        // instance.tokenBlacklist.add(token);
        this.tokenBlacklist.add(token);
    }

    public isTokenRevoked(token: string): boolean {
        // const instance = AuthenticationService.getInstance();
        // return instance.tokenBlacklist.has(token);
        return this.tokenBlacklist.has(token);
    }

    public getTokenBlacklist(): Set<string> {
        const instance = AuthenticationService.getInstance();
        return instance.tokenBlacklist;
    }

    public static resetInstance(): void {
        this.getInstance().clearRevokedTokens();
        AuthenticationService.instance = undefined as any;
    }
}

export default AuthenticationService;

export const authenticatedMiddleware = async (c: Context, next: Next) => {
    const authService = AuthenticationService.getInstance()
    return authService.checkRevokation(c, next)
}