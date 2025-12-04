<!-- src/routes/register/+page.svelte -->
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { registerSchema } from '$lib/schemas';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
    import { Loader2 } from 'lucide-svelte';

	let { data } = $props();

	const { form, errors, enhance, delayed, message } = superForm(data.form, {
		validators: zodClient(registerSchema)
	});
</script>

<div class="flex min-h-[80vh] items-center justify-center px-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-2xl">Create an account</Card.Title>
			<Card.Description>Enter your email below to create your account</Card.Description>
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

				<div class="grid gap-2">
					<Label for="passwordConfirm">Confirm Password</Label>
					<Input
						id="passwordConfirm"
						name="passwordConfirm"
						type="password"
						bind:value={$form.passwordConfirm}
					/>
					{#if $errors.passwordConfirm}
						<span class="text-xs text-red-500">{$errors.passwordConfirm}</span>
					{/if}
				</div>

				<Button type="submit" class="w-full" disabled={$delayed}>
					{#if $delayed}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Create Account
				</Button>
			</form>
			<div class="mt-4 text-center text-sm">
				Already have an account? <a href="/login" class="underline">Login</a>
			</div>
		</Card.Content>
	</Card.Root>
</div>
