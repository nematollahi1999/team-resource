<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import './layout.css';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Book, Plus, Library } from 'lucide-svelte';
	import Modal from '$lib/components/custom/add/Modal.svelte';
	import AddResourceForm from '$lib/components/custom/add/AddResourceForm.svelte';
	import Toaster from '$lib/components/custom/layout/Toaster.svelte';
	// NEW: Import Store
	import { modalStore } from '$lib/stores/modal';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	// Use store functions
	function openCreateModal() {
		modalStore.openCreate();
	}

	function closeModal() {
		modalStore.close();
	}
</script>

<Toaster />

<div class="min-h-screen flex flex-col bg-slate-50 font-sans antialiased">
	<header
		class="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
	>
		<div class="container mx-auto flex h-14 items-center px-4 justify-between">
			<a href="/" class="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition">
				<Book class="h-6 w-6 text-blue-600" />
				<span class="hidden sm:block">Team Resource Library</span>
				<span class="block sm:hidden">TRL</span>
			</a>

			<nav class="flex items-center gap-4">
				<Button href="/" variant="ghost" size="sm" class="gap-2 cursor-pointer">
					<Library class="h-4 w-4" />
					<span class="hidden sm:block">All Resources</span>
				</Button>

				<Button
					on:click={openCreateModal}
					size="sm"
					class="gap-2 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
				>
					<Plus class="h-4 w-4" />
					<span>Add Resource</span>
				</Button>
			</nav>
		</div>
	</header>

	<main class="flex-1 container mx-auto py-8 px-4">
		<slot />
	</main>

	<footer class="border-t bg-white py-6 md:py-0">
		<div
			class="container mx-auto flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row px-4"
		>
			<div class="text-sm text-muted-foreground">&copy; 2024 Team Resources Library</div>
			<p class="text-center text-sm leading-loose text-muted-foreground md:text-left">
				Built with SvelteKit, Typescript & PocketBase.
			</p>
		</div>
	</footer>

	<!-- Use $modalStore.isOpen instead of local state -->
	<Modal
		open={$modalStore.isOpen}
		onClose={closeModal}
		title={$modalStore.mode === 'create' ? 'Add New Resource' : 'Edit Resource'}
	>
		{#if $page.data.form}
			<AddResourceForm types={data.types} onSuccess={closeModal} data={$page.data.form} />
		{:else}
			<div class="p-4 text-center text-sm text-muted-foreground">
				Form not available on this page.
			</div>
		{/if}
	</Modal>
</div>
