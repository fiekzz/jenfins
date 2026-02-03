import { Hono } from "hono";
import { ResponseOutputFormat } from "./response-output-format";
import { jwt } from 'hono/jwt'
import EnvLoader from "../env-loader";
import AuthenticationService from "../auth/authentication-service";

export function honoApp() {
    
    const app = new Hono()

    app.use("*", async (c, next) => {

        const ip = c.req.raw.headers.get("cf-connecting-ip")

        await next()

        const status = c.res.status

        console.log(`${ip} --> ${c.req.method} ${c.req.path} ${ResponseOutputFormat.responseOutput(status)}`)
    })

    return app
}

export function authenticatedAppRoute() {

    const app = new Hono()

    app.use("/session/*", async (c, next) => {
        
        const envLoader = EnvLoader.getInstance()

        const jwtSecretKey = envLoader.JwtSecretKey

        if (!jwtSecretKey) {
            return c.json({ error: "JWT secret key is not defined in environment variables." }, 500)
        }
        const authService = AuthenticationService.getInstance()

        // Apply JWT middleware
        const jwtMiddleware = jwt({
            secret: jwtSecretKey,
            alg: "HS256",
        })

        return jwtMiddleware(c, next)
    })

    return app
}