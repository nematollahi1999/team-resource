import { redirect, type Cookies } from '@sveltejs/kit';

export function requireAuth(cookies: Cookies) {
    const token = cookies.get('pb_auth');
    
    if (!token) {
        // If no token, kick them to login
        throw redirect(303, '/login');
    }
    
    return token;
}

export function getUser(cookies: Cookies) {
    // Simple check for UI logic (returns true/false)
    return !!cookies.get('pb_auth');
}