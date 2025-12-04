<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Search } from 'lucide-svelte';
	import ResourceCard from '$lib/components/custom/card/ResourceCard.svelte';
	import Pagination from '$lib/components/custom/layout/Pagination.svelte';
	
	let { data } = $props();

	// 1. Initialize State
	// We use $state to hold the local input value
	let searchTerm = $state($page.url.searchParams.get('search') || '');
	let timer: ReturnType<typeof setTimeout>;

	// 2. Debounce Logic with $effect
	$effect(() => {
		const currentUrlSearch = $page.url.searchParams.get('search') || '';
		
		if (searchTerm !== currentUrlSearch) {
			clearTimeout(timer);
			timer = setTimeout(() => {
				updateQuery('search', searchTerm);
			}, 300);
		}
	});

	function handleTypeChange(e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		updateQuery('type', val === 'all' ? '' : val);
	}

	function updateQuery(key: string, val: string) {
		const url = new URL($page.url);

		if (val) url.searchParams.set(key, val);
		else url.searchParams.delete(key);

		if (key !== 'page') {
			url.searchParams.set('page', '1');
		}

		goto(url, {
			keepFocus: true,
			noScroll: true,
			replaceState: true
		});
	}

	function clearFilters() {
		searchTerm = ''; // Triggers the effect
		const url = new URL($page.url);
		url.searchParams.delete('search');
		url.searchParams.delete('type');
		url.searchParams.set('page', '1');
		goto(url);
	}
</script>

<div class="space-y-6">
	<!-- Filter Bar -->
	<div class="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm md:flex-row">
		<div class="relative w-full md:flex-1">
			<Search class="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
			<Input placeholder="Search titles, tags..." class="pl-8" bind:value={searchTerm} />
		</div>

		<div class="w-full md:w-[200px]">
			<select
				class="border-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm capitalize focus:outline-none focus:ring-1 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
				value={$page.url.searchParams.get('type') || 'all'}
				onchange={handleTypeChange}
			>
				<option value="all">All Types</option>
				{#if data.types}
					{#each data.types as t}
						<option value={t.resource_type} class="capitalize">
							{t.resource_type}
						</option>
					{/each}
				{/if}
			</select>
		</div>
	</div>

	<!-- List Header -->
	<div class="flex items-center justify-between px-1">
		<h1 class="text-xl font-bold">Resources</h1>
		{#if data.resources}
			<p class="text-sm text-gray-500">
				{data.resources.totalItems} resources found
			</p>
		{/if}
	</div>

	<!-- Resource Grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#if data.resources && data.resources.items?.length > 0}
			{#each data.resources.items as item (item.id)}
				<ResourceCard resource={item} />
			{/each}
		{:else}
			<div
				class="col-span-1 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 py-20 text-center md:col-span-3"
			>
				<p class="text-lg font-medium text-slate-600">No resources found</p>
				<p class="mt-1 text-sm text-slate-500">Try adjusting your search or filters</p>
				<Button variant="link" onclick={clearFilters} class="mt-2 text-blue-600 cursor-pointer">
					Clear Filters
				</Button>
			</div>
		{/if}
	</div>

	<!-- PAGINATION -->
	{#if data.resources}
		<Pagination
			currentPage={data.resources.page}
			totalPages={data.resources.totalPages}
			onPageChange={(newPage) => updateQuery('page', newPage.toString())}
		/>
	{/if}
</div>
