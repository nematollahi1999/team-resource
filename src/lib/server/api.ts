// src/lib/server/api.ts
const PB_URL = 'http://127.0.0.1:8090'; 

interface FetchOptions {
	method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
	body?: unknown;
	headers?: Record<string, string>;
}

async function pbFetch<T>(path: string, options: FetchOptions = {}) {
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	const url = `${PB_URL}/api/collections${cleanPath}`;
	
	const headers = {
		'Content-Type': 'application/json',
		...options.headers
	};

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
		throw new Error(errorData.message || 'API Request Failed');
	}

	if (res.status === 204) return {} as T;

	return res.json() as Promise<T>;
}

export const api = {
	getTypes: async () => {
		return pbFetch('/resource_types/records?sort=resource_type');
	},

    getOneResource: async (id: string) => {
        return pbFetch(`/resources/records/${id}?expand=type`);
    },
    
    // UPDATED: Added 'sort' parameter with default value
	getResources: async (page: number, search: string, typeFilter: string, sort: string = '-created') => {
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
		
		return pbFetch(`/resources/records?${query.toString()}`);
	},

	createResource: async (data: Record<string, unknown>) => {
		return pbFetch('/resources/records', { method: 'POST', body: data });
	},

	updateResource: async (id: string, data: Record<string, unknown>) => {
		return pbFetch(`/resources/records/${id}`, { method: 'PATCH', body: data });
	},

	deleteResource: async (id: string) => {
		return pbFetch(`/resources/records/${id}`, { method: 'DELETE' });
	}
};