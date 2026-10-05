export type UserRole = 'FREELANCER' | 'SELLER' | 'ADMIN';
export type AccountType = 'INDIVIDUAL' | 'STARTUP' | 'BUSINESS' | 'COMPANY';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface FreelancerProfile {
  id: string;
  userId: string;
  professionalTitle: string;
  bio: string;
  skills: string[];
  experienceLevel: 'Beginner' | 'Intermediate' | 'Expert';
  yearsOfExperience: number;
  hourlyRate: number;
  location: string;
  languages: { language: string; proficiency: string }[];
  education: { degree: string; institution: string; year: string }[];
  certifications: { title: string; issuer: string; year: string }[];
  portfolio: {
    id: string;
    title: string;
    description: string;
    category?: string;
    skills?: string[];
    link?: string;
  }[];
  resumeUrl?: string;
  availability: 'Available Now' | 'Part-time' | 'Busy';
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
}

export interface SellerProfile {
  id: string;
  userId: string;
  accountType: AccountType;
  businessName: string;
  industry: string;
  description: string;
  website: string;
  location: string;
  companySize: string;
  profileImage?: string;
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}
