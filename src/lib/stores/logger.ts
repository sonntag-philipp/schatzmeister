import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

import pino, { type LevelWithSilentOrString, type Logger, type LoggerOptions } from 'pino';
import { get, readable } from 'svelte/store';

const defaultServerLogLevel: LevelWithSilentOrString = 'trace';
const defaultClientLogLevel: LevelWithSilentOrString = 'silent';

// This is an IIFE, self executing funtion. It will return the Pino Logger instance
const pinoLogger: Logger = (() => {
	let pinoOptions: LoggerOptions;

	if (browser) {
		const level: LevelWithSilentOrString = env.PUBLIC_BROWSER_LOG_LEVEL ?? defaultClientLogLevel;

		pinoOptions = {
			browser: { asObject: false },
			level,
			formatters: {
				level: (label) => {
					return { level: label.toUpperCase() };
				}
			}
		};
	} else {
		const logLevel: LevelWithSilentOrString = env.PUBLIC_BROWSER_LOG_LEVEL ?? defaultServerLogLevel;

		pinoOptions = {
			level: logLevel,
			formatters: {
				level: (label) => {
					return { level: label.toUpperCase() };
				}
			},
			transport: {
				target: 'pino-pretty',
				options: {
					colorize: true,
					levelFirst: true,
					translateTime: true
				}
			}
		};
	}

	return pino(pinoOptions);
})();

// Exporting the logger value obtained by get() function as to always import the logger file from lib folder.
export const logger = get(readable<Logger>(pinoLogger));
