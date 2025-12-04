// src/routes/+page.server.ts
import { api } from '$lib/server/api';
import { resourceSchema } from '$lib/schemas';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { PocketBaseList, Resource } from '$lib/types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const search = url.searchParams.get('search') || '';
	const typeFilter = url.searchParams.get('type') || '';
	// NEW: Get sort param, default to '-created'
	const sort = url.searchParams.get('sort') || '-created';

	const form = await superValidate(zod(resourceSchema));

	let resources: PocketBaseList<Resource> = {
		items: [],
		page: 1,
		perPage: 20,
		totalItems: 0,
		totalPages: 0
	};

	try {
		// NEW: Pass sort to API
		const result = await api.getResources(page, search, typeFilter, sort);
		resources = result as PocketBaseList<Resource>;
	} catch (e) {
		console.error('Error loading resources:', e);
	}

	return { form, resources };
};

export const actions: Actions = {
	createResource: async ({ request }) => {
		const form = await superValidate(request, zod(resourceSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await api.createResource(form.data);
		} catch (e) {
			console.error(e);
			return message(form, 'Failed to create resource', { status: 500 });
		}
		return message(form, 'Resource created successfully!');
	},

	updateResource: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(resourceSchema));
		const id = formData.get('id') as string;

		if (!id) return fail(400, { form, error: 'Missing ID' });

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await api.updateResource(id, form.data);
		} catch (e) {
			console.error(e);
			return message(form, 'Failed to update resource', { status: 500 });
		}

		return message(form, 'Resource updated successfully!');
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Missing resource ID' });
		}

		try {
			await api.deleteResource(id);
			return { success: true };
		} catch (e) {
			console.error('Delete failed:', e);
			return fail(500, { error: 'Could not delete resource' });
		}
	}
};