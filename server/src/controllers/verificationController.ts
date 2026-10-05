import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function getMyVerifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const verifications = db.getUserVerifications(req.user.id);
    const completeness = db.calculateProfileCompleteness(req.user.id);

    res.json({
      success: true,
      data: {
        verifications,
        user: {
          id: req.user.id,
          isEmailVerified: Boolean(req.user.isEmailVerified),
          isPhoneVerified: Boolean(req.user.isPhoneVerified),
          isIdentityVerified: Boolean(req.user.isIdentityVerified),
          isBusinessVerified: Boolean(req.user.isBusinessVerified),
          isPaymentVerified: Boolean(req.user.isPaymentVerified),
        },
        profileCompleteness: completeness,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch verification status' });
  }
}

export async function requestEmailVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    db.requestVerification(req.user.id, 'EMAIL');
    console.log(`[WorkNova Email Verification] Token sent to ${req.user.email}`);

    res.json({
      success: true,
      message: `Verification link sent to ${req.user.email}. Check your inbox or click verify below.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to send verification email' });
  }
}

export async function verifyEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const success = db.verifyEmail(req.user.id);
    if (!success) {
      res.status(400).json({ success: false, message: 'Email verification failed' });
      return;
    }

    res.json({
      success: true,
      message: 'Email address verified successfully!',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to verify email' });
  }
}

export async function sendPhoneOTP(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { phone } = req.body;
    if (!phone || phone.length < 8) {
      res.status(400).json({ success: false, message: 'Please provide a valid mobile number' });
      return;
    }

    db.requestVerification(req.user.id, 'PHONE', { phone });
    console.log(`[WorkNova SMS OTP] Mock OTP '123456' dispatched to ${phone}`);

    res.json({
      success: true,
      message: `One-Time Password sent to ${phone}. Enter code to verify. (Dev hint: 123456)`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
}

export async function verifyPhoneOTP(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { code } = req.body;
    if (!code) {
      res.status(400).json({ success: false, message: 'OTP code is required' });
      return;
    }

    const ok = db.verifyPhoneOTP(req.user.id, code.trim());
    if (!ok) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please check and try again. (Dev hint: 123456)',
        code: 'INVALID_OTP',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Phone number verified successfully!',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to verify phone OTP' });
  }
}

export async function submitIdentityVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { documentType, documentNumber, documentFileUrl } = req.body;
    if (!documentType || !documentNumber) {
      res.status(400).json({ success: false, message: 'Document type and identification number are required' });
      return;
    }

    const doc = db.requestVerification(req.user.id, 'IDENTITY', {
      documentType,
      documentNumber,
      documentFileUrl: documentFileUrl || '/uploads/sample-id.pdf',
    });

    res.status(201).json({
      success: true,
      message: 'Identity verification documents submitted. Review typically completes within 24 hours.',
      data: { verification: doc },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to submit identity verification' });
  }
}

export async function submitBusinessVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { companyName, gstin, registrationNumber, documentUrl } = req.body;
    if (!companyName || (!gstin && !registrationNumber)) {
      res.status(400).json({ success: false, message: 'Company name and GSTIN or registration number required' });
      return;
    }

    const doc = db.requestVerification(req.user.id, 'BUSINESS', {
      companyName,
      gstin,
      registrationNumber,
      documentUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Business verification documents submitted for compliance review.',
      data: { verification: doc },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to submit business verification' });
  }
}
