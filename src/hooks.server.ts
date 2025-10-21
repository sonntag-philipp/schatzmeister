import { env } from '$env/dynamic/private';
import { logger } from '$lib/stores/logger';
import { json, text, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import formidable from 'formidable';
import type { IncomingMessage } from 'http';
import { Readable } from 'stream';

function is_content_type(request: Request, ...types: string[]) {
	const type = request.headers.get('content-type')?.split(';', 1)[0].trim() ?? '';
	return types.includes(type.toLowerCase());
}

function is_form_content_type(request: Request) {
	return is_content_type(
		request,
		'application/x-www-form-urlencoded',
		'multipart/form-data',
		'text/plain'
	);
}

const logRequest: Handle = async ({ event, resolve }) => {
	// clone the request so we do not interfere with the route handlers
	const request = event.request.clone();

	let body: unknown;
	try {
		const contentType = request.headers.get('content-type') || '';

		if (contentType.includes('application/json')) {
			body = await request.json();
		} else if (contentType.includes('text/plain')) {
			body = await request.text();
		} else if (contentType.includes('application/x-www-form-urlencoded')) {
			body = Object.fromEntries(new URLSearchParams(await request.text()));
		} else if (contentType.includes('multipart/form-data')) {
			// Convert Fetch API Request to Node.js IncomingMessage
			const nodeRequest = Object.assign(Readable.from(request.body as ReadableStream), {
				headers: Object.fromEntries(request.headers.entries()),
				method: request.method,
				url: request.url
			}) as IncomingMessage;

			// Parse multipart/form-data using formidable
			const form = formidable({ multiples: true });

			body = await new Promise((resolve, reject) => {
				form.parse(nodeRequest, (err, fields, files) => {
					if (err) {
						reject(err);
					} else {
						resolve({ fields, files });
					}
				});
			});
		} else {
			body = 'Body not logged (unsupported content type)';
		}
	} catch (error) {
		logger.error({ error });
		body = 'Failed to parse body';
	}

	logger.trace({
		method: request.method,
		url: request.url,
		headers: Object.fromEntries(request.headers.entries()),
		body
	});

	return await resolve(event);
};

const handleCors: Handle = async ({ event, resolve }) => {
	const request = event.request;

	const requestUrl = new URL(request.url);
	const requestOrigin = request.headers.get('origin');

	const trustedOrigins = env.CSRF_TRUSTED_ORIGINS;
	const isTrustedOrigin =
		trustedOrigins && requestOrigin && trustedOrigins.split(',').includes(requestOrigin);

	const isOriginForbidden =
		is_form_content_type(request) &&
		(request.method === 'POST' ||
			request.method === 'PUT' ||
			request.method === 'PATCH' ||
			request.method === 'DELETE') &&
		requestOrigin !== requestUrl.origin &&
		(!requestOrigin || !isTrustedOrigin);

	if (isOriginForbidden) {
		const message = `Cross-site ${request.method} form submissions are forbidden`;
		const opts = { status: 403 };
		if (request.headers.get('accept') === 'application/json') {
			return json({ message }, opts);
		}
		return text(message, opts);
	}

	// Add CORS headers
	const response = await resolve(event);

	const corsHeaders: Record<string, string> = {
		'Access-Control-Allow-Origin': isOriginForbidden ? 'null' : requestOrigin!,
		'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		'Access-Control-Allow-Credentials': 'true'
	};

	// Handle preflight requests
	if (request.method === 'OPTIONS') {
		return new Response(null, { headers: corsHeaders });
	}

	// Add CORS headers to the response
	for (const [key, value] of Object.entries(corsHeaders)) {
		response.headers.append(key, value);
	}

	return response;
};

export const handle: Handle = sequence(logRequest, handleCors);
