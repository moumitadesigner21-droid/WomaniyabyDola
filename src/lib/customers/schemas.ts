import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{10,15}$/, "Please enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{10,15}$/, "Please enter a valid phone number.")
    .nullable()
    .optional()
    .or(z.literal("")),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "New password must be at least 8 characters.").max(200),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  label: z.string().trim().max(40).nullable().optional(),
  fullName: z.string().trim().min(2, "Full name is required.").max(120),
  phone: z.string().trim().regex(/^\+?[\d\s-]{10,15}$/, "Please enter a valid phone number."),
  line1: z.string().trim().min(3, "Address line is required.").max(200),
  line2: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().min(2, "City is required.").max(80),
  state: z.string().trim().min(2, "State is required.").max(80),
  postalCode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit PIN code."),
  landmark: z.string().trim().max(200).nullable().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const wishlistSchema = z.object({
  productIds: z.array(z.string().trim().min(1).max(100)).max(200),
});
