import { z } from 'zod';

// ---------------------------------------------------------------
// Body schemas
// ---------------------------------------------------------------

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  email: z
    .string()
    .trim()
    .email('Email must be a valid email address')
    .max(255, 'Email is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Email must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  // Optional in the body — may also arrive via httpOnly cookie
  refreshToken: z.string().min(1, 'Refresh token is required').optional(),
});