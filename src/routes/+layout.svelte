<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import './layout.css';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import * as Dialog from '$lib/components/ui/dialog';
	import { fly } from 'svelte/transition';
	
	// Icons
	import { 
		Book, Plus, Library, X, 
		CircleCheck , CircleAlert , Info, LogOut, LogIn
	} from 'lucide-svelte';
	
	import AddResourceForm from '$lib/components/custom/add/AddResourceForm.svelte';
	
	import { modalStore } from '$lib/stores/modal';
	import { toast } from '$lib/stores/toast';

	let { children, data } = $props();

	function openCreateModal() {
		modalStore.openCreate();
	}

	function closeModal() {
		modalStore.close();
	}
	
	function getAlertConfig(type: string) {
		switch (type) {
			case 'error': return { variant: 'destructive' as const, icon: CircleAlert , title: 'Error' };
			case 'success': return { variant: 'default' as const, icon: CircleCheck , title: 'Success' };
			default: return { variant: 'default' as const, icon: Info, title: 'Info' };
		}
	}
</script>

<svelte:head>
    <title>Team Resource Library</title>
</svelte:head>


<div
	class="fixed top-4 right-4 z-100 flex flex-col gap-3 w-full max-w-[400px] px-4 md:px-0 pointer-events-none"
>
	{#each $toast as t (t.id)}
		{@const config = getAlertConfig(t.type)}
		<!-- Assign component to a capitalized variable  -->
		{@const Icon = config.icon}

		<div transition:fly={{ x: 300, duration: 300 }} class="pointer-events-auto">
			<Alert.Root
				variant={config.variant}
				class="bg-white dark:bg-slate-950 shadow-md relative pr-10"
			>
				<!-- Render Dynamic Component Directly -->
				<Icon class="h-4 w-4 {t.type === 'success' ? 'text-green-600' : ''}" />

				<Alert.Title class={t.type === 'success' ? 'text-green-700' : ''}>
					{config.title}
				</Alert.Title>

				<Alert.Description>{t.message}</Alert.Description>

				<button
					onclick={() => toast.remove(t.id)}
					class="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
				>
					<X class="h-4 w-4" />
					<span class="sr-only">Close</span>
				</button>
			</Alert.Root>
		</div>
	{/each}
</div>

<div class="min-h-screen flex flex-col bg-slate-50 font-sans antialiased">
	<header
		class="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60"
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

				<!-- AUTH BUTTONS -->
				{#if data.user}
					<Button
						onclick={openCreateModal}
						size="sm"
						class="gap-2 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
					>
						<Plus class="h-4 w-4" />
						<span class="hidden sm:inline">Add Resource</span>
					</Button>

					<form action="/logout" method="POST">
						<Button variant="ghost" size="sm" type="submit" class="gap-2 cursor-pointer">
							<LogOut class="h-4 w-4" />
							<span class="hidden sm:inline">Logout</span>
						</Button>
					</form>
				{:else}
					<Button href="/login" size="sm" variant="outline" class="gap-2 cursor-pointer">
						<LogIn class="h-4 w-4" />
						Login
					</Button>
				{/if}
			</nav>
		</div>
	</header>

	<main class="flex-1 container mx-auto py-8 px-4">
		{@render children?.()}
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

	<Dialog.Root
		open={$modalStore.isOpen}
		onOpenChange={(open) => {
			if (!open) closeModal();
		}}
	>
		<Dialog.Content class="sm:max-w-[500px]">
			<Dialog.Header>
				<Dialog.Title>
					{$modalStore.mode === 'create' ? 'Add New Resource' : 'Edit Resource'}
				</Dialog.Title>
			</Dialog.Header>

			<div class="pt-2">
				{#if $page.data.form}
					<AddResourceForm types={data.types} onSuccess={closeModal} data={$page.data.form} />
				{:else}
					<div class="p-4 text-center text-sm text-muted-foreground">
						Form not available on this page.
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Root>
</div>
