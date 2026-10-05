import { Router } from 'express';
import { getInvoices, getInvoiceById } from '../controllers/invoiceController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);

export default router;
