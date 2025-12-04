// src/lib/stores/modal.ts
import { writable } from 'svelte/store';
import type { Resource } from '$lib/types';

type ModalState = {
	isOpen: boolean;
	mode: 'create' | 'edit';
	resource?: Resource; // Data to pre-fill
};

function createModalStore() {
	const { subscribe, set, update } = writable<ModalState>({
		isOpen: false,
		mode: 'create'
	});

	return {
		subscribe,
		openCreate: () => set({ isOpen: true, mode: 'create', resource: undefined }),
		openEdit: (resource: Resource) => set({ isOpen: true, mode: 'edit', resource }),
		close: () => update(s => ({ ...s, isOpen: false }))
	};
}

export const modalStore = createModalStore();