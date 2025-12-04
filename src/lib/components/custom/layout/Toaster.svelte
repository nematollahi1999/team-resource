<!-- src/lib/components/ui/Toaster.svelte -->
<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { fly } from 'svelte/transition';
	import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-svelte';

	// Helper to get icon and styles
	function getToastStyles(type: string) {
		switch (type) {
			case 'success':
				return { 
					icon: CheckCircle2, 
					classes: 'border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:border-green-900' 
				};
			case 'error':
				return { 
					icon: XCircle, 
					classes: 'border-red-200 bg-red-50 text-red-800 dark:bg-red-900/20 dark:border-red-900' 
				};
			case 'warning':
				return { 
					icon: AlertCircle, 
					classes: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900' 
				};
			default:
				return { 
					icon: Info, 
					classes: 'border-slate-200 bg-white text-slate-800 dark:bg-slate-950 dark:border-slate-800' 
				};
		}
	}
</script>

<!-- Fixed Container -->
<div
	class="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-[400px] pointer-events-none px-4 md:px-0"
>
	{#each $toast as t (t.id)}
		{@const style = getToastStyles(t.type)}

		<!-- Toast Item -->
		<div
			in:fly={{ x: 200, duration: 300 }}
			out:fly={{ x: 200, duration: 200 }}
			class="pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-md transition-all {style.classes}"
			role="alert"
		>
			<svelte:component this={style.icon} class="h-5 w-5 shrink-0 mt-0.5" />

			<div class="flex-1 text-sm font-medium">
				{t.message}
			</div>

			<button
				on:click={() => toast.remove(t.id)}
				class="shrink-0 rounded-md p-1 opacity-50 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-slate-400"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	{/each}
</div>
