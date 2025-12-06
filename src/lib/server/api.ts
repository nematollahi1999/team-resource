// src/lib/server/api.ts
import { PB_URL } from '$env/static/private';

// Custom Error class to pass validation data back to the UI
export class ApiError extends Error {
	public data: Record<string, any>;
	public status: number;

	constructor(message: string, data: Record<string, any>, status: number) {
		super(message);
		this.data = data;
		this.status = status;
	}
}

interface FetchOptions {
	method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
	body?: unknown;
	headers?: Record<string, string>;
	token?: string; 
}

async function pbFetch<T>(path: string, options: FetchOptions = {}) {
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	const url = `${PB_URL}/api/collections${cleanPath}`;
	
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...options.headers
	};

	// If we have a token, add the Authorization header
	if (options.token) {
		headers['Authorization'] = `Bearer ${options.token}`;
	}

	const config: RequestInit = {
		method: options.method || 'GET',
		headers
	};

	if (options.body) {
		config.body = JSON.stringify(options.body);
	}

	const res = await fetch(url, config);

	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		console.error('API Error:', url, errorData); 
		
		// Throw our custom error with validation data
		throw new ApiError(
			errorData.message || 'API Request Failed', 
			errorData.data || {}, 
			res.status
		);
	}

	if (res.status === 204) return {} as T;

	return res.json() as Promise<T>;
}

export const api = {
	// --- AUTHENTICATION ---
	register: async (data: Record<string, unknown>) => {
		return pbFetch('/users/records', { method: 'POST', body: data });
	},

	login: async (data: Record<string, unknown>) => {
		// Expects { identity: "email", password: "..." }
		return pbFetch<{ token: string; record: any }>('/users/auth-with-password', { 
			method: 'POST', 
			body: data 
		});
	},

	// --- PUBLIC READS ---
	getTypes: async (token?: string) => {
		return pbFetch('/resource_types/records?sort=resource_type', { token });
	},

    getOneResource: async (id: string, token?: string) => {
        return pbFetch(`/resources/records/${id}?expand=type`, { token });
    },
    
	getResources: async (page: number, search: string, typeFilter: string, sort: string = '-created', token?: string) => {
		const filters: string[] = [];
		
		if (search) {
            const s = search.replace(/'/g, "\\'");
			filters.push(`(title~'${s}' || description~'${s}' || tags~'${s}')`);
		}
		
		if (typeFilter && typeFilter !== 'all') {
			filters.push(`type.resource_type='${typeFilter}'`);
		}

		const query = new URLSearchParams();
		query.append('page', page.toString());
		query.append('perPage', '30'); 
		query.append('sort', sort); 
		query.append('expand', 'type');

		if (filters.length > 0) {
			query.append('filter', filters.join(' && '));
		}
		
		return pbFetch(`/resources/records?${query.toString()}`, { token });
	},

	// --- PROTECTED WRITES (Require Token) ---
	createResource: async (data: Record<string, unknown>, token: string) => {
		return pbFetch('/resources/records', { method: 'POST', body: data, token });
	},

	updateResource: async (id: string, data: Record<string, unknown>, token: string) => {
		return pbFetch(`/resources/records/${id}`, { method: 'PATCH', body: data, token });
	},

	deleteResource: async (id: string, token: string) => {
		return pbFetch(`/resources/records/${id}`, { method: 'DELETE', token });
	}
};