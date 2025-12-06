// src/routes/+layout.server.ts
import { api } from '$lib/server/api';
import type { LayoutServerLoad } from './$types';
import type { PocketBaseList, ResourceType } from '$lib/types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	// Check if user is logged in
	const user = !!cookies.get('pb_auth');

	let types: ResourceType[] = [];

	try {
		// Fetch Resource Types (Global data used in dropdowns/filters)
		const result = await api.getTypes() as PocketBaseList<ResourceType>;
		types = result.items;
	} catch (e) {
		console.error('Error loading types:', e);
		// If API fails, types remains an empty array so the app doesn't crash
	}

	return { 
		types,
		user 
	};
};