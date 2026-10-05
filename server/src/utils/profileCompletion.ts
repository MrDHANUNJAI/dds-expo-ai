import { UserDocument, FreelancerProfileDocument, SellerProfileDocument } from '../types';

export function calculateFreelancerCompletion(
  user: UserDocument,
  profile: FreelancerProfileDocument
): number {
  let score = 0;

  // Basic info (firstName, lastName, email, phone) = 20%
  if (user.firstName && user.lastName && user.email && user.phone) {
    score += 20;
  } else if (user.firstName && user.lastName && user.email) {
    score += 15;
  }

  // Professional Title = 10%
  if (profile.professionalTitle && profile.professionalTitle.trim().length > 3) {
    score += 10;
  }

  // Bio = 10%
  if (profile.bio && profile.bio.trim().length >= 20) {
    score += 10;
  }

  // Skills (at least 2) = 15%
  if (profile.skills && profile.skills.length >= 2) {
    score += 15;
  } else if (profile.skills && profile.skills.length >= 1) {
    score += 8;
  }

  // Experience level & years = 15%
  if (profile.experienceLevel && profile.yearsOfExperience >= 0) {
    score += 15;
  }

  // Portfolio items (at least 1) = 15%
  if (profile.portfolio && profile.portfolio.length > 0) {
    score += 15;
  }

  // Hourly Rate = 10%
  if (profile.hourlyRate && profile.hourlyRate > 0) {
    score += 10;
  }

  // Profile image = 5%
  if (user.profileImage && user.profileImage.trim().length > 0) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

export function calculateSellerCompletion(
  user: UserDocument,
  profile: SellerProfileDocument
): number {
  let score = 0;

  // Basic info = 20%
  if (user.firstName && user.lastName && user.email) {
    score += 20;
  }

  // Business Name = 20%
  if (profile.businessName && profile.businessName.trim().length > 1) {
    score += 20;
  }

  // Industry = 15%
  if (profile.industry && profile.industry.trim().length > 1) {
    score += 15;
  }

  // Description = 20%
  if (profile.description && profile.description.trim().length >= 20) {
    score += 20;
  }

  // Website = 10%
  if (profile.website && profile.website.trim().length > 3) {
    score += 10;
  }

  // Location = 10%
  if (profile.location && profile.location.trim().length > 1) {
    score += 10;
  }

  // Profile Image = 5%
  if ((profile.profileImage && profile.profileImage.length > 0) || (user.profileImage && user.profileImage.length > 0)) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}
