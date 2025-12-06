<!-- src/routes/login/+page.svelte -->
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { loginSchema } from '$lib/schemas';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
    import { Loader } from 'lucide-svelte';

	//imports for the url redirection after login
	import { page } from '$app/state';
	import { toast } from '$lib/stores/toast';
	import { replaceState } from '$app/navigation';
	import { onMount, untrack } from 'svelte';

	let { data } = $props();

	const { form, errors, enhance, delayed, message } = superForm(untrack(() => data.form), {
		validators: zodClient(loginSchema)
	});

	onMount(() => {
		const params = new URLSearchParams(page.url.searchParams);

		if (params.get('message') === 'login_required') {
			toast.error('You must be logged in to view this resource.');

			// FIX: Wrap in setTimeout to ensure Router is initialized
			setTimeout(() => {
				// Remove ONLY the 'message' param. 
				// IMPORTANT: Keep 'redirectTo' so the form knows where to go!
				params.delete('message');

				const newUrl = new URL(page.url);
				newUrl.search = params.toString();

				replaceState(newUrl, page.state);
			}, 0);
		}
	});
</script>

<div class="flex min-h-[80vh] items-center justify-center px-4">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Login</Card.Title>
			<Card.Description>Enter your email below to login to your account</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance class="grid gap-4">
				{#if $message}
					<div class="p-3 rounded bg-red-50 text-red-600 text-sm">{$message}</div>
				{/if}

				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="m@example.com"
						bind:value={$form.email}
					/>
					{#if $errors.email}<span class="text-xs text-red-500">{$errors.email}</span>{/if}
				</div>

				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<Input id="password" name="password" type="password" bind:value={$form.password} />
					{#if $errors.password}<span class="text-xs text-red-500">{$errors.password}</span>{/if}
				</div>

				<Button type="submit" class="w-full" disabled={$delayed}>
					{#if $delayed}
						<Loader class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Login
				</Button>
			</form>
			<div class="mt-4 text-center text-sm">
				Don't have an account? <a href="/register" class="underline">Sign up</a>
			</div>
		</Card.Content>
	</Card.Root>
</div>
