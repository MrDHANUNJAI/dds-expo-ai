import { z } from 'zod';

export const freelancerRegisterSchema = z
  .object({
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().trim().min(2, 'Last name must be at least 2 characters'),
    email: z.string().trim().email('Invalid email address'),
    phone: z.string().trim().min(7, 'Phone number must be at least 7 digits'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const sellerRegisterSchema = z
  .object({
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().trim().min(2, 'Last name must be at least 2 characters'),
    email: z.string().trim().email('Invalid email address'),
    phone: z.string().trim().min(7, 'Phone number must be at least 7 digits'),
    accountType: z.enum(['INDIVIDUAL', 'STARTUP', 'BUSINESS', 'COMPANY']),
    businessName: z.string().trim().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
  expectedRole: z.enum(['FREELANCER', 'SELLER', 'ADMIN']).optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10, 'Invalid reset token'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'New password must contain at least one letter')
      .regex(/[0-9]/, 'New password must contain at least one number'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export const freelancerOnboardingSchema = z.object({
  professionalTitle: z.string().trim().min(3, 'Professional title is required'),
  skills: z.array(z.string()).min(1, 'Please select at least 1 primary skill'),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Expert']),
  yearsOfExperience: z.number().min(0).max(50),
  hourlyRate: z.number().min(5).max(1000),
  bio: z.string().trim().min(20, 'Bio should be at least 20 characters'),
  profileImage: z.string().optional(),
  location: z.string().optional(),
});

export const sellerOnboardingSchema = z.object({
  businessName: z.string().trim().min(2, 'Business or personal name is required'),
  industry: z.string().trim().min(2, 'Industry is required'),
  description: z.string().trim().min(20, 'Description should be at least 20 characters'),
  website: z.string().trim().optional(),
  location: z.string().trim().min(2, 'Location is required'),
  companySize: z.string().optional(),
  profileImage: z.string().optional(),
});
