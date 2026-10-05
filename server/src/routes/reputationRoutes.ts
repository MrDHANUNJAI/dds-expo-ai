import { Router } from 'express';
import { getUserReputation, getUserBadges } from '../controllers/reputationController';

const router = Router();

router.get('/user/:userId', getUserReputation);
router.get('/user/:userId/badges', getUserBadges);

export default router;
