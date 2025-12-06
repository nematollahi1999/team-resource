// src/routes/login/+page.server.ts
import { api, ApiError } from '$lib/server/api';
import { loginSchema } from '$lib/schemas';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
    // If user is already logged in, redirect to home
    if (cookies.get('pb_auth')) {
        throw redirect(303, '/');
    }
    
    // Initialize form
	return { form: await superValidate(zod(loginSchema)) };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) return fail(400, { form });

		try {
            // Call API to get token
            // The schema 'email' as API 'identity'
			const result = await api.login({
                identity: form.data.email,
                password: form.data.password
            });

            // 2. Set Cookie Manually
            cookies.set('pb_auth', result.token, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });

		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, 'Invalid email or password', { status: 400 });
			}
            console.error(e);
			return message(form, 'Something went wrong', { status: 500 });
		}

		throw redirect(303, '/');
	}
};