import { env } from '$env/dynamic/private';
import { logger } from '$lib/stores/logger';
import { text, type Handle } from '@sveltejs/kit';

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

const handleCsrf: Handle = async ({ event, resolve }) => {
	const request = event.request;

	const json = JSON.stringify(event.request);

	request.headers.entries().forEach((value) => {
		logger.trace(value);
	});

	logger.trace({
		method: request.method,
		url: request.url
	});

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

export const handle: Handle = handleCsrf;
