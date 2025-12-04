
export interface ResourceType {
	id: string;
	resource_type: string;
	// PocketBase default fields
	collectionId: string;
	collectionName: string;
	created: string;
	updated: string;
}

export interface Resource {
	id: string;
	title: string;
	url: string;
	description: string;
	tags: string; // Stored as comma-separated string
	type: string; // The ID of the relation
	expand?: {
		type?: ResourceType;
	};
	// PocketBase default fields
	collectionId: string;
	collectionName: string;
	created: string;
	updated: string;
}

export interface PocketBaseList<T> {
	page: number;
	perPage: number;
	totalItems: number;
	totalPages: number;
	items: T[];
}