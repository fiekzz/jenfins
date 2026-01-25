export function ipaManifestGenerator(buildUrl: string, bundleIdentifier: string, bundleVersion: string, title: string): File | undefined {
    try {

        const plistContent =
        `<?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
        <plist version="1.0">
        <dict>
            <key>items</key>
            <array>
                <dict>
                    <key>assets</key>
                    <array>
                        <dict>
                            <key>kind</key>
                            <string>software-package</string>
                            <key>url</key>
                            <string>${buildUrl}</string>
                        </dict>
                    </array>
                    <key>metadata</key>
                    <dict>
                        <key>bundle-identifier</key>
                        <string>${bundleIdentifier}</string>
                        <key>bundle-version</key>
                        <string>${bundleVersion}</string>
                        <key>kind</key>
                        <string>software</string>
                        <key>title</key>
                        <string>${title}</string>
                    </dict>
                </dict>
            </array>
        </dict>
        </plist>`

        const blob = new Blob([plistContent], { type: 'application/xml' })

        const file = new File([blob], 'manifest.plist', { type: 'application/xml' })

        return file

    } catch (error) {

        return undefined

    }
}