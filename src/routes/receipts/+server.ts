export async function POST({ params, request }) {
	console.log('New Request', params, request.headers);

	return new Response(JSON.stringify({ x: 'hallo' }), {
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*'
		}
	});
}
