// src/lib/schemas.ts
import { z } from 'zod';

export const resourceSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters.'),
  url: z.string().url('Must be a valid URL'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.string().trim().min(1, 'Please select a type'),
  tags: z.string().optional()
});

// 1. Keep this for the validator
export type ResourceSchema = typeof resourceSchema;

// 2. ADD THIS: The actual data type (e.g. { title: string, url: string ... })
export type ResourceData = z.infer<typeof resourceSchema>;