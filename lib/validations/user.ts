import { z } from "zod";

export const roleSchema = z.enum(["SUPER_ADMIN", "ADMIN", "SALES", "SERVICE", "EDITOR"]);

export const inviteUserSchema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().min(1, "Full name is required"),
  role: roleSchema,
  phone: z.string().trim().optional(),
});
export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const updateUserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().trim().min(1).optional(),
  role: roleSchema.optional(),
  phone: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("forms.invalidEmail"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;
