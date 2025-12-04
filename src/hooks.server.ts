// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = ({ error, event }) => {
	// Log the full error to your terminal 
	console.error('----------------------------------------');
	console.error('🔥 CRITICAL SERVER ERROR:', event.url.pathname);
	console.error(error);
	console.error('----------------------------------------');

	//  Return a safe object to the client
	// Hide this In a real production app.

	const e = error as Error;
	
	return {
		message: e.message || 'An unexpected error occurred',
		code: (e as any).status || 500,
		// Optional: Pass stack trace only in dev environment
		stack: import.meta.env.DEV ? e.stack : undefined
	};
};