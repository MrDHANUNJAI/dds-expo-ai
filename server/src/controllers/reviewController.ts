import { Request, Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function submitProjectReview(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { projectId } = req.params;
    const {
      rating,
      title,
      comment,
      communicationRating,
      qualityRating,
      professionalismRating,
      timelinessRating,
    } = req.body;

    if (!rating || !comment || comment.trim().length < 10) {
      res.status(400).json({
        success: false,
        message: 'A valid rating (1-5) and written feedback (min 10 characters) are required',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const project = db.findProjectById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Verify contract association
    const contracts = db.listContracts({ projectId });
    const userContract = contracts.find(
      (c) => c.sellerId === req.user?.id || c.freelancerUserId === req.user?.id
    );

    if (!userContract && req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'You are not eligible to review this project. Only contract participants may leave reviews.',
        code: 'NOT_ELIGIBLE',
      });
      return;
    }

    const reviewerId = req.user.id;
    const reviewerRole = req.user.role;
    const revieweeId =
      reviewerId === userContract?.sellerId
        ? userContract!.freelancerUserId
        : userContract!.sellerId;

    try {
      const review = db.createReview({
        projectId,
        contractId: userContract?.id,
        reviewerId,
        reviewerRole,
        revieweeId,
        rating: Number(rating),
        title: title ? title.trim() : undefined,
        comment: comment.trim(),
        communicationRating: Number(communicationRating || rating),
        qualityRating: Number(qualityRating || rating),
        professionalismRating: Number(professionalismRating || rating),
        timelinessRating: Number(timelinessRating || rating),
        status: 'PUBLISHED',
      });

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully!',
        data: { review },
      });
    } catch (createErr: any) {
      if (createErr.message === 'DUPLICATE_REVIEW') {
        res.status(400).json({
          success: false,
          message: 'You have already submitted a review for this project.',
          code: 'DUPLICATE_REVIEW',
        });
        return;
      }
      throw createErr;
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to submit review' });
  }
}

export async function getUserReviews(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const user = db.findUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const reviews = db.listReviewsForUser(userId).map((r) => {
      const reviewer = db.findUserById(r.reviewerId);
      const project = db.findProjectById(r.projectId);
      return {
        ...r,
        reviewerName: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'WorkNova Client',
        reviewerAvatar: reviewer?.avatarUrl,
        projectTitle: project?.title || 'Project',
      };
    });

    const aggregation = db.getReviewAggregation(userId);

    res.json({
      success: true,
      data: {
        reviews,
        aggregation,
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch user reviews' });
  }
}

export async function updateReview(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const review = db.findReviewById(id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    if (review.reviewerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { rating, title, comment, communicationRating, qualityRating, professionalismRating, timelinessRating } = req.body;

    const updated = db.updateReview(id, {
      rating: rating ? Number(rating) : review.rating,
      title: title !== undefined ? title : review.title,
      comment: comment ? comment.trim() : review.comment,
      communicationRating: communicationRating ? Number(communicationRating) : review.communicationRating,
      qualityRating: qualityRating ? Number(qualityRating) : review.qualityRating,
      professionalismRating: professionalismRating ? Number(professionalismRating) : review.professionalismRating,
      timelinessRating: timelinessRating ? Number(timelinessRating) : review.timelinessRating,
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review: updated },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update review' });
  }
}

export async function reportReview(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { reason, description } = req.body;

    const review = db.findReviewById(id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    const report = db.createReport({
      reporterId: req.user.id,
      reviewId: id,
      reportedUserId: review.reviewerId,
      type: 'REVIEW',
      reason: reason || 'Inappropriate Content',
      description: description || 'Flagged review for moderation review',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our trust & safety team will review this.',
      data: { report },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to report review' });
  }
}
