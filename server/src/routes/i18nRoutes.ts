import { Router } from 'express';
import { getCurrencies, convertCurrency } from '../controllers/i18nController';

const router = Router();

router.get('/currencies', getCurrencies);
router.get('/convert', convertCurrency);

export default router;
