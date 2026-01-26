// Polyfills for Cloudflare Workers compatibility
import './polyfills'

import { Hono } from 'hono'
import { sendTelegramMessage, sendTelegramMessageWithDocument, sendTelegramMessageWithPhoto } from './services/send-telegram-message'
import postNotify from './controllers/jenkins/post-notify'
import z from 'zod'
import { zValidator } from '@hono/zod-validator'
import postUploadArtifacts from './controllers/jenkins/post-upload-artifacts'
import { ContextSuccess } from './utils/response/context-success'
import getRoot from './controllers/get-root'
import { honoApp } from './services/hono/hono-app'
import postTriggerBuild from './controllers/jenkins/job/post-trigger-build'
import EnvLoader from './services/env-loader'

const app = honoApp()

// Initialize environment on each request
app.use('*', async (c, next) => {
    try {
        EnvLoader.reset()
        const envLoader = EnvLoader.getInstance(c.env)

        console.log(envLoader)

    } catch (error) {
        console.error("Error initializing environment loader:", error)
        return c.json({ error: "Environment configuration error" }, 500)
    }
    await next()
})

app.route('/', getRoot)

app.route('/jenkins', postNotify)
app.route('/jenkins', postUploadArtifacts)
app.route('/jenkins/job', postTriggerBuild)

export default app
