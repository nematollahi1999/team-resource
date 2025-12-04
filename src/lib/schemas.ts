// src/lib/schemas.ts
import { z } from 'zod/v3';

export const resourceSchema = z.object({
  
  title: z.string().min(10, 'Title is required').max(100),
  url: z.string().url('Must be a valid URL'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.string().min(1, 'Please select a type'),
  tags: z.string().optional().default('')
});

export type ResourceData = z.infer<typeof resourceSchema>;