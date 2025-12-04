<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	export let currentPage: number;
	export let totalPages: number;
	export let onPageChange: (page: number) => void;

	// Helper to generate array of page numbers
	function getPageNumbers(current: number, total: number) {
		// Simple version: just show all pages if less than 7, 
        // otherwise we would need complex logic for "..." (ellipses)
        // Since you have ~30 items, this simple loop is perfect.
		const pages = [];
		for (let i = 1; i <= total; i++) {
			pages.push(i);
		}
		return pages;
	}

	$: pages = getPageNumbers(currentPage, totalPages);
</script>

{#if totalPages > 1}
	<div class="flex items-center justify-center space-x-2 py-8">
		<!-- PREVIOUS BUTTON -->
		<Button
			variant="outline"
			size="icon"
			disabled={currentPage <= 1}
			on:click={() => onPageChange(currentPage - 1)}
			class="cursor-pointer"
		>
			<ChevronLeft class="h-4 w-4" />
			<span class="sr-only">Previous</span>
		</Button>

		<!-- PAGE NUMBERS -->
		{#each pages as page}
			<Button
				variant={currentPage === page ? 'default' : 'outline'}
				size="icon"
				class="cursor-pointer"
				on:click={() => onPageChange(page)}
			>
				{page}
			</Button>
		{/each}

		<!-- NEXT BUTTON -->
		<Button
			variant="outline"
			size="icon"
			disabled={currentPage >= totalPages}
			on:click={() => onPageChange(currentPage + 1)}
			class="cursor-pointer"
		>
			<ChevronRight class="h-4 w-4" />
			<span class="sr-only">Next</span>
		</Button>
	</div>

	<!-- Optional: Show X of Y text -->
	<div class="text-center text-xs text-muted-foreground pb-4">
		Page {currentPage} of {totalPages}
	</div>
{/if}
