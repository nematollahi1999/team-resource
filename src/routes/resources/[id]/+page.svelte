<!-- src/routes/resources/[id]/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores'; // 1. Import page store
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

	// Icons
	import {
		ExternalLink, Calendar, Clock, Pencil, Trash2,
		FileText, PlayCircle, Wrench, GraduationCap, 
		Book, HelpCircle
	} from 'lucide-svelte';

	// Stores
	import { modalStore } from '$lib/stores/modal';
	import { toast } from '$lib/stores/toast';

	let { data } = $props();
	let resource = $derived(data.resource);
	
	// 2. Derive user state from global page data
	let user = $derived($page.data.user);
	
	let deleteDialogOpen = $state(false);

	// --- Helpers ---
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric', month: 'long', day: 'numeric'
		});
	}

	function getTypeIcon(typeStr: string | undefined) {
		const t = typeStr?.toLowerCase() || '';
		switch (t) {
			case 'article': return FileText;
			case 'video': return PlayCircle;
			case 'tool': return Wrench;
			case 'tutorial': return GraduationCap;
			case 'docs': return Book;
			default: return HelpCircle;
		}
	}

	function getTypeColor(typeStr: string | undefined) {
		const t = typeStr?.toLowerCase() || '';
		switch (t) {
			case 'docs': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
			case 'tool': return 'bg-green-50 text-green-700 border-green-200';
			case 'tutorial': return 'bg-purple-50 text-purple-700 border-purple-200';
			case 'article': return 'bg-blue-50 text-blue-700 border-blue-200';
			case 'video': return 'bg-red-50 text-red-700 border-red-200';
			default: return 'bg-slate-100 text-slate-700 border-slate-200';
		}
	}

	let TypeIcon = $derived(getTypeIcon(resource.expand?.type?.resource_type));
	let typeColor = $derived(getTypeColor(resource.expand?.type?.resource_type));
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Shadcn Breadcrumb -->
	<Breadcrumb.Root>
		<Breadcrumb.List>
			<Breadcrumb.Item>
				<Breadcrumb.Link href="/">All Resources</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Page>{resource.title}</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>

	<!-- Main Card -->
	<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
		<div class="space-y-8 p-8">
			<!-- Header Section -->
			<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div class="flex-1 space-y-4">
					<!-- Type Badge (Dynamic Color) -->
					<div
						class="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium capitalize {typeColor}"
					>
						<TypeIcon class="h-4 w-4" />
						{resource.expand?.type?.resource_type || 'Resource'}
					</div>

					<!-- Title -->
					<h1 class="text-3xl font-bold leading-tight tracking-tight text-slate-900">
						{resource.title}
					</h1>

					<!-- Tags -->
					{#if resource.tags}
						<div class="flex flex-wrap gap-2">
							{#each resource.tags.split(',') as tag}
								<span
									class="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm text-slate-600"
								>
									{tag.trim()}
								</span>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Action Buttons: ONLY SHOW IF LOGGED IN -->
				{#if user}
					<div class="flex shrink-0 items-center gap-2">
						<Button
							variant="outline"
							class="cursor-pointer gap-2"
							onclick={() => modalStore.openEdit(resource)}
						>
							<Pencil class="h-4 w-4" />
							Edit
						</Button>

						<!-- TRIGGER BUTTON -->
						<Button
							variant="destructive"
							class="cursor-pointer gap-2 border border-red-100 bg-red-50 text-red-600 shadow-none hover:bg-red-100 hover:text-red-700"
							onclick={() => (deleteDialogOpen = true)}
						>
							<Trash2 class="h-4 w-4" />
							Delete
						</Button>
					</div>
				{/if}
			</div>

			<!-- URL Box -->
			<div class="rounded-lg border border-slate-100 bg-slate-50/50 p-5">
				<div class="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
					Resource URL
				</div>
				<a
					href={resource.url}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1 break-all font-medium text-blue-600 hover:text-blue-800"
				>
					{resource.url}
					<ExternalLink class="h-3.5 w-3.5" />
				</a>
			</div>

			<!-- Description -->
			<div class="space-y-3">
				<h3 class="text-lg font-semibold text-slate-900">Description</h3>
				<div
					class="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-600"
				>
					{resource.description}
				</div>
			</div>

			<!-- Divider -->
			<div class="border-t border-slate-100"></div>

			<!-- Meta Data Footer -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="flex items-center gap-3">
					<div class="rounded-md border border-slate-100 bg-slate-50 p-2 text-slate-400">
						<Calendar class="h-5 w-5" />
					</div>
					<div>
						<div class="text-xs font-medium text-slate-500">Added</div>
						<div class="text-sm text-slate-900">{formatDate(resource.created)}</div>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<div class="rounded-md border border-slate-100 bg-slate-50 p-2 text-slate-400">
						<Clock class="h-5 w-5" />
					</div>
					<div>
						<div class="text-xs font-medium text-slate-500">Last Updated</div>
						<div class="text-sm text-slate-900">{formatDate(resource.updated)}</div>
					</div>
				</div>
			</div>

			<!-- Bottom Action -->
			<div class="pt-4">
				<Button
					href={resource.url}
					target="_blank"
					size="lg"
					class="w-full cursor-pointer gap-2 bg-blue-600 hover:bg-blue-700 sm:w-auto"
				>
					Visit Resource
					<ExternalLink class="h-4 w-4" />
				</Button>
			</div>
		</div>
	</div>
</div>

<!-- ALERT DIALOG COMPONENT -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete this resource?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete
				<span class="font-bold text-slate-900">{resource.title}</span>
				and redirect you to the home page.
			</AlertDialog.Description>
		</AlertDialog.Header>

		<AlertDialog.Footer>
			<AlertDialog.Cancel class="cursor-pointer">Cancel</AlertDialog.Cancel>

			<form
				action="?/delete"
				method="POST"
				use:enhance={({ cancel }) => {
					return async ({ result }) => {
						if (result.type === 'redirect') {
							toast.success('Resource deleted successfully.');
							goto(result.location);
						} else if (result.type === 'failure' || result.type === 'error') {
							deleteDialogOpen = false;
							toast.error('Failed to delete resource');
						}
					};
				}}
			>
				<AlertDialog.Action
					type="submit"
					class="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
				>
					Delete
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
