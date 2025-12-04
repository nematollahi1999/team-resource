<!-- src/lib/components/custom/add/Modal.svelte -->
<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { X } from 'lucide-svelte';

	let { open = false, title = '', onClose, children } = $props();
</script>

{#if open}
	<!-- Backdrop -->
	<div
		role="presentation"
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-100"
		transition:fade={{ duration: 150 }}
		onclick={onClose}
	></div>

	<!-- Modal Panel -->
	<div
		class="fixed inset-0 z-50 grid h-full w-full gap-4 bg-white p-6 shadow-lg duration-200 overflow-y-auto
               sm:inset-auto sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border"
		transition:fly={{ y: 20, duration: 300 }}
	>
		<div class="flex flex-col space-y-1.5 text-center sm:text-left">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold leading-none tracking-tight">{title}</h2>
				<button
					onclick={onClose}
					class="cursor-pointer rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
				>
					<X class="h-4 w-4" />
					<span class="sr-only">Close</span>
				</button>
			</div>
		</div>

		<div class="pt-2">
			{@render children?.()}
		</div>
	</div>
{/if}
