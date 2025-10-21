import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	throw {
		hallo: 123,
		awdkjanwdjk: 'awddawdw'
	};

	return json({}, { status: 200 });
};
