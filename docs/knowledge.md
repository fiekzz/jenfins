# ConnyJenfins CI/CD Pipeline - Knowledge Base

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Components](#architecture-components)
3. [Development Iteration](#development-iteration)
4. [Deployment Iteration](#deployment-iteration)
5. [Notification System](#notification-system)
6. [Build Artifacts](#build-artifacts)
7. [Failure Handling](#failure-handling)
8. [Environment Configuration](#environment-configuration)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

ConnyJenfins is an automated CI/CD pipeline system that orchestrates the build, test, and deployment process for applications. The system integrates Bitbucket, Jenkins, a custom ConnyJenfins service, CDN storage, and Telegram notifications to provide a seamless development and deployment workflow.

### Key Features
- Automated testing and building via Jenkins
- Real-time notifications through Telegram
- Artifact management on CDN
- App Store submission automation
- Separate workflows for development and production releases

---

## Architecture Components

### Bitbucket Repository
- Central code repository for version control
- Supports multiple branch strategies (working branches and version branches)
- Triggers Jenkins builds via webhooks

### Jenkins CI/CD Pipeline
- Pulls latest code from Bitbucket
- Runs automated test suites
- Builds application artifacts
- Reports build status to ConnyJenfins

### ConnyJenfins Service
- Central orchestration service
- Receives build requests from developers
- Communicates with Jenkins
- Manages CDN uploads
- Coordinates Telegram notifications
- Handles App Store submissions

### CDN (Content Delivery Network)
- Stores build artifacts (metadata, manifest files, build files)
- Provides access to testers for artifact retrieval
- Maintains version history

### Telegram Bot
- Sends real-time notifications to developers and testers
- Notifies about test failures, build status, and deployment status
- Requires `TELEGRAM_CHANNEL_ID` and `TELEGRAM_API_KEY` configuration

---

## Development Iteration

The development iteration is used for ongoing development work on working branches.

### Workflow Steps

1. **Code Push**
   - Developer pushes code to the working branch in Bitbucket

2. **Trigger Deployment**
   - Developer triggers deployment via ConnyJenfins
   - ConnyJenfins sends build request to Jenkins

3. **Automated Testing**
   - Jenkins pulls the latest code from the repository
   - Runs automated test suite
   - If tests fail:
     - Jenkins notifies ConnyJenfins
     - Telegram bot sends failure notification to developer and tester
     - Process stops

4. **Build Application**
   - If tests pass, Jenkins builds the application
   - Jenkins notifies ConnyJenfins of build status

5. **Artifact Distribution**
   - **Success Path:**
     - Jenkins sends build artifacts to ConnyJenfins
     - ConnyJenfins pushes artifacts to CDN (metadata, manifest, build file)
     - Telegram bot notifies tester of successful deployment
     - Tester can access build artifacts from CDN
   
   - **Failure Path:**
     - Jenkins sends failure notification to ConnyJenfins
     - Telegram bot notifies tester of build failure

---

## Deployment Iteration

The deployment iteration is used for production releases and App Store submissions.

### Branch Naming Convention
- Use version directory branches: `version/1.0.0+10`
- Format: `version/MAJOR.MINOR.PATCH+BUILD_NUMBER`

### Workflow Steps

1. **Code Push to Version Branch**
   - Developer pushes code to version branch (e.g., `version/1.0.0+10`)

2. **Continuous Integration (Same as Development)**
   - Trigger deployment via ConnyJenfins
   - Jenkins runs tests and builds
   - Artifacts pushed to CDN
   - Notifications sent via Telegram

3. **Continuous Deployment**
   - Developer triggers deployment via ConnyJenfins
   - ConnyJenfins fetches latest build artifacts from CDN based on version directory
   - ConnyJenfins submits build to App Store for review
   - App Store returns submission status
   - Telegram bot notifies tester of submission status
   - Tester can check submission status on App Store

---

## Notification System

### Telegram Bot Configuration

The Telegram bot requires two environment variables:

```bash
TELEGRAM_CHANNEL_ID=<your-channel-id>
TELEGRAM_API_KEY=<your-bot-token>
```

### Notification Types

| Event | Recipients | Purpose |
|-------|-----------|---------|
| Test Failure | Developer, Tester | Alert about failing tests |
| Build Failure | Tester | Notify build process failed |
| Deployment Success | Tester | Confirm successful deployment |
| App Store Submission | Tester | Update on submission status |

### Common Issues

**Error: "Bad Request: chat_id is empty"**
- Ensure `TELEGRAM_CHANNEL_ID` environment variable is set
- Verify the API request uses `chat_id` (lowercase) not `chat_Id`
- Check that the environment variables are loaded properly

---

## Build Artifacts

### Artifact Types

1. **Metadata File**
   - Contains build information, version, timestamp
   
2. **Manifest File**
   - Lists all files in the build
   - Includes checksums and file sizes

3. **Build File**
   - Compiled application binary/package
   - Ready for testing or submission

### CDN Storage Structure

Artifacts are organized by version on the CDN:
```
/builds/
  /version-1.0.0+10/
    metadata.json
    manifest.json
    app-build.ipa (or .apk)
```

### Accessing Artifacts

**For Testers:**
1. Receive Telegram notification with build information
2. Access CDN URL provided in notification
3. Download required artifacts for testing

---

## Failure Handling

### Test Failures

**Symptoms:**
- Telegram notification: "Test failure"
- No build artifacts generated

**Action Steps:**
1. Check Jenkins logs for specific test failures
2. Review failed test cases
3. Fix code issues
4. Push corrected code
5. Re-trigger build

### Build Failures

**Symptoms:**
- Telegram notification: "Build failure"
- Tests passed but build failed

**Action Steps:**
1. Review Jenkins build logs
2. Check for compilation errors
3. Verify dependencies are available
4. Fix build configuration if needed
5. Push corrections and rebuild

### Pipeline Failures

**Symptoms:**
- No notification received
- Build stuck or timeout

**Action Steps:**
1. Check ConnyJenfins service status
2. Verify Jenkins is running
3. Check Bitbucket webhook configuration
4. Review network connectivity
5. Contact DevOps if issues persist

---

## Environment Configuration

### Required Environment Variables

```bash
# Telegram Configuration
TELEGRAM_CHANNEL_ID=<channel-or-user-id>
TELEGRAM_API_KEY=<bot-token-from-botfather>

# Jenkins Configuration (if applicable)
JENKINS_URL=<jenkins-server-url>
JENKINS_TOKEN=<authentication-token>

# CDN Configuration
CDN_URL=<cdn-base-url>
CDN_API_KEY=<cdn-access-key>

# App Store Configuration
APPSTORE_API_KEY=<appstore-key>
APPSTORE_ISSUER_ID=<issuer-id>
```

### Setup Checklist

- [ ] Bitbucket repository created and configured
- [ ] Jenkins jobs set up with proper test and build scripts
- [ ] ConnyJenfins service deployed and accessible
- [ ] CDN storage provisioned with proper access controls
- [ ] Telegram bot created via BotFather
- [ ] All environment variables configured
- [ ] Webhook configured from Bitbucket to Jenkins
- [ ] Test notification flow end-to-end

---

## Troubleshooting

### Common Issues and Solutions

#### "chat_id is empty" Error

**Cause:** The `chat_id` parameter is not properly set or has incorrect property name

**Solution:**
- Verify `TELEGRAM_CHANNEL_ID` environment variable is set
- Check the request body uses `chat_id` (all lowercase)
- Restart the ConnyJenfins service after setting environment variables

#### Build Not Triggering

**Possible Causes:**
- Bitbucket webhook not configured
- Jenkins not accessible
- ConnyJenfins service down

**Solution:**
- Test webhook manually from Bitbucket
- Verify Jenkins is running and accessible
- Check ConnyJenfins service logs
- Verify network connectivity between services

#### Artifacts Not Uploaded to CDN

**Possible Causes:**
- CDN credentials incorrect
- Network issues
- Insufficient storage space

**Solution:**
- Verify CDN API credentials
- Check network connectivity
- Review CDN storage quota
- Check ConnyJenfins logs for upload errors

#### Telegram Notifications Not Received

**Possible Causes:**
- Incorrect channel ID
- Invalid bot token
- Bot not added to channel

**Solution:**
- Verify bot is added to the channel/group
- Check `TELEGRAM_CHANNEL_ID` is correct
- Validate `TELEGRAM_API_KEY` with Telegram API
- Test with a simple message first

---

## Best Practices

### For Developers

1. **Always run tests locally** before pushing to the repository
2. **Use descriptive commit messages** to track changes
3. **Follow branch naming conventions** for version branches
4. **Monitor Telegram notifications** for build status
5. **Don't push directly to version branches** without testing

### For Testers

1. **Check Telegram regularly** for deployment notifications
2. **Test builds promptly** after receiving notifications
3. **Report issues immediately** if builds fail testing
4. **Document test results** for tracking
5. **Verify version numbers** match expected release

### For DevOps

1. **Monitor Jenkins health** and disk space
2. **Regularly clean old artifacts** from CDN
3. **Review logs** for unusual patterns
4. **Keep services updated** and patched
5. **Maintain backup configurations** for all services

---

## Support and Contact

For issues or questions:
- Check this knowledge base first
- Review Jenkins and ConnyJenfins logs
- Contact DevOps team for infrastructure issues
- Escalate urgent production issues immediately

---

*Last Updated: January 2026*
