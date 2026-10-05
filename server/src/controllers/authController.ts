import { Request, Response } from 'express';
import { db } from '../models/db';
import {
  freelancerRegisterSchema,
  sellerRegisterSchema,
  loginSchema,
  adminLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/authValidators';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/tokenUtils';
import { calculateFreelancerCompletion, calculateSellerCompletion } from '../utils/profileCompletion';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserDocument, UserRole } from '../types';

function sanitizeUser(user: UserDocument) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  // HTTP-only cookie for refresh token
  res.cookie('worknova_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  // Also set access token cookie for convenience
  res.cookie('worknova_access_token', accessToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
    path: '/',
  });
}

export async function registerFreelancer(req: Request, res: Response): Promise<void> {
  try {
    const parsed = freelancerRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Invalid registration data',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const { firstName, lastName, email, phone, password } = parsed.data;

    // Check unique email
    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
        code: 'EMAIL_ALREADY_EXISTS',
      });
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = db.createUser({
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      role: 'FREELANCER',
      isVerified: false,
      isActive: true,
      isSuspended: false,
    });

    const profile = db.createFreelancerProfile({
      userId: user.id,
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

    const completion = calculateFreelancerCompletion(user, profile);
    db.updateFreelancerProfile(user.id, { profileCompletion: completion });
    profile.profileCompletion = completion;

    const payload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    db.createSession(user.id, refreshToken);
    setAuthCookies(res, accessToken, refreshToken);

    db.createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'USER_REGISTER_FREELANCER',
      details: { role: 'FREELANCER' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        profile,
        accessToken,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({
      success: false,
      message: 'Failed to create freelancer account. Please try again.',
      code: error.message,
    });
  }
}

export async function registerSeller(req: Request, res: Response): Promise<void> {
  try {
    const parsed = sellerRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Invalid registration data',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const { firstName, lastName, email, phone, password, accountType, businessName } = parsed.data;

    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
        code: 'EMAIL_ALREADY_EXISTS',
      });
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = db.createUser({
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      role: 'SELLER',
      isVerified: false,
      isActive: true,
      isSuspended: false,
    });

    const profile = db.createSellerProfile({
      userId: user.id,
      accountType,
      businessName: businessName || `${firstName}'s Team`,
      industry: 'Technology',
      description: '',
      website: '',
      location: '',
      companySize: '1-10',
      profileCompletion: 25,
    });

    const completion = calculateSellerCompletion(user, profile);
    db.updateSellerProfile(user.id, { profileCompletion: completion });
    profile.profileCompletion = completion;

    const payload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    db.createSession(user.id, refreshToken);
    setAuthCookies(res, accessToken, refreshToken);

    db.createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'USER_REGISTER_SELLER',
      details: { role: 'SELLER', accountType },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        profile,
        accessToken,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({
      success: false,
      message: 'Failed to create seller account. Please try again.',
      code: error.message,
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Invalid credentials format',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const { email, password, expectedRole } = parsed.data;

    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Incorrect email or password.',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({
        success: false,
        message: 'Your account has been temporarily suspended.',
        code: 'ACCOUNT_SUSPENDED',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED',
      });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      db.createAuditLog({
        userEmail: email,
        action: 'FAILED_LOGIN_ATTEMPT',
        details: { reason: 'BAD_PASSWORD' },
        ipAddress: req.ip,
      });

      res.status(401).json({
        success: false,
        message: 'Incorrect email or password.',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    // Role check: If expectedRole is supplied, ensure it matches!
    if (expectedRole && user.role !== expectedRole) {
      res.status(403).json({
        success: false,
        message: `This account is registered as a ${user.role.toLowerCase()}. Please log in via the ${user.role.toLowerCase()} portal.`,
        code: 'ROLE_MISMATCH',
      });
      return;
    }

    // Update last login
    db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });

    const payload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    db.createSession(user.id, refreshToken);
    setAuthCookies(res, accessToken, refreshToken);

    db.createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'USER_LOGIN',
      details: { role: user.role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Retrieve corresponding profile
    let profile = null;
    if (user.role === 'FREELANCER') {
      profile = db.findFreelancerProfileByUserId(user.id);
    } else if (user.role === 'SELLER') {
      profile = db.findSellerProfileByUserId(user.id);
    }

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        profile,
        accessToken,
      },
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during login.',
      code: 'SERVER_ERROR',
    });
  }
}

export async function adminLogin(req: Request, res: Response): Promise<void> {
  req.body.expectedRole = 'ADMIN';
  return login(req, res);
}

export async function logout(req: AuthenticatedRequest, res: Response): Promise<void> {
  const refreshToken = req.cookies?.worknova_refresh_token;
  if (refreshToken) {
    db.removeSession(refreshToken);
  }

  res.clearCookie('worknova_refresh_token', { path: '/' });
  res.clearCookie('worknova_access_token', { path: '/' });

  if (req.user) {
    db.createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'USER_LOGOUT',
      details: {},
    });
  }

  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export async function refreshSession(req: Request, res: Response): Promise<void> {
  const refreshToken =
    req.cookies?.worknova_refresh_token || (req.body && req.body.refreshToken);

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      message: 'No refresh token provided.',
      code: 'NO_TOKEN',
    });
    return;
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    res.status(401).json({
      success: false,
      message: 'Refresh token expired or invalid.',
      code: 'INVALID_REFRESH_TOKEN',
    });
    return;
  }

  const session = db.findSession(refreshToken);
  if (!session) {
    res.status(401).json({
      success: false,
      message: 'Session has been invalidated.',
      code: 'SESSION_REVOKED',
    });
    return;
  }

  const user = db.findUserById(payload.userId);
  if (!user || !user.isActive || user.isSuspended) {
    res.status(403).json({
      success: false,
      message: 'Account is no longer active.',
      code: 'ACCOUNT_INACTIVE',
    });
    return;
  }

  const newPayload = { userId: user.id, role: user.role, email: user.email };
  const newAccessToken = generateAccessToken(newPayload);

  res.cookie('worknova_access_token', newAccessToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  res.json({
    success: true,
    data: {
      accessToken: newAccessToken,
      user: sanitizeUser(user),
    },
  });
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
      code: 'UNAUTHENTICATED',
    });
    return;
  }

  let profile = null;
  if (req.user.role === 'FREELANCER') {
    profile = db.findFreelancerProfileByUserId(req.user.id);
  } else if (req.user.role === 'SELLER') {
    profile = db.findSellerProfileByUserId(req.user.id);
  }

  res.json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
      profile,
    },
  });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  const { email } = parsed.data;
  const user = db.findUserByEmail(email);

  // Even if user not found, respond with generic success for privacy
  if (!user) {
    res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been generated.',
    });
    return;
  }

  const tokenRecord = db.createPasswordResetToken(user.id);

  console.log(`[WorkNova Dev Email] Password reset requested for ${user.email}.`);
  console.log(`[WorkNova Dev Link] /reset-password?token=${tokenRecord.token}`);

  db.createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'PASSWORD_RESET_REQUESTED',
    details: { token: tokenRecord.token },
  });

  res.json({
    success: true,
    message: 'If an account exists with that email, a password reset link has been generated.',
    data: {
      // In dev environment, return preview token so user can test without real SMTP
      devResetLink: `/reset-password?token=${tokenRecord.token}`,
      devToken: tokenRecord.token,
    },
  });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message || 'Invalid password reset input',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  const { token, newPassword } = parsed.data;
  const tokenRecord = db.findValidPasswordResetToken(token);

  if (!tokenRecord) {
    res.status(400).json({
      success: false,
      message: 'This password reset link is invalid or has expired.',
      code: 'INVALID_OR_EXPIRED_TOKEN',
    });
    return;
  }

  const user = db.findUserById(tokenRecord.userId);
  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User account not found.',
      code: 'USER_NOT_FOUND',
    });
    return;
  }

  const passwordHash = await hashPassword(newPassword);
  db.updateUser(user.id, { passwordHash });
  db.markPasswordResetTokenUsed(token);
  db.removeUserSessions(user.id); // Invalidate all prior sessions

  db.createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'PASSWORD_RESET_COMPLETED',
    details: {},
  });

  res.json({
    success: true,
    message: 'Password updated successfully. You can now log in with your new password.',
  });
}

export async function changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message || 'Invalid password data',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  const { currentPassword, newPassword } = parsed.data;

  const isMatch = await comparePassword(currentPassword, req.user.passwordHash);
  if (!isMatch) {
    res.status(400).json({
      success: false,
      message: 'Your current password was entered incorrectly.',
      code: 'INCORRECT_CURRENT_PASSWORD',
    });
    return;
  }

  const passwordHash = await hashPassword(newPassword);
  db.updateUser(req.user.id, { passwordHash });

  db.createAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'PASSWORD_CHANGED',
    details: {},
  });

  res.json({
    success: true,
    message: 'Password updated successfully.',
  });
}

export async function deactivateAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  db.updateUser(req.user.id, { isActive: false });
  db.removeUserSessions(req.user.id);

  res.clearCookie('worknova_refresh_token', { path: '/' });
  res.clearCookie('worknova_access_token', { path: '/' });

  db.createAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'ACCOUNT_DEACTIVATED_BY_USER',
    details: {},
  });

  res.json({
    success: true,
    message: 'Your account has been deactivated.',
  });
}
