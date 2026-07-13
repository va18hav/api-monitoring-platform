import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name must be less than 100 characters'),
  description: z.string().optional().nullable(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const createEndpointSchema = z.object({
  name: z.string().min(1, 'Endpoint name is required').max(100, 'Endpoint name must be less than 100 characters'),
  url: z.string().url('Invalid URL format'),
  interval: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.number().int().positive('Interval must be a positive integer')
  ),
  projectId: z.string().uuid('Invalid Project ID format'),
});

export type CreateEndpointInput = z.infer<typeof createEndpointSchema>;
