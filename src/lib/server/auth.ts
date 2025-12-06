import { redirect, type Cookies } from '@sveltejs/kit';

export function requireAuth(cookies: Cookies, url?: URL) {
    const token = cookies.get('pb_auth');
    
    if (!token) {

        let loginUrl = '/login';
		
		// If a URL is provided, append it for redirecting back
		if (url) {
            // encodeURIComponent to ensure special characters don't break the URL
			loginUrl += `?redirectTo=${encodeURIComponent(url.pathname)}&message=login_required`;
		}
        // If no token, kick them to login
        throw redirect(303, loginUrl);
    }
    
    return token;
}

export function getUser(cookies: Cookies) {
    // Simple check for UI logic (returns true/false)
    return !!cookies.get('pb_auth');
}