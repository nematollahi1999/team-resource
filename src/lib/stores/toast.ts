// src/lib/stores/toast.ts
import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	timeout?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	function add(message: string, type: ToastType = 'info', timeout = 3000) {
		const id = crypto.randomUUID();
		
		const newToast: Toast = { id, type, message, timeout };
		
		update((all) => [newToast, ...all]);

		if (timeout > 0) {
			setTimeout(() => {
				remove(id);
			}, timeout);
		}
	}

	function remove(id: string) {
		update((all) => all.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		success: (msg: string, timeout = 3000) => add(msg, 'success', timeout),
		error: (msg: string, timeout = 5000) => add(msg, 'error', timeout),
		info: (msg: string, timeout = 3000) => add(msg, 'info', timeout),
		warning: (msg: string, timeout = 4000) => add(msg, 'warning', timeout),
		remove
	};
}

export const toast = createToastStore();