<!-- src/routes/+error.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { TriangleAlert , House , RotateCcw } from 'lucide-svelte';
</script>

<div class="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
	<div class="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
		<TriangleAlert  class="h-12 w-12 text-red-600 dark:text-red-500" />
	</div>

	<h1 class="mt-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
		{$page.status} Error
	</h1>

	<p class="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-lg">
		{$page.error?.message || 'Something went wrong.'}
	</p>

	
	<!-- We cast to 'any' here because App.Error doesn't officially have 'stack' by default -->
	{#if ($page.error as any)?.stack}
		<div
			class="mt-6 w-full max-w-2xl overflow-hidden rounded-lg border border-red-200 bg-red-50 p-4 text-left text-xs font-mono text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200 shadow-inner"
		>
			<pre class="whitespace-pre-wrap wrap-break-words">{($page.error as any).stack}</pre>
		</div>
	{/if}

	<div class="mt-8 flex gap-4">
		<Button variant="outline" onclick={() => history.back()} class="gap-2 cursor-pointer">
			<RotateCcw class="h-4 w-4" />
			Go Back
		</Button>

		<Button href="/" class="gap-2 cursor-pointer">
			<House  class="h-4 w-4" />
			Back to Home
		</Button>
	</div>
</div>
