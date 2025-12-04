<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import { modalStore } from '$lib/stores/modal';
	
	// Import Types
	import type { Resource } from '$lib/types';
	
	// Import Toast Store
	import { toast } from '$lib/stores/toast';

	// Import Icons
	import { 
		FileText, 
		PlayCircle, 
		Wrench, 
		GraduationCap, 
		Book, 
		HelpCircle, 
		Pencil, 
		Trash2 
	} from 'lucide-svelte';

	// Receive the single resource object with strict typing
	export let resource: Resource;

	// --- HELPER: Get Icon and Color based on Type ---
	function getTypeConfig(typeStr: string | undefined) {
		const t = typeStr?.toLowerCase() || '';
		
		switch (t) {
			case 'article':
				return { icon: FileText, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200' };
			case 'video':
				return { icon: PlayCircle, color: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200' };
			case 'tool':
				return { icon: Wrench, color: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' };
			case 'tutorial':
				return { icon: GraduationCap, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200' };
			case 'docs':
				return { icon: Book, color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200' };
			default:
				return { icon: HelpCircle, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200' };
		}
	}

	// --- HELPER: Calculate Time Ago ---
	function timeAgo(dateString: string) {
		const date = new Date(dateString);
		const now = new Date();
		const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
		
		let interval = seconds / 31536000;
		if (interval > 1) return Math.floor(interval) + " years ago";
		interval = seconds / 2592000;
		if (interval > 1) return Math.floor(interval) + " months ago";
		interval = seconds / 86400;
		if (interval > 1) return Math.floor(interval) + " days ago";
		interval = seconds / 3600;
		if (interval > 1) return Math.floor(interval) + " hours ago";
		return "Just now";
	}

	// Compute values once
	$: typeData = getTypeConfig(resource.expand?.type?.resource_type);
	$: TypeIcon = typeData.icon;
</script>

<Card.Root class="flex flex-col h-full hover:shadow-lg transition bg-white border-slate-200">
	<!-- HEADER: Badge + Action Buttons -->
	<Card.Header class="pb-3">
		<div class="flex justify-between items-start">
			<!-- Colored Badge -->
			<Badge class="{typeData.color} gap-1.5 pl-2 pr-3 py-1 font-medium capitalize border ">
				<TypeIcon class="w-3.5 h-3.5" />
				{resource.expand?.type?.resource_type || 'Unknown'}
			</Badge>

			<!-- Edit / Delete Actions -->
			<div class="flex gap-1">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class="h-8 w-8 text-slate-400 hover:text-slate-700 cursor-pointer"
					on:click={() => modalStore.openEdit(resource)}
				>
					<Pencil class="w-4 h-4" />
				</Button>

				<!-- Delete Form -->
				<!-- This action points to the main page default action named 'delete' -->
				<form
					action="/?/delete"
					method="POST"
					class="inline"
					use:enhance={({ cancel }) => {
						// 1. Confirm before submitting
						const confirmed = confirm('Are you sure you want to delete this resource?');
						if (!confirmed) {
							cancel();
							return;
						}

						// 2. Handle the response
						return async ({ result, update }) => {
							// Apply server-side changes to the current page data
							await update();

							// Show Toast Notification based on result
							if (result.type === 'success') {
								toast.success('Resource deleted successfully.');
							} else if (result.type === 'failure' || result.type === 'error') {
								toast.error('Failed to delete resource.');
							}
						};
					}}
				>
					<!-- We must pass the ID since we are not in a dynamic route like /[id] -->
					<input type="hidden" name="id" value={resource.id} />

					<Button
						type="submit"
						variant="ghost"
						size="icon"
						class="h-8 w-8 text-slate-400 hover:text-red-600 cursor-pointer"
					>
						<Trash2 class="w-4 h-4" />
					</Button>
				</form>
			</div>
		</div>

		<Card.Title
			class="mt-3 text-lg font-semibold leading-tight line-clamp-1"
			title={resource.title}
		>
			{resource.title}
		</Card.Title>
	</Card.Header>

	<!-- CONTENT: Description + Tags -->
	<Card.Content class="flex-grow">
		<p class="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
			{resource.description || 'No description provided.'}
		</p>

		{#if resource.tags}
			<div class="flex flex-wrap gap-2 mt-auto pt-2">
				{#each resource.tags.split(',') as tag}
					<Badge
						variant="outline"
						class="text-sm text-slate-500 bg-slate-50 border-slate-200 font-normal px-2 hover:bg-gray-200 "
					>
						{tag.trim()}
					</Badge>
				{/each}
			</div>
		{/if}
	</Card.Content>

	<!-- FOOTER: Date + View Link -->
	<Card.Footer class="border-t border-slate-100 pt-4 flex items-center justify-between">
		<span class="text-xs text-slate-400 font-medium">
			Added {timeAgo(resource.created)}
		</span>

		<Button
			variant="link"
			class="text-blue-600 p-0 h-auto font-semibold text-sm hover:text-blue-700"
			href={`/resources/${resource.id}`}
		>
			View Details
		</Button>
	</Card.Footer>
</Card.Root>
