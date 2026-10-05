import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokenUtils';
import { db } from '../models/db';
import { UserDocument, UserRole } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
  userId?: string;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.worknova_access_token) {
    token = req.cookies.worknova_access_token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. No session token provided.',
      code: 'UNAUTHENTICATED',
    });
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      message: 'Your session has expired. Please log in again.',
      code: 'TOKEN_EXPIRED',
    });
    return;
  }

  const user = db.findUserById(payload.userId);
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'User account not found.',
      code: 'USER_NOT_FOUND',
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
      message: 'Your account has been deactivated.',
      code: 'ACCOUNT_INACTIVE',
    });
    return;
  }

  req.user = user;
  req.userId = user.id;
  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'UNAUTHENTICATED',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You don't have permission to access this resource.",
        code: 'FORBIDDEN_ROLE',
      });
      return;
    }

    next();
  };
}
