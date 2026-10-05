import { Router } from 'express';
import {
  getProjects,
  getProjectByIdOrSlug,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  getMySellerProjects,
} from '../controllers/projectController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getProjects);
router.get('/:idOrSlug', getProjectByIdOrSlug);

// Seller project management
router.get('/seller/mine', authenticate, requireRole('SELLER'), getMySellerProjects);
router.post('/', authenticate, requireRole('SELLER'), createProject);
router.put('/:id', authenticate, updateProject);
router.patch('/:id/status', authenticate, updateProjectStatus);
router.delete('/:id', authenticate, deleteProject);

export default router;
