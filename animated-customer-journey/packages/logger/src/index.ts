type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
};

let currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) ?? "info";

function shouldLog(level: LogLevel): boolean {
	return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
	if (!shouldLog(level)) return;
	const entry = {
		timestamp: new Date().toISOString(),
		level,
		message,
		...data,
	};
	const output = JSON.stringify(entry);
	if (level === "error") {
		console.error(output);
	} else if (level === "warn") {
		console.warn(output);
	} else {
		console.log(output);
	}
}

export const logger = {
	debug: (msg: string, data?: Record<string, unknown>) => log("debug", msg, data),
	info: (msg: string, data?: Record<string, unknown>) => log("info", msg, data),
	warn: (msg: string, data?: Record<string, unknown>) => log("warn", msg, data),
	error: (msg: string, data?: Record<string, unknown>) => log("error", msg, data),
	setLevel: (level: LogLevel) => {
		currentLevel = level;
	},
};
