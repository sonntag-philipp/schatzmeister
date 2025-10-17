import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	console.log(request);
	console.log(params);

	return json({ message: 'Alles klar!' }, { status: 200 });
};
