import { z } from 'zod';

// ---------------------------------------------------------------
// Body schemas
// ---------------------------------------------------------------

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name cannot be empty')
      .max(100, 'Name must be 100 characters or fewer')
      .optional(),
    email: z
      .string()
      .trim()
      .email('Email must be a valid email address')
      .max(255, 'Email is too long')
      .optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'At least one field must be provided',
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(72, 'New password must be 72 characters or fewer'),
});