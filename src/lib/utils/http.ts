import formidable from 'formidable';
import type { IncomingMessage } from 'http';
import { Readable } from 'stream';

export async function parseBody(request: Request | Response) {
	const contentType = request.headers.get('content-type') || '';

	if (contentType.includes('application/json')) {
		return await request.json();
	}
	if (contentType.includes('text/plain')) {
		return await request.text();
	}
	if (contentType.includes('application/x-www-form-urlencoded')) {
		return Object.fromEntries(new URLSearchParams(await request.text()));
	}
	if (contentType.includes('multipart/form-data')) {
		// Convert Fetch API Request to Node.js IncomingMessage
		const nodeRequest = Object.assign(Readable.from(request.body as ReadableStream), {
			headers: Object.fromEntries(request.headers.entries()),
			url: request.url
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
