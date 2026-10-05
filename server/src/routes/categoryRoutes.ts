import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  getSkills,
  createCategory,
  updateCategory,
} from '../controllers/categoryController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getCategories);
router.get('/skills/all', getSkills);
router.get('/:slug', getCategoryBySlug);

// Admin category management
router.post('/', authenticate, requireRole('ADMIN'), createCategory);
router.put('/:id', authenticate, requireRole('ADMIN'), updateCategory);

export default router;
