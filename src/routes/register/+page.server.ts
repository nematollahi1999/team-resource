// src/routes/register/+page.server.ts
import { api, ApiError } from '$lib/server/api';
import { registerSchema } from '$lib/schemas';
import { superValidate, message, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
    // If already logged in, redirect home
    if (cookies.get('pb_auth')) {
        throw redirect(303, '/');
    }
	return { form: await superValidate(zod(registerSchema)) };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(registerSchema));

		if (!form.valid) return fail(400, { form });

		try {
			await api.register(form.data);
		} catch (e) {
			if (e instanceof ApiError) {
				const fieldErrors = e.data; 
				// Map API errors (like "email already exists") to the form fields
				for (const field in fieldErrors) {
					setError(form, field as any, fieldErrors[field].message);
				}
				if (Object.keys(fieldErrors).length === 0) {
					return message(form, e.message, { status: 400 });
				}
				return fail(400, { form });
			}
			console.error(e);
			return message(form, 'Something went wrong.', { status: 500 });
		}

		throw redirect(303, '/login');
	}
};