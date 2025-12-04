// src/routes/logout/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    // 1. Clear the auth cookie
	cookies.delete('pb_auth', { path: '/' });
    
    // 2. Redirect to Home
	throw redirect(303, '/');
};