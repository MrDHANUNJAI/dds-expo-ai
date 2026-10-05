import { Router } from 'express';
import { createReport, getMyReports } from '../controllers/reportController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', createReport);
router.get('/me', getMyReports);

export default router;
