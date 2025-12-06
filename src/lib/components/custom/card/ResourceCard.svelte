<!-- src/lib/components/custom/card/ResourceCard.svelte -->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog'; 
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	
	import { modalStore } from '$lib/stores/modal';
	import { toast } from '$lib/stores/toast';
	import { page } from '$app/stores'; // Import page store
	
	import type { Resource } from '$lib/types';
	
	// Icons
	import { 
		FileText, CirclePlay , Wrench, GraduationCap, 
		Book, CircleQuestionMark , Pencil, Trash2 
	} from 'lucide-svelte';

	let { resource } = $props<{ resource: Resource }>();

	// Access user state from global page data
	let user = $derived($page.data.user);

	let deleteDialogOpen = $state(false);

	function getTypeConfig(typeStr: string | undefined) {
		const t = typeStr?.toLowerCase() || '';
		switch (t) {
			case 'article': return { icon: FileText, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200' };
			case 'video': return { icon: CirclePlay , color: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200' };
			case 'tool': return { icon: Wrench, color: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' };
			case 'tutorial': return { icon: GraduationCap, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200' };
			case 'docs': return { icon: Book, color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200' };
			default: return { icon: CircleQuestionMark , color: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200' };
		}
	}

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

	let typeData = $derived(getTypeConfig(resource.expand?.type?.resource_type));
	let TypeIcon = $derived(typeData.icon);
</script>

<Card.Root class="flex flex-col h-full hover:shadow-lg transition bg-white border-slate-200">
	<Card.Header class="pb-3">
		<div class="flex justify-between items-start">
			<Badge class="{typeData.color} gap-1.5 pl-2 pr-3 py-1 font-medium capitalize border ">
				<TypeIcon class="w-3.5 h-3.5" />
				{resource.expand?.type?.resource_type || 'Unknown'}
			</Badge>

			<!-- ONLY SHOW EDIT/DELETE BUTTONS IF LOGGED IN -->
			{#if user}
				<div class="flex gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class="h-8 w-8 text-slate-400 hover:text-slate-700 cursor-pointer"
						onclick={() => modalStore.openEdit(resource)}
					>
						<Pencil class="w-4 h-4" />
					</Button>

					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 text-slate-400 hover:text-red-600 cursor-pointer"
						onclick={() => (deleteDialogOpen = true)}
					>
						<Trash2 class="w-4 h-4" />
					</Button>
				</div>
			{/if}
		</div>

		<Card.Title
			class="mt-3 text-lg font-semibold leading-tight line-clamp-1"
			title={resource.title}
		>
			{resource.title}
		</Card.Title>
	</Card.Header>

	<Card.Content class="grow">
		<p class="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
			{resource.description || 'No description provided.'}
		</p>
		{#if resource.tags}
			<div class="flex flex-wrap gap-2 mt-auto pt-2">
				{#each resource.tags.split(',') as tag}
					<Badge
						variant="outline"
						class="text-sm text-slate-500 bg-slate-50 border-slate-200 font-normal px-2 hover:bg-gray-200"
					>
						{tag.trim()}
					</Badge>
				{/each}
			</div>
		{/if}
	</Card.Content>

	<Card.Footer class="border-t border-slate-100 pt-4 flex items-center justify-between">
		<span class="text-xs text-slate-400 font-medium">Added {timeAgo(resource.created)}</span>
		<Button
			variant="link"
			class="text-blue-600 p-0 h-auto font-semibold text-sm hover:text-blue-700"
			href={`/resources/${resource.id}`}
		>
			View Details
		</Button>
	</Card.Footer>
</Card.Root>

<!-- ALERT DIALOG COMPONENT -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete
				<span class="font-bold text-slate-900">{resource.title}</span>
				from the library.
			</AlertDialog.Description>
		</AlertDialog.Header>

		<AlertDialog.Footer>
			<AlertDialog.Cancel class="cursor-pointer">Cancel</AlertDialog.Cancel>

			<form
				action="/?/delete"
				method="POST"
				use:enhance={() => {
					return async ({ result, update }) => {
						deleteDialogOpen = false;
						await update();
						if (result.type === 'success') toast.success('Resource deleted successfully.');
						else toast.error('Failed to delete resource.');
					};
				}}
			>
				<input type="hidden" name="id" value={resource.id} />
				<AlertDialog.Action
					type="submit"
					class="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
				>
					Continue
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
