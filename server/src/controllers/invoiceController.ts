import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function getInvoices(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const invoices =
      req.user.role === 'SELLER'
        ? db.listInvoices({ sellerId: req.user.id })
        : req.user.role === 'FREELANCER'
        ? db.listInvoices({ freelancerId: req.user.id })
        : db.listInvoices();

    res.json({
      success: true,
      data: { invoices },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch invoices', code: 'SERVER_ERROR' });
  }
}

export async function getInvoiceById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const invoice = db.findInvoiceById(id);
    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found', code: 'NOT_FOUND' });
      return;
    }

    // Permission check
    if (invoice.sellerId !== req.user.id && invoice.freelancerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized', code: 'FORBIDDEN' });
      return;
    }

    const payment = db.findPaymentById(invoice.paymentId);
    const milestone = db.findMilestoneById(invoice.milestoneId);

    res.json({
      success: true,
      data: {
        invoice,
        payment,
        milestone,
        platform: {
          name: 'WorkNova Global Marketplace',
          legalEntity: 'WorkNova Technologies Private Limited',
          address: 'Tech Quarter, Bengaluru, Karnataka, 560103',
          taxId: 'GSTIN29AAACW1234F1Z5',
          contactEmail: 'billing@worknova.io',
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch invoice details', code: 'SERVER_ERROR' });
  }
}

export async function downloadInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const invoice = db.findInvoiceById(id);
    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }

    // Return structured printable representation
    res.json({
      success: true,
      data: {
        invoiceNumber: invoice.invoiceNumber,
        issuedDate: invoice.issuedAt,
        seller: { name: invoice.sellerName, company: invoice.sellerCompany },
        freelancer: { name: invoice.freelancerName },
        projectTitle: invoice.projectTitle,
        milestoneTitle: invoice.milestoneTitle,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        total: invoice.total,
        status: invoice.status,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to download invoice' });
  }
}
