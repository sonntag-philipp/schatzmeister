import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

import pino, { type LevelWithSilentOrString, type Logger, type LoggerOptions } from 'pino';
import { get, readable } from 'svelte/store';

const defaultServerLogLevel: LevelWithSilentOrString = 'trace';
const defaultClientLogLevel: LevelWithSilentOrString = 'silent';

// This is an IIFE, self executing funtion. It will return the Pino Logger instance
const pinoLogger: Logger = (() => {
	let pinoOptions: LoggerOptions;

	const formatters: typeof pinoOptions.formatters = {
		level: (label) => {
			return { level: label.toUpperCase() };
		}
	};

	if (browser) {
		// If logger is running in browser, pretty print it.
		pinoOptions = {
			browser: { asObject: false },
			level: env.PUBLIC_BROWSER_LOG_LEVEL ?? defaultClientLogLevel, // set default log level
			// format the level in the log to be uppercase.
			formatters,
			transport: {
				target: 'pino-pretty',
				options: {
					colorize: true, // show colors in log
					levelFirst: true, // show levels first in log
					translateTime: true // translate the time in human readable format
				}
			}
		};
	} else {
		// If logger is running in the server, do not pretty print it.
		pinoOptions = {
			level: env.PUBLIC_SERVER_LOG_LEVEL ?? defaultServerLogLevel,
			formatters
		};
	}

	return pino(pinoOptions);
})();

// Exporting the logger value obtained by get() function as to always import the logger file from lib folder.
export const logger = get(readable<Logger>(pinoLogger));
