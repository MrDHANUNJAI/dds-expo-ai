import { Request, Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function createTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { category, subject, description, priority } = req.body;
    if (!category || !subject || !description) {
      res.status(400).json({
        success: false,
        message: 'Category, subject, and description are required',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const ticket = db.createSupportTicket({
      userId: req.user.id,
      category,
      subject: subject.trim(),
      description: description.trim(),
      priority: priority || 'MEDIUM',
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted. A support specialist will respond shortly.',
      data: { ticket },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create support ticket' });
  }
}

export async function getTickets(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { status, category } = req.query;
    const tickets =
      req.user.role === 'ADMIN'
        ? db.listSupportTickets({
            status: status ? (String(status) as any) : undefined,
            category: category ? (String(category) as any) : undefined,
          })
        : db.listSupportTickets({
            userId: req.user.id,
            status: status ? (String(status) as any) : undefined,
            category: category ? (String(category) as any) : undefined,
          });

    res.json({
      success: true,
      data: { tickets },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
}

export async function getTicketById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const ticket = db.findSupportTicketById(id);
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    if (ticket.userId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized to view this ticket' });
      return;
    }

    // Filter out internal admin notes if user is not ADMIN
    const messages = req.user.role === 'ADMIN'
      ? ticket.messages
      : ticket.messages.filter((m) => !m.isInternalNote);

    res.json({
      success: true,
      data: {
        ticket: {
          ...ticket,
          messages,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch ticket' });
  }
}

export async function replyToTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { content, attachments, isInternalNote } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Message content is required' });
      return;
    }

    const ticket = db.findSupportTicketById(id);
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    if (ticket.userId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const isInternal = Boolean(isInternalNote && req.user.role === 'ADMIN');

    const updated = db.addSupportMessage(id, {
      senderId: req.user.id,
      senderRole: req.user.role,
      senderName: `${req.user.firstName} ${req.user.lastName}`,
      content: content.trim(),
      attachments: attachments || [],
      isInternalNote: isInternal,
    });

    res.status(201).json({
      success: true,
      message: 'Reply posted successfully',
      data: { ticket: updated },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to post reply' });
  }
}

export async function closeTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const ticket = db.findSupportTicketById(id);
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    if (ticket.userId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const updated = db.updateSupportTicket(id, { status: 'CLOSED' });
    res.json({
      success: true,
      message: 'Support ticket closed',
      data: { ticket: updated },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to close ticket' });
  }
}

export async function getFAQs(_req: Request, res: Response): Promise<void> {
  try {
    const faqs = db.listFAQs(true);
    res.json({
      success: true,
      data: { faqs },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch FAQs' });
  }
}
