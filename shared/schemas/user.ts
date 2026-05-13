import { z } from 'zod';

export const roleSchema = z.enum(['admin', 'user', 'readonly']);

export type Role = z.infer<typeof roleSchema>;

export const profileSchema = z.object({
  sk_profile: z.string().uuid().optional(),
  id: z.string().uuid(),
  email: z.string().email('E-mail inválido').nullable().optional(),
  full_name: z.string().min(1, 'Nome obrigatório'),
  role: roleSchema,
  created_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export type Profile = z.infer<typeof profileSchema>;

export const createProfileSchema = profileSchema.pick({
  email: true,
  full_name: true,
  role: true,
});

export type CreateProfile = z.infer<typeof createProfileSchema>;
