import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	console.log('New Request', {
		...request,
		params,
		body: await request.json()
	});

	return new Response(JSON.stringify({ x: 'hallo' }), {
		headers: {
			'Access-Control-Allow-Origin': '*', // oder nur deine Domain
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Max-Age': '86400' // optional, Cache für Preflight
		}
	});
}

export const OPTIONS: RequestHandler = async () => {
	return new Response(null, {
		status: 204, // No Content
		headers: {
			'Access-Control-Allow-Origin': '*', // oder nur deine Domain
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Max-Age': '86400' // optional, Cache für Preflight
		}
	});
};
