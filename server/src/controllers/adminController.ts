import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserRole } from '../types';

export async function getAdminOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
  const allUsers = db.listUsers();
  const freelancers = allUsers.filter((u) => u.role === 'FREELANCER');
  const sellers = allUsers.filter((u) => u.role === 'SELLER');
  const admins = allUsers.filter((u) => u.role === 'ADMIN');
  const suspended = allUsers.filter((u) => u.isSuspended);

  const auditLogs = db.listAuditLogs(15);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers: allUsers.length,
        totalFreelancers: freelancers.length,
        totalSellers: sellers.length,
        totalAdmins: admins.length,
        totalSuspended: suspended.length,
      },
      recentLogs: auditLogs,
    },
  });
}

export async function listAdminUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  const role = req.query.role as UserRole | undefined;
  const users = db.listUsers(role);

  const sanitized = users.map((u) => {
    const { passwordHash, ...rest } = u;
    let profile = null;
    if (u.role === 'FREELANCER') {
      profile = db.findFreelancerProfileByUserId(u.id);
    } else if (u.role === 'SELLER') {
      profile = db.findSellerProfileByUserId(u.id);
    }
    return {
      ...rest,
      profile,
    };
  });

  res.json({
    success: true,
    data: sanitized,
  });
}

export async function toggleUserSuspension(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { userId } = req.params;
  const user = db.findUserById(userId);

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (user.role === 'ADMIN') {
    res.status(400).json({ success: false, message: 'Cannot suspend an administrator account.' });
    return;
  }

  const nextSuspended = !user.isSuspended;
  const updated = db.updateUser(userId, { isSuspended: nextSuspended });

  if (nextSuspended) {
    db.removeUserSessions(userId);
  }

  db.createAuditLog({
    userId: req.user?.id,
    userEmail: req.user?.email,
    action: nextSuspended ? 'ADMIN_SUSPENDED_USER' : 'ADMIN_UNSUSPENDED_USER',
    details: { targetUserId: userId, targetEmail: user.email },
  });

  res.json({
    success: true,
    message: `User ${user.email} has been ${nextSuspended ? 'suspended' : 're-activated'}.`,
    data: {
      id: updated.id,
      isSuspended: updated.isSuspended,
    },
  });
}

export async function getAdminAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const logs = db.listAuditLogs(limit);

  res.json({
    success: true,
    data: logs,
  });
}
