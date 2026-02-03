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
import postRequestUpload from './controllers/jenkins/v2/post-request-upload'
import postUploadComplete from './controllers/jenkins/post-upload-complete'
import AuthenticationService from './services/auth/authentication-service'

const app = honoApp()

// Initialize environment on each request
app.use('*', async (c, next) => {
    try {
        // EnvLoader.reset()
        const envLoader = EnvLoader.getInstance(c.env)

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
app.route('/jenkins/v2', postRequestUpload)
app.route('/jenkins/v2', postUploadComplete)

export default app