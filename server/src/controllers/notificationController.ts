import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { unreadOnly, type, limit } = req.query;
    const notifications = db.listUserNotifications(req.user.id, {
      unreadOnly: unreadOnly === 'true',
      type: type ? String(type) : undefined,
      limit: limit ? Number(limit) : 50,
    });

    const unreadCount = db.getUnreadNotificationCount(req.user.id);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const notif = db.markNotificationRead(id, req.user.id);
    if (!notif) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.json({
      success: true,
      data: { notification: notif },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const count = db.markAllNotificationsRead(req.user.id);
    res.json({
      success: true,
      message: `Marked ${count} notifications as read`,
      data: { count },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
}

export async function getNotificationPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const preferences = db.getUserNotificationPreferences(req.user.id);
    res.json({
      success: true,
      data: { preferences },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch preferences' });
  }
}

export async function updateNotificationPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const updated = db.updateUserNotificationPreferences(req.user.id, req.body);
    res.json({
      success: true,
      message: 'Notification settings updated',
      data: { preferences: updated },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: 'Failed to update preferences' });
  }
}
