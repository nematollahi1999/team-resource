// src/routes/resources/[id]/+page.server.ts
import { api } from '$lib/server/api';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { resourceSchema } from '$lib/schemas';
import { requireAuth } from '$lib/server/auth';
import type { PageServerLoad, Actions } from './$types';
import type { Resource } from '$lib/types';

export const load: PageServerLoad = async (event) => {
    const { params } = event;
    
    // 1. Initialize an empty form so the global "Add Resource" modal in Layout still works
    const form = await superValidate(zod(resourceSchema));

    let resource: Resource;

    try {
        // 2. Fetch the specific resource (Public access, no token required)
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
    delete: async ({ params, cookies }) => {
        if (!params.id) throw error(400, 'Missing ID');

        // 1. Check Auth & Get Token
        const token = requireAuth(cookies);

        try {
            // 2. Pass token to API for authorization
            await api.deleteResource(params.id, token);
        } catch (e) {
            console.error('Delete failed:', e);
            // Return failure object for the client-side enhance handler
            return { success: false, error: 'Failed to delete' };
        }

        // 3. Redirect to home after successful deletion
        throw redirect(303, '/');
    }
};