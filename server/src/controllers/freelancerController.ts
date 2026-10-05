import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { calculateFreelancerCompletion } from '../utils/profileCompletion';
import { freelancerOnboardingSchema } from '../validators/authValidators';

export async function getFreelancerProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  let profile = db.findFreelancerProfileByUserId(req.user.id);
  if (!profile) {
    profile = db.createFreelancerProfile({
      userId: req.user.id,
      professionalTitle: '',
      bio: '',
      skills: [],
      experienceLevel: 'Intermediate',
      yearsOfExperience: 0,
      hourlyRate: 35,
      location: '',
      languages: [{ language: 'English', proficiency: 'Fluent' }],
      education: [],
      certifications: [],
      portfolio: [],
      availability: 'Available Now',
      profileCompletion: 20,
    });
  }

  const completion = calculateFreelancerCompletion(req.user, profile);
  if (profile.profileCompletion !== completion) {
    profile = db.updateFreelancerProfile(req.user.id, { profileCompletion: completion });
  }

  res.json({
    success: true,
    data: {
      profile,
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        profileImage: req.user.profileImage,
        isVerified: req.user.isVerified,
      },
    },
  });
}

export async function updateFreelancerProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const {
    firstName,
    lastName,
    phone,
    professionalTitle,
    bio,
    skills,
    experienceLevel,
    yearsOfExperience,
    hourlyRate,
    location,
    languages,
    education,
    certifications,
    portfolio,
    availability,
  } = req.body;

  // Update user basic info if provided
  if (firstName || lastName || phone) {
    req.user = db.updateUser(req.user.id, {
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(phone ? { phone } : {}),
    });
  }

  const partialProfile: Record<string, unknown> = {};
  if (professionalTitle !== undefined) partialProfile.professionalTitle = professionalTitle;
  if (bio !== undefined) partialProfile.bio = bio;
  if (skills !== undefined) partialProfile.skills = skills;
  if (experienceLevel !== undefined) partialProfile.experienceLevel = experienceLevel;
  if (yearsOfExperience !== undefined) partialProfile.yearsOfExperience = Number(yearsOfExperience);
  if (hourlyRate !== undefined) partialProfile.hourlyRate = Number(hourlyRate);
  if (location !== undefined) partialProfile.location = location;
  if (languages !== undefined) partialProfile.languages = languages;
  if (education !== undefined) partialProfile.education = education;
  if (certifications !== undefined) partialProfile.certifications = certifications;
  if (portfolio !== undefined) partialProfile.portfolio = portfolio;
  if (availability !== undefined) partialProfile.availability = availability;

  let profile = db.updateFreelancerProfile(req.user.id, partialProfile);
  const completion = calculateFreelancerCompletion(req.user, profile);
  profile = db.updateFreelancerProfile(req.user.id, { profileCompletion: completion });

  db.createAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'FREELANCER_PROFILE_UPDATED',
    details: { profileCompletion: completion },
  });

  res.json({
    success: true,
    data: {
      profile,
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        profileImage: req.user.profileImage,
      },
    },
  });
}

export async function completeFreelancerOnboarding(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const parsed = freelancerOnboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message || 'Invalid onboarding input',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  const { professionalTitle, skills, experienceLevel, yearsOfExperience, hourlyRate, bio, profileImage, location } = parsed.data;

  if (profileImage) {
    req.user = db.updateUser(req.user.id, { profileImage });
  }

  let profile = db.updateFreelancerProfile(req.user.id, {
    professionalTitle,
    skills,
    experienceLevel,
    yearsOfExperience,
    hourlyRate,
    bio,
    location: location || 'Remote',
  });

  const completion = calculateFreelancerCompletion(req.user, profile);
  profile = db.updateFreelancerProfile(req.user.id, { profileCompletion: completion });

  db.createAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'FREELANCER_ONBOARDING_COMPLETED',
    details: { profileCompletion: completion },
  });

  res.json({
    success: true,
    data: {
      profile,
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        profileImage: req.user.profileImage,
      },
    },
  });
}

export async function uploadFreelancerAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  if (!req.file) {
    res.status(400).json({
      success: false,
      message: 'No image file uploaded.',
      code: 'NO_FILE',
    });
    return;
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  const updatedUser = db.updateUser(req.user.id, { profileImage: imageUrl });

  let profile = db.findFreelancerProfileByUserId(req.user.id);
  if (profile) {
    const completion = calculateFreelancerCompletion(updatedUser, profile);
    profile = db.updateFreelancerProfile(req.user.id, { profileCompletion: completion });
  }

  res.json({
    success: true,
    data: {
      imageUrl,
      profileCompletion: profile?.profileCompletion,
    },
  });
}
