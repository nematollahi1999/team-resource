// src/routes/+layout.server.ts
import { api } from '$lib/server/api';
import type { LayoutServerLoad } from './$types';
import type { PocketBaseList, ResourceType } from '$lib/types';

export const load: LayoutServerLoad = async () => {
	try {
		const result = await api.getTypes() as PocketBaseList<ResourceType>;
		return { types: result.items };
	} catch (e) {
		console.error('Error loading types:', e);
		return { types: [] };
	}
};