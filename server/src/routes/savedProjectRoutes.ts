import { Router } from 'express';
import { getSavedProjects, toggleSaveProject } from '../controllers/savedProjectController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, requireRole('FREELANCER'), getSavedProjects);
router.post('/:projectId/toggle', authenticate, requireRole('FREELANCER'), toggleSaveProject);

export default router;
