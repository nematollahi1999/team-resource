// src/lib/schemas.ts
import { z } from 'zod/v3';

// --- 1. RESOURCE SCHEMA ---
export const resourceSchema = z.object({
	title: z.string().min(1, 'Title is required').max(100),
	url: z.string().url('Must be a valid URL'),
	description: z.string().min(10, 'Description must be at least 10 characters'),
	type: z.string().min(1, 'Please select a type'),
	tags: z.string().optional().default('').transform((val) => {
		if (!val) return '';
		return val
			.split(',')                 // Split string by commas
			.map((tag) => tag.trim())   // Remove whitespace around each tag
			.filter((tag) => tag.length > 0) // Remove empty strings
			.join(',');                 // Join back into a clean string
	})
});

export type ResourceData = z.infer<typeof resourceSchema>;

// --- 2. LOGIN SCHEMA ---
export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

export type LoginData = z.infer<typeof loginSchema>;

// --- 3. REGISTER SCHEMA ---
export const registerSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
	message: "Passwords don't match",
	path: ["passwordConfirm"],
});

export type RegisterData = z.infer<typeof registerSchema>;