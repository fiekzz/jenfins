import { Hono } from "hono";
import { ContextSuccess } from "../utils/response/context-success";


const getRoot = new Hono()

getRoot.get("/", async (c) => {
    return ContextSuccess(
        c,
        {},
        { message: 'Tele-Jenfins is running', code: 1000 },
        'Tele-Jenfins is running'
    )
})

export default getRoot