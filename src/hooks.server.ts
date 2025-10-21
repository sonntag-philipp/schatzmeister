import { env } from '$env/dynamic/private';
import { logger } from '$lib/stores/logger';
import { parseBody } from '$lib/utils/http';
import { json, text, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

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

const handleLogging: Handle = async ({ event, resolve }) => {
	// clone the request so we do not interfere with the route handlers
	const request = event.request.clone();

	logger.trace(
		{
			method: request.method,
			url: request.url,
			headers: Object.fromEntries(request.headers.entries()),
			body: await parseBody(request)
		},
		'Incoming Request'
	);

	const response = await resolve(event);

	logger.trace(
		{
			status: response.status,
			statusText: response.statusText,
			headers: Object.fromEntries(response.headers.entries()),
			body: await parseBody(response.clone())
		},
		'Outgoing Response'
	);

	return response;
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

export const handle: Handle = sequence(handleLogging, handleCors);
