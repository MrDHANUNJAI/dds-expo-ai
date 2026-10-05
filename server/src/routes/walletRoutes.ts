import { Router } from 'express';
import { getWallet, getWalletLedger, getEarningsSummary } from '../controllers/walletController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getWallet);
router.get('/ledger', getWalletLedger);
router.get('/summary', getEarningsSummary);

export default router;
