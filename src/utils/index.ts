import chalk from "chalk";

export const log = {
	info(...args: any) {
		console.error(chalk.green.bold("[INFO]:", ...args));
	},
	warn(...args: any) {
		console.error(chalk.yellow.bold("[WARN]:", ...args));
	},
	error(...args: any) {
		console.error(chalk.red.bold("[ERROR]:", ...args));
	},
};

export function isFunction(val: any) {
	return typeof val === "function"
}
