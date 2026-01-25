
export class TelegramMessages {

    static jenkinsNotifyBuilding(
        jobName: string,
        branchUrl: string,
        buildStatus: string,
        buildNumber: string,
        message?: string,
    ): string {
        return `*Jenkins Build Notification*\n\n*Job Name:* ${jobName}\n*Branch URL:* ${branchUrl}\n*Build Status:* ${buildStatus}\n*Build Number:* #${buildNumber}\n\n[View Build Details](${branchUrl}/job/${jobName}/${buildNumber}/console)\n\nMessage: ${message ?? "No additional message provided."}`;
    }

}