import { Hono } from "hono";
import { ResponseOutputFormat } from "./response-output-format";

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