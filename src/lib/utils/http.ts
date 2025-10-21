import formidable from 'formidable';
import type { IncomingMessage } from 'http';
import { Readable } from 'stream';

export async function parseBody(message: Request | Response) {
	const contentType = message.headers.get('content-type') || '';

	if (contentType.includes('application/json')) {
		return await message.json();
	}
	if (contentType.includes('text/plain')) {
		return await message.text();
	}
	if (contentType.includes('application/x-www-form-urlencoded')) {
		return Object.fromEntries(new URLSearchParams(await message.text()));
	}
	if (contentType.includes('multipart/form-data')) {
		// Convert Fetch API Request to Node.js IncomingMessage
		const nodeRequest = Object.assign(Readable.from(message.body as ReadableStream), {
			headers: Object.fromEntries(message.headers.entries()),
			url: message.url
		}) as IncomingMessage;

		// Parse multipart/form-data using formidable
		const form = formidable({ multiples: true });

		return await new Promise((resolve, reject) => {
			form.parse(nodeRequest, (err, fields, files) => {
				if (err) {
					reject(err);
				} else {
					resolve({ fields, files });
				}
			});
		});
	}

	return `Content Type "${contentType} not supported.`;
}
/**
 * @param request Node Request
 * @returns Whether the Content-Type header is a variation of form.
 */
export function isContentTypeForm(request: Request) {
	const allowedFormContentTypes = [
		'application/x-www-form-urlencoded',
		'multipart/form-data',
		'text/plain'
	];

	const type = request.headers.get('content-type')?.split(';', 1)[0].trim() ?? '';
	return allowedFormContentTypes.includes(type.toLowerCase());
}

export function isOriginValidationRequired(request: Request) {
	const requestUrl = new URL(request.url);
	const requestOrigin = request.headers.get('origin');

	return (
		isContentTypeForm(request) &&
		(request.method === 'POST' ||
			request.method === 'PUT' ||
			request.method === 'PATCH' ||
			request.method === 'DELETE') &&
		requestOrigin !== requestUrl.origin
	);
}
