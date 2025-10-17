import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData();
	console.log({form});

	const file = form.get("file");
	if (file instanceof File) {
		console.log({file})
	}

	return json({}, { status: 200 });
};