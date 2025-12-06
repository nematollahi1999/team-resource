<!-- src/lib/components/custom/add/AddResourceForm.svelte -->
<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';

	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { SuperValidated } from 'sveltekit-superforms';

	import { resourceSchema, type ResourceData } from '$lib/schemas';
	import type { ResourceType } from '$lib/types';

	import { toast } from '$lib/stores/toast';
	import { modalStore } from '$lib/stores/modal';

	// Svelte 5 Props
	let { 
		types = [], 
		onSuccess, 
		data 
	} = $props<{ 
		types: ResourceType[], 
		onSuccess: () => void, 
		data: SuperValidated<ResourceData> 
	}>();

	// Initialize Superform
	const { form, errors, constraints, enhance, delayed, reset } = superForm(data, {
		validators: zodClient(resourceSchema),
		resetForm: false, 
		onResult: ({ result }) => {
			if (result.type === 'success') {
				const action = $modalStore.mode === 'create' ? 'added' : 'updated';
				toast.success(`Resource ${action} successfully!`);
				onSuccess(); // Close modal
				if ($modalStore.mode === 'create') reset();
			} else if (result.type === 'failure' || result.type === 'error') {
				toast.error('Operation failed. Please check inputs.');
			}
		}
	});

	// React to Modal Opening for EDIT mode
	$effect(() => {
		if ($modalStore.isOpen && $modalStore.mode === 'edit' && $modalStore.resource) {
			const r = $modalStore.resource;
			$form.title = r.title;
			$form.url = r.url;
			$form.description = r.description;
			// Handle ID or expanded object
			$form.type = r.expand?.type?.id || r.type || ''; 
			$form.tags = r.tags || '';
		} 
	});

	// Derived state: Calculate the label to show in the Select Trigger
	// This avoids using <Select.Value> which can cause crashes in some setups
	let selectedTypeLabel = $derived.by(() => {
		const selectedId = $form.type;
		if (!selectedId) return "Select resource type";
		const found = types.find((t: ResourceType) => t.id === selectedId);
		return found ? found.resource_type : "Select resource type";
	});

	let charCount = $derived($form.description ? $form.description.length : 0);
	let formAction = $derived($modalStore.mode === 'create' ? '/?/createResource' : '/?/updateResource');
</script>

<form method="POST" action={formAction} use:enhance class="space-y-5" novalidate>
	
	{#if $modalStore.mode === 'edit' && $modalStore.resource}
		<input type="hidden" name="id" value={$modalStore.resource.id} />
	{/if}

	<!-- Title -->
	<div class="space-y-2">
		<Label for="title">Title <span class="text-red-500">*</span></Label>
		<Input
			id="title"
			name="title"
			placeholder="Enter resource title"
			aria-invalid={$errors.title ? 'true' : undefined}
			bind:value={$form.title}
			{...$constraints.title}
		/>
		{#if $errors.title}
			<span class="text-red-500 text-xs">{$errors.title}</span>
		{/if}
	</div>

	<!-- URL -->
	<div class="space-y-2">
		<Label for="url">URL <span class="text-red-500">*</span></Label>
		<Input
			id="url"
			name="url"
			type="url"
			placeholder="https://example.com"
			bind:value={$form.url}
			{...$constraints.url}
		/>
		{#if $errors.url}
			<span class="text-red-500 text-xs">{$errors.url}</span>
		{/if}
	</div>

	<!-- Description -->
	<div class="space-y-2">
		<Label for="description">Description <span class="text-red-500">*</span></Label>
		<textarea
			class="flex min-h-20 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
			name="description"
			id="description"
			placeholder="Enter resource description (minimum 10 characters)"
			bind:value={$form.description}
			{...$constraints.description}
		></textarea>
		<div class="flex justify-between items-center">
			<span class="text-red-500 text-xs h-4 block">
				{$errors.description ? $errors.description : ''}
			</span>
			<span class="text-xs text-muted-foreground">{charCount} characters</span>
		</div>
	</div>

	<!-- SHADCN SELECT for Type -->
	<div class="space-y-2">
		<Label for="type">Type <span class="text-red-500">*</span></Label>
		
		<!-- 1. The Visual Component -->
		<!-- Note: We do NOT put name="type" here to avoid duplicate inputs with the hidden one below -->
		<Select.Root
			type="single"
			bind:value={$form.type}
		>
			<Select.Trigger class="w-full capitalize bg-white">
				<!-- Render Label Directly -->
				{selectedTypeLabel}
			</Select.Trigger>
			<Select.Content>
				{#each types as t}
					<Select.Item value={t.id} label={t.resource_type} class="capitalize">
						{t.resource_type}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

		<!-- 2. The Hidden Input (Crucial for Superforms) -->
		<!-- This ensures the form data is sent correctly even if JS acts up -->
		<input 
			type="hidden" 
			name="type" 
			bind:value={$form.type} 
			{...$constraints.type} 
		/>

		{#if $errors.type}
			<span class="text-red-500 text-xs">{$errors.type}</span>
		{/if}
	</div>

	<!-- Tags -->
	<div class="space-y-2">
		<Label for="tags">Tags</Label>
		<Input
			id="tags"
			name="tags"
			placeholder="Enter tags separated by commas"
			bind:value={$form.tags}
			{...$constraints.tags}
		/>
		<span class="text-xs text-muted-foreground block">Separate multiple tags with commas</span>
	</div>

	<!-- Footer Actions -->
	<div class="flex justify-end gap-3 pt-4 border-t mt-2">
		<Button type="button" variant="outline" class="cursor-pointer" onclick={onSuccess}>
			Cancel
		</Button>
		<Button
			type="submit"
			disabled={$delayed}
			class="gap-2 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
		>
			{$delayed ? 'Saving...' : $modalStore.mode === 'create' ? 'Add Resource' : 'Save Changes'}
		</Button>
	</div>
</form>