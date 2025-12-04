<!-- src/lib/components/custom/add/AddResourceForm.svelte -->
<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { resourceSchema } from '$lib/schemas';
	import { toast } from '$lib/stores/toast';
	import { modalStore } from '$lib/stores/modal';

	let { types = [], onSuccess, data } = $props();

	// Initialize Superform
	const { form, errors, constraints, enhance, delayed, reset } = superForm(data, {
		validators: zodClient(resourceSchema),
		resetForm: false, // We handle reset manually
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
		if ($modalStore.mode === 'edit' && $modalStore.resource && $modalStore.isOpen) {
			const r = $modalStore.resource;
			$form.title = r.title;
			$form.url = r.url;
			$form.description = r.description;
			$form.type = r.expand?.type?.id || r.type; // Handle ID or expanded object
			$form.tags = r.tags;
			// We handle ID via hidden input
		} else if ($modalStore.mode === 'create' && !$modalStore.isOpen) {
			// Optional: reset() here if you want to clear form on close
		}
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
		{#if $errors.title}<span class="text-red-500 text-xs">{$errors.title}</span>{/if}
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
		{#if $errors.url}<span class="text-red-500 text-xs">{$errors.url}</span>{/if}
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
			<span class="text-red-500 text-xs h-4 block">{$errors.description || ''}</span>
			<span class="text-xs text-muted-foreground">{charCount} characters</span>
		</div>
	</div>

	<!-- Type -->
	<div class="space-y-2">
		<Label for="type">Type <span class="text-red-500">*</span></Label>
		<select
			id="type"
			name="type"
			class="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
			bind:value={$form.type}
			{...$constraints.type}
		>
			<option value="" disabled selected>Select resource type</option>
			{#each types as t}
				<option value={t.id}>{t.resource_type}</option>
			{/each}
		</select>
		{#if $errors.type}<span class="text-red-500 text-xs">{$errors.type}</span>{/if}
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
