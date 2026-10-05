import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { calculateSellerCompletion } from '../utils/profileCompletion';
import { sellerOnboardingSchema } from '../validators/authValidators';

export async function getSellerProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  let profile = db.findSellerProfileByUserId(req.user.id);
  if (!profile) {
    profile = db.createSellerProfile({
      userId: req.user.id,
      accountType: 'COMPANY',
      businessName: `${req.user.firstName}'s Organization`,
      industry: 'Technology',
      description: '',
      website: '',
      location: '',
      companySize: '1-10',
      profileCompletion: 25,
    });
  }

  const completion = calculateSellerCompletion(req.user, profile);
  if (profile.profileCompletion !== completion) {
    profile = db.updateSellerProfile(req.user.id, { profileCompletion: completion });
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

export async function updateSellerProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const {
    firstName,
    lastName,
    phone,
    businessName,
    industry,
    description,
    website,
    location,
    companySize,
    accountType,
  } = req.body;

  if (firstName || lastName || phone) {
    req.user = db.updateUser(req.user.id, {
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(phone ? { phone } : {}),
    });
  }

  const partial: Record<string, unknown> = {};
  if (businessName !== undefined) partial.businessName = businessName;
  if (industry !== undefined) partial.industry = industry;
  if (description !== undefined) partial.description = description;
  if (website !== undefined) partial.website = website;
  if (location !== undefined) partial.location = location;
  if (companySize !== undefined) partial.companySize = companySize;
  if (accountType !== undefined) partial.accountType = accountType;

  let profile = db.updateSellerProfile(req.user.id, partial);
  const completion = calculateSellerCompletion(req.user, profile);
  profile = db.updateSellerProfile(req.user.id, { profileCompletion: completion });

  db.createAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'SELLER_PROFILE_UPDATED',
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

export async function completeSellerOnboarding(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const parsed = sellerOnboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message || 'Invalid onboarding input',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  const { businessName, industry, description, website, location, companySize, profileImage } = parsed.data;

  if (profileImage) {
    req.user = db.updateUser(req.user.id, { profileImage });
  }

  let profile = db.updateSellerProfile(req.user.id, {
    businessName,
    industry,
    description,
    website: website || '',
    location,
    companySize: companySize || '1-10',
    profileImage: profileImage || req.user.profileImage,
  });

  const completion = calculateSellerCompletion(req.user, profile);
  profile = db.updateSellerProfile(req.user.id, { profileCompletion: completion });

  db.createAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'SELLER_ONBOARDING_COMPLETED',
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

export async function uploadSellerAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
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

  let profile = db.findSellerProfileByUserId(req.user.id);
  if (profile) {
    const completion = calculateSellerCompletion(updatedUser, profile);
    profile = db.updateSellerProfile(req.user.id, {
      profileImage: imageUrl,
      profileCompletion: completion,
    });
  }

  res.json({
    success: true,
    data: {
      imageUrl,
      profileCompletion: profile?.profileCompletion,
    },
  });
}
