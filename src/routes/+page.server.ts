// src/routes/+page.server.ts
import { api, ApiError } from '$lib/server/api'; // Import ApiError
import { resourceSchema } from '$lib/schemas';
import { superValidate, message, setError } from 'sveltekit-superforms'; // Import setError
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth';
import type { PageServerLoad, Actions } from './$types';
import type { PocketBaseList, Resource } from '$lib/types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const search = url.searchParams.get('search') || '';
	const typeFilter = url.searchParams.get('type') || '';
	const sort = url.searchParams.get('sort') || '-created';

	// Initialize empty form for the modal
	const form = await superValidate(zod(resourceSchema));

	let resources: PocketBaseList<Resource> = {
		items: [],
		page: 1,
		perPage: 20,
		totalItems: 0,
		totalPages: 0
	};

	try {
		// Fetch resources (Public access, so no token needed)
		const result = await api.getResources(page, search, typeFilter, sort);
		resources = result as PocketBaseList<Resource>;
	} catch (e) {
		console.error('Error loading resources:', e);
	}

	return { form, resources };
};

export const actions: Actions = {
	createResource: async ({ request, cookies }) => {
		// 1. Check Auth & Get Token
		const token = requireAuth(cookies);

		const form = await superValidate(request, zod(resourceSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// 2. Pass token and form to API
			await api.createResource(form.data, token);
		} catch (e) {
			// 3. Handle specific API errors
			if (e instanceof ApiError) {
				// Map field-specific validation errors (e.g. title: "Already exists")
				if (e.data) {
					for (const field in e.data) {
						setError(form, field as any, e.data[field].message);
					}
				}
				// Return the specific status code (e.g. 400) and message
				return message(form, e.message, { status: e.status as any });
			}

			// 4. Handle unexpected crashes
			console.error('Create Error:', e);
			return message(form, 'Internal Server Error', { status: 500 });
		}
		
		return message(form, 'Resource created successfully!');
	},

	updateResource: async ({ request, cookies }) => {
		const token = requireAuth(cookies);

		const formData = await request.formData();
		const form = await superValidate(formData, zod(resourceSchema));
		const id = formData.get('id') as string;

		if (!id) return fail(400, { form, error: 'Missing ID' });

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await api.updateResource(id, form.data, token);
		} catch (e) {
			if (e instanceof ApiError) {
				if (e.data) {
					for (const field in e.data) {
						setError(form, field as any, e.data[field].message);
					}
				}
				return message(form, e.message, { status: e.status as any });
			}

			console.error('Update Error:', e);
			return message(form, 'Internal Server Error', { status: 500 });
		}

		return message(form, 'Resource updated successfully!');
	},

	delete: async ({ request, cookies }) => {
		const token = requireAuth(cookies);

		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Missing resource ID' });
		}

		try {
			await api.deleteResource(id, token);
			return { success: true };
		} catch (e) {
			if (e instanceof ApiError) {
				// For delete, we don't have a 'form' object to attach errors to,
				// so we return a standard fail with the error message.
				return fail(e.status, { error: e.message });
			}
			
			console.error('Delete failed:', e);
			return fail(500, { error: 'Could not delete resource' });
		}
	}
};