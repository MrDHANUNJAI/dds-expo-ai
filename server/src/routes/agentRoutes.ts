import { Router } from 'express';
import {
  runAgentTask,
  listAgentTasks,
  getAgentTaskById,
  approveAgentTask,
  rejectAgentTask,
  getAgentCapabilities,
} from '../controllers/agentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/capabilities', getAgentCapabilities);
router.post('/tasks/run', runAgentTask);
router.get('/tasks', listAgentTasks);
router.get('/tasks/:id', getAgentTaskById);
router.post('/tasks/:id/approve', approveAgentTask);
router.post('/tasks/:id/reject', rejectAgentTask);

export default router;
