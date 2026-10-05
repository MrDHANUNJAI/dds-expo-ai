import { Router } from 'express';
import {
  getProjectTasks,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
  getProjectActivities,
  getProjectFiles,
  uploadProjectFile,
  deleteProjectFile,
} from '../controllers/collaborationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Tasks
router.get('/:projectId/tasks', getProjectTasks);
router.post('/:projectId/tasks', createProjectTask);
router.put('/tasks/:id', updateProjectTask);
router.delete('/tasks/:id', deleteProjectTask);

// Activity Feed
router.get('/:projectId/activities', getProjectActivities);

// File Manager
router.get('/:projectId/files', getProjectFiles);
router.post('/:projectId/files', uploadProjectFile);
router.delete('/files/:id', deleteProjectFile);

export default router;
