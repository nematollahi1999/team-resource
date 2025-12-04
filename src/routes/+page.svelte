<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Select from '$lib/components/ui/select';
	import { Search } from 'lucide-svelte';
	import ResourceCard from '$lib/components/custom/card/ResourceCard.svelte';
	
	let { data } = $props();

	// 1. Initialize State
	let searchTerm = $state($page.url.searchParams.get('search') || '');
	let timer: ReturnType<typeof setTimeout>;

	// 2. Debounce Logic
	$effect(() => {
		const currentUrlSearch = $page.url.searchParams.get('search') || '';
		
		if (searchTerm !== currentUrlSearch) {
			clearTimeout(timer);
			timer = setTimeout(() => {
				updateQuery('search', searchTerm);
			}, 300);
		}
	});

	// 3. Derived State for Select Value & Label
	let currentTypeParam = $derived($page.url.searchParams.get('type') || 'all');
	
	// We derive the "Label" manually for the trigger button text
	let triggerLabel = $derived.by(() => {
		if (currentTypeParam === 'all') return 'All Types';
		const found = data.types?.find((t) => t.resource_type === currentTypeParam);
		return found ? found.resource_type : 'All Types';
	});

	function updateQuery(key: string, val: string) {
		const url = new URL($page.url);
		if (val) url.searchParams.set(key, val);
		else url.searchParams.delete(key);

		if (key !== 'page') url.searchParams.set('page', '1');

		goto(url, { keepFocus: true, noScroll: true, replaceState: true });
	}

	function clearFilters() {
		searchTerm = '';
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
			<!-- FIXED SHADCN SELECT -->
			<Select.Root
				type="single"
				value={currentTypeParam}
				onValueChange={(v: string) => {
					// v is strictly a string here
					if (v) {
						updateQuery('type', v === 'all' ? '' : v);
					}
				}}
			>
				<Select.Trigger class="w-full capitalize bg-white">
					<!-- Render text directly to avoid component issues -->
					{triggerLabel}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all" label="All Types">All Types</Select.Item>
					{#if data.types}
						{#each data.types as t}
							<Select.Item value={t.resource_type} label={t.resource_type} class="capitalize">
								{t.resource_type}
							</Select.Item>
						{/each}
					{/if}
				</Select.Content>
			</Select.Root>
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
	{#if data.resources && data.resources.totalPages > 1}
		<div class="py-4">
			<Pagination.Root
				count={data.resources.totalItems}
				perPage={data.resources.perPage}
				page={data.resources.page}
				onPageChange={(newPage) => updateQuery('page', newPage.toString())}
			>
				{#snippet children({ pages, currentPage })}
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton class="cursor-pointer" />
						</Pagination.Item>

						{#each pages as page (page.key)}
							{#if page.type === 'ellipsis'}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link
										{page}
										isActive={currentPage === page.value}
										class="cursor-pointer"
									>
										{page.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}

						<Pagination.Item>
							<Pagination.NextButton class="cursor-pointer" />
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		</div>
	{/if}
</div>
