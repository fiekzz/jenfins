# ConnyJenfins API Documentation

## Base URL
```
http://localhost:3000
```

---

## Endpoints

### 1. POST `/jenkins/notify`

Send a notification about Jenkins build status via Telegram.

#### Request

**Method:** `POST`

**Content-Type:** `application/json`

**Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jobName` | string | Yes | Name of the Jenkins job |
| `branchUrl` | string | Yes | URL of the branch being built |
| `buildStatus` | string | Yes | Build status (SUCCESS, FAILURE, ABORTED, UNSTABLE) |
| `buildNumber` | string | Yes | Jenkins build number |

#### cURL Example

```bash
curl -X POST http://localhost:3000/jenkins/notify \
  -H "Content-Type: application/json" \
  -d '{
    "jobName": "my-app-build",
    "branchUrl": "https://bitbucket.org/myorg/myrepo",
    "buildStatus": "SUCCESS",
    "buildNumber": "42"
  }'
```

#### Response

**Success (200):**
```json
{
  "data": {
    "telegramResponse": {
      "ok": true,
      "result": {
        "message_id": 123,
        "sender_chat": {
          "id": -1234567890,
          "title": "Build Notifications",
          "type": "channel"
        },
        "chat": {
          "id": -1234567890,
          "title": "Build Notifications",
          "type": "channel"
        },
        "date": 1737187200,
        "text": "Jenkins Build Notification..."
      }
    }
  },
  "status": {
    "message": "Jenkins notification sent successfully",
    "code": 2100
  },
  "message": "Jenkins notification sent successfully"
}
```

**Error (400/500):**
```json
{
  "status": {
    "code": 2001,
    "message": "Internal server error"
  },
  "message": "An error occurred while processing the notification."
}
```

---

### 2. POST `/jenkins/upload-artifacts`

Upload build artifacts (build files and metadata) to CDN and send notification via Telegram.

#### Request

**Method:** `POST`

**Content-Type:** `multipart/form-data`

**Form Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `buildFile` | File | Yes | The build file (APK, AAB, or IPA) |
| `buildType` | string | Yes | Type of build: APK, AAB, or IPA |
| `metadataFile` | File | Yes | JSON file containing build metadata |
| `jobName` | string | Yes | Name of the Jenkins job |
| `branchUrl` | string | Yes | URL of the branch being built |
| `buildStatus` | string | Yes | Build status (SUCCESS, FAILURE, ABORTED, UNSTABLE) |
| `buildNumber` | string | Yes | Jenkins build number |
| `bundleIdentifier` | string | Yes | App bundle identifier (e.g., com.example.app) |
| `bundleVersion` | string | Yes | App version (e.g., 1.0.0) |
| `title` | string | Yes | App title/name |

#### cURL Example - APK/AAB Upload

```bash
curl -X POST http://localhost:3000/jenkins/upload-artifacts \
  -F "buildFile=@/path/to/app-release.apk" \
  -F "buildType=APK" \
  -F "metadataFile=@/path/to/metadata.json" \
  -F "jobName=android-app-build" \
  -F "branchUrl=https://bitbucket.org/myorg/myrepo" \
  -F "buildStatus=SUCCESS" \
  -F "buildNumber=42" \
  -F "bundleIdentifier=com.example.myapp" \
  -F "bundleVersion=1.0.0+42" \
  -F "title=My Awesome App"
```

#### cURL Example - IPA Upload (iOS)

```bash
curl -X POST http://localhost:3000/jenkins/upload-artifacts \
  -F "buildFile=@/path/to/app.ipa" \
  -F "buildType=IPA" \
  -F "metadataFile=@/path/to/metadata.json" \
  -F "jobName=ios-app-build" \
  -F "branchUrl=https://bitbucket.org/myorg/myrepo" \
  -F "buildStatus=SUCCESS" \
  -F "buildNumber=42" \
  -F "bundleIdentifier=com.example.myapp" \
  -F "bundleVersion=1.0.0" \
  -F "title=My Awesome App"
```

#### Metadata File Example

Create a `metadata.json` file:

```json
{
  "buildNumber": "42",
  "buildDate": "2026-01-18T10:30:00Z",
  "gitCommit": "a1b2c3d4e5f6",
  "gitBranch": "main",
  "buildType": "release",
  "appVersion": "1.0.0"
}
```

#### Response

**Success (200) - APK/AAB:**
```json
{
  "data": {
    "buildFileUrl": "https://cdn.example.com/builds/android-app-build/build-42/app-release.apk",
    "metadataFileUrl": "https://cdn.example.com/builds/android-app-build/build-42/metadata.json"
  },
  "status": {
    "message": "Artifacts uploaded successfully",
    "code": 2200
  },
  "message": "Artifacts uploaded successfully"
}
```

**Success (200) - IPA:**
```json
{
  "data": {
    "buildFileUrl": "https://cdn.example.com/builds/ios-app-build/build-42/app.ipa",
    "metadataFileUrl": "https://cdn.example.com/builds/ios-app-build/build-42/metadata.json",
    "manifestFileUrl": "https://cdn.example.com/builds/ios-app-build/build-42/manifest.plist"
  },
  "status": {
    "message": "Artifacts uploaded successfully",
    "code": 2200
  },
  "message": "Artifacts uploaded successfully"
}
```

**Build Not Successful (200):**
```json
{
  "data": {},
  "status": {
    "message": "Build not successful, upload skipped",
    "code": 2201
  },
  "message": "Build not successful, upload skipped"
}
```

**Error (400/500):**
```json
{
  "status": {
    "code": 2002,
    "message": "Internal server error"
  },
  "message": "An error occurred while uploading artifacts."
}
```

---

## Build Status Values

The `buildStatus` parameter accepts the following values:

- `SUCCESS` - Build completed successfully
- `FAILURE` - Build failed
- `ABORTED` - Build was cancelled/aborted
- `UNSTABLE` - Build succeeded with warnings

---

## Build Type Values

The `buildType` parameter accepts the following values:

- `APK` - Android Package (debug or release APK)
- `AAB` - Android App Bundle
- `IPA` - iOS App Package

---

## Notes

### For IPA Builds
- When uploading IPA files, the system automatically generates a manifest.plist file for OTA installation
- A QR code is generated and sent via Telegram for easy installation on iOS devices
- The QR code contains the `itms-services://` URL for direct installation

### Authentication
Currently, the API does not require authentication. In production, consider implementing:
- API keys
- JWT tokens
- IP whitelisting

### File Size Limits
- Maximum file size depends on your CDN and server configuration
- Multipart uploads are handled for large files

### Telegram Notifications
- All successful uploads trigger Telegram notifications
- Build failures are also notified via Telegram
- Ensure `TELEGRAM_CHANNEL_ID` and `TELEGRAM_API_KEY` are properly configured

---

## Testing the API

### Health Check
```bash
curl http://localhost:3000/
```

### Test Notification
```bash
curl -X POST http://localhost:3000/jenkins/notify \
  -H "Content-Type: application/json" \
  -d '{"jobName":"test-job","branchUrl":"https://example.com","buildStatus":"SUCCESS","buildNumber":"1"}'
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 2001 | Internal server error (notify endpoint) |
| 2002 | Internal server error (upload-artifacts endpoint) |
| 2100 | Jenkins notification sent successfully |
| 2200 | Artifacts uploaded successfully |
| 2201 | Build not successful, upload skipped |

---

*Last Updated: January 2026*
