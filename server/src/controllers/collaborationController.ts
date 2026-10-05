import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../models/db';

export async function getProjectTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const contractId = req.query.contractId as string | undefined;
    const tasks = db.listProjectTasks(projectId, contractId);
    res.json({ success: true, data: tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch tasks' });
  }
}

export async function createProjectTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const { projectId } = req.params;
    const { title, description, assigneeId, assigneeName, status, priority, dueDate, contractId, milestoneId } = req.body;
    if (!title) {
      res.status(400).json({ success: false, message: 'Task title is required' });
      return;
    }

    const task = db.createProjectTask({
      projectId,
      contractId: contractId || '',
      title,
      description: description || '',
      assigneeId: assigneeId || undefined,
      assigneeName: assigneeName || undefined,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate || undefined,
      milestoneId: milestoneId || undefined,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Task created', data: task });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create task' });
  }
}

export async function updateProjectTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : '';
    const user = userId ? db.findUserById(userId) : null;
    const actorName = user ? `${user.firstName} ${user.lastName}` : 'Team Member';
    const task = db.updateProjectTask(id, req.body, actorName);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }
    res.json({ success: true, data: task });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update task' });
  }
}

export async function deleteProjectTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = db.deleteProjectTask(id);
    res.json({ success: true, message: 'Task deleted', data: { deleted } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete task' });
  }
}

export async function getProjectActivities(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const contractId = req.query.contractId as string | undefined;
    const activities = db.listProjectActivities(projectId, contractId);
    res.json({ success: true, data: activities });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch activity log' });
  }
}

export async function getProjectFiles(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const files = db.listProjectFiles(projectId);
    res.json({ success: true, data: files });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch files' });
  }
}

export async function uploadProjectFile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const { projectId } = req.params;
    const { name, size, type, url, folder } = req.body;
    if (!name || !url) {
      res.status(400).json({ success: false, message: 'File name and URL are required' });
      return;
    }

    const user = db.findUserById(req.user.id);
    const uploadedByName = user ? `${user.firstName} ${user.lastName}` : 'Member';

    const file = db.uploadProjectFile({
      projectId,
      name,
      size: size || 1024 * 50,
      type: type || 'application/octet-stream',
      version: 1,
      url,
      uploadedBy: req.user.id,
      uploadedByName,
      folder: folder || 'Documents',
    });

    res.status(201).json({ success: true, message: 'File uploaded', data: file });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to upload file' });
  }
}

export async function deleteProjectFile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = db.deleteProjectFile(id);
    res.json({ success: true, message: 'File deleted', data: { deleted } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete file' });
  }
}
