import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
    console.log(request)
	console.log(params);
	console.log(await request.formData());

	return json({ message: 'Alles klar!' }, { status: 200 });
};
