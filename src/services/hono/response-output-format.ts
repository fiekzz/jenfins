import chalk from "chalk";

export class ResponseOutputFormat {

    static responseOutput(statusCode: number) {

        if (statusCode >= 200 && statusCode <= 299) {
            return chalk.bold.green(statusCode)
        } else if (statusCode >= 300 && statusCode <= 399) {
            return chalk.bold.yellow(statusCode)
        } else if (statusCode >= 400 && statusCode <= 499) {
            return chalk.bold.red(statusCode)
        }

    }

}