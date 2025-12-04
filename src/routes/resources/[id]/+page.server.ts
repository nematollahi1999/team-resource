// src/routes/resources/[id]/+page.server.ts
import { api } from '$lib/server/api';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { resourceSchema } from '$lib/schemas';
import type { PageServerLoad, Actions } from './$types';
import type { Resource } from '$lib/types';

export const load: PageServerLoad = async (event) => {
    const { params } = event;
    // 1. Initialize an empty form so the global "Add Resource" modal in Layout still works
    const form = await superValidate(zod(resourceSchema as any) );

    let resource: Resource;

    try {
        // 2. Fetch the specific resource
        const result = await api.getOneResource(params.id);
        resource = result as Resource;
    } catch (e) {
        console.error('Error loading resource:', e);
        throw error(404, 'Resource not found');
    }

    return {
        resource,
        form // Pass form to layout
    };
};

export const actions: Actions = {
    // Specific delete action for the detail page
    delete: async ({ params }) => {
        if (!params.id) throw error(400, 'Missing ID');

        try {
            await api.deleteResource(params.id);
        } catch (e) {
            console.error('Delete failed:', e);
            return { success: false, error: 'Failed to delete' };
        }

        // Redirect to home after successful deletion
        throw redirect(303, '/');
    }
};