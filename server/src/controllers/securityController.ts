import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { comparePasswords, hashPassword } from '../utils/passwordUtils';

export async function getActiveSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const currentToken = req.cookies?.worknova_access_token;
    const sessions = db.listUserActiveSessions(req.user.id, currentToken);

    res.json({
      success: true,
      data: { sessions },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
}

export async function revokeSession(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    db.revokeSession(req.user.id, id);

    res.json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to revoke session' });
  }
}

export async function revokeOtherSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const currentToken = req.cookies?.worknova_access_token || '';
    const count = db.revokeOtherSessions(req.user.id, currentToken);

    res.json({
      success: true,
      message: `Successfully logged out ${count} other sessions`,
      data: { revokedCount: count },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to revoke other sessions' });
  }
}

export async function getSecurityActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const activities = db.listSecurityActivities(req.user.id, 25);
    res.json({
      success: true,
      data: { activities },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch security activity' });
  }
}

export async function setupTwoFactor(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = db.setupTwoFactor(req.user.id);
    res.json({
      success: true,
      message: 'Scan the QR code with Google Authenticator or 1Password, or enter the secret code.',
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to initialize 2FA' });
  }
}

export async function enableTwoFactor(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { code } = req.body;
    if (!code) {
      res.status(400).json({ success: false, message: '6-digit verification code is required' });
      return;
    }

    const ok = db.verifyAndEnableTwoFactor(req.user.id, code.trim());
    if (!ok) {
      res.status(400).json({
        success: false,
        message: 'Invalid code. Enter the 6-digit number shown on your authenticator app.',
        code: 'INVALID_TOTP',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Two-Factor Authentication is now enabled for your account!',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to enable 2FA' });
  }
}

export async function disableTwoFactor(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    db.disableTwoFactor(req.user.id);
    res.json({
      success: true,
      message: 'Two-Factor Authentication has been disabled',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to disable 2FA' });
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const validCurrent = await comparePasswords(currentPassword, req.user.passwordHash);
    if (!validCurrent) {
      res.status(400).json({
        success: false,
        message: 'Incorrect current password',
        code: 'INVALID_PASSWORD',
      });
      return;
    }

    const passwordHash = await hashPassword(newPassword);
    db.updateUser(req.user.id, { passwordHash });
    db.recordSecurityActivity(req.user.id, 'PASSWORD_CHANGE');

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
}
