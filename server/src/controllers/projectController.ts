import { Request, Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ProjectStatus, BudgetType, ExperienceLevel, ProjectScope } from '../types';

export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    const {
      status,
      category,
      subcategory,
      budgetType,
      experienceLevel,
      minBudget,
      maxBudget,
      search,
      sellerId,
      page = '1',
      limit = '12',
    } = req.query;

    const parsedStatus = status ? (String(status).toUpperCase() as ProjectStatus | 'ALL') : undefined;
    const parsedMin = minBudget ? Number(minBudget) : undefined;
    const parsedMax = maxBudget ? Number(maxBudget) : undefined;
    const pNum = Math.max(1, parseInt(String(page), 10) || 1);
    const lNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 12));

    const allMatching = db.listProjects({
      status: parsedStatus,
      categoryId: category ? String(category) : undefined,
      subcategoryId: subcategory ? String(subcategory) : undefined,
      budgetType: budgetType ? (String(budgetType).toLowerCase() as BudgetType) : undefined,
      experienceLevel: experienceLevel ? String(experienceLevel) : undefined,
      minBudget: parsedMin,
      maxBudget: parsedMax,
      search: search ? String(search) : undefined,
      sellerId: sellerId ? String(sellerId) : undefined,
    });

    const total = allMatching.length;
    const totalPages = Math.ceil(total / lNum) || 1;
    const startIndex = (pNum - 1) * lNum;
    const projects = allMatching.slice(startIndex, startIndex + lNum);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          page: pNum,
          limit: lNum,
          totalPages,
        },
      },
    });
  } catch (err: any) {
    console.error('getProjects error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch projects', code: 'SERVER_ERROR' });
  }
}

export async function getProjectByIdOrSlug(req: Request, res: Response): Promise<void> {
  try {
    const { idOrSlug } = req.params;
    let project = db.findProjectById(idOrSlug);
    if (!project) {
      project = db.findProjectBySlug(idOrSlug);
    }

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found', code: 'NOT_FOUND' });
      return;
    }

    // Include seller profile info
    const sellerUser = db.findUserById(project.sellerId);
    const sellerProfile = db.findSellerProfileByUserId(project.sellerId);

    res.json({
      success: true,
      data: {
        project,
        seller: {
          id: sellerUser?.id,
          name: sellerUser ? `${sellerUser.firstName} ${sellerUser.lastName}` : project.sellerName,
          company: sellerProfile?.businessName || project.sellerCompany,
          avatar: sellerUser?.profileImage,
          location: sellerProfile?.location || project.sellerLocation || 'Global / Remote',
          rating: 4.95,
          reviewCount: 18,
          projectsPosted: db.listProjects({ sellerId: project.sellerId, status: 'ALL' }).length,
          memberSince: 'March 2024',
        },
      },
    });
  } catch (err: any) {
    console.error('getProjectByIdOrSlug error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch project details', code: 'SERVER_ERROR' });
  }
}

export async function createProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'SELLER') {
      res.status(403).json({ success: false, message: 'Only registered sellers can create projects', code: 'FORBIDDEN' });
      return;
    }

    const {
      title,
      description,
      categoryId,
      subcategoryId,
      skills,
      budgetType,
      budgetMin,
      budgetMax,
      fixedAmount,
      experienceLevel,
      scope,
      deadline,
      duration,
      deliverables,
      attachments,
      status = 'PUBLISHED',
      isRemote = true,
    } = req.body;

    if (!title || !description || !categoryId) {
      res.status(400).json({
        success: false,
        message: 'Project title, description, and category are required.',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const sellerProfile = db.findSellerProfileByUserId(req.user.id);
    const cat = db.findCategoryByIdOrSlug(categoryId);
    const categoryName = cat ? cat.name : 'General';
    const subcat = cat?.subcategories?.find((s) => s.id === subcategoryId || s.slug === subcategoryId);

    const newProject = db.createProject({
      sellerId: req.user.id,
      sellerName: `${req.user.firstName} ${req.user.lastName}`,
      sellerCompany: sellerProfile?.businessName || `${req.user.firstName}'s Enterprise`,
      sellerAvatar: req.user.profileImage,
      sellerLocation: sellerProfile?.location || 'Remote',
      title: title.trim(),
      description: description.trim(),
      categoryId: cat ? cat.id : categoryId,
      categoryName,
      subcategoryId: subcat ? subcat.id : subcategoryId,
      subcategoryName: subcat ? subcat.name : undefined,
      skills: Array.isArray(skills) ? skills : [],
      budgetType: budgetType === 'hourly' ? 'hourly' : 'fixed',
      budgetMin: Number(budgetMin) || Number(fixedAmount) || 500,
      budgetMax: Number(budgetMax) || Number(fixedAmount) || 1000,
      fixedAmount: fixedAmount ? Number(fixedAmount) : undefined,
      experienceLevel: (experienceLevel || 'Intermediate') as ExperienceLevel,
      scope: (scope || 'Medium') as ProjectScope,
      deadline: deadline || '3–4 weeks',
      duration: duration || deadline || '4 weeks',
      deliverables: Array.isArray(deliverables) ? deliverables : [],
      attachments: Array.isArray(attachments) ? attachments : [],
      status: (status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED') as ProjectStatus,
      isRemote: isRemote !== false,
    });

    db.createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PROJECT_CREATED',
      details: { projectId: newProject.id, title: newProject.title, status: newProject.status },
    });

    res.status(201).json({
      success: true,
      message: newProject.status === 'PUBLISHED' ? 'Project published successfully!' : 'Project saved as draft.',
      data: { project: newProject },
    });
  } catch (err: any) {
    console.error('createProject error:', err);
    res.status(500).json({ success: false, message: 'Failed to create project', code: 'SERVER_ERROR' });
  }
}

export async function updateProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }

    const { id } = req.params;
    const project = db.findProjectById(id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found', code: 'NOT_FOUND' });
      return;
    }

    // Check ownership or admin
    if (project.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You cannot edit another seller’s project', code: 'FORBIDDEN' });
      return;
    }

    const updated = db.updateProject(id, req.body);

    db.createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PROJECT_UPDATED',
      details: { projectId: id, fields: Object.keys(req.body) },
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updated },
    });
  } catch (err: any) {
    console.error('updateProject error:', err);
    res.status(500).json({ success: false, message: 'Failed to update project', code: 'SERVER_ERROR' });
  }
}

export async function updateProjectStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: ProjectStatus[] = [
      'DRAFT',
      'PUBLISHED',
      'UNDER_REVIEW',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'ARCHIVED',
    ];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid project status', code: 'INVALID_STATUS' });
      return;
    }

    const project = db.findProjectById(id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found', code: 'NOT_FOUND' });
      return;
    }

    if (project.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized to change project status', code: 'FORBIDDEN' });
      return;
    }

    const updated = db.updateProject(id, { status });

    db.createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PROJECT_STATUS_CHANGED',
      details: { projectId: id, oldStatus: project.status, newStatus: status },
    });

    res.json({
      success: true,
      message: `Project status updated to ${status}`,
      data: { project: updated },
    });
  } catch (err: any) {
    console.error('updateProjectStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to update project status', code: 'SERVER_ERROR' });
  }
}

export async function deleteProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }

    const { id } = req.params;
    const project = db.findProjectById(id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found', code: 'NOT_FOUND' });
      return;
    }

    if (project.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized to delete this project', code: 'FORBIDDEN' });
      return;
    }

    db.deleteProject(id);

    db.createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PROJECT_DELETED',
      details: { projectId: id, title: project.title },
    });

    res.json({
      success: true,
      message: 'Project listing removed successfully',
    });
  } catch (err: any) {
    console.error('deleteProject error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete project', code: 'SERVER_ERROR' });
  }
}

export async function getMySellerProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'SELLER') {
      res.status(403).json({ success: false, message: 'Unauthorized', code: 'FORBIDDEN' });
      return;
    }

    const projects = db.listProjects({ sellerId: req.user.id, status: 'ALL' });
    const allProposals = db.listProposals({});

    // Attach inbound proposal stats for each project
    const projectsWithDetails = projects.map((p) => {
      const pProposals = allProposals.filter((pr) => pr.projectId === p.id && pr.status !== 'WITHDRAWN');
      const shortlistedCount = pProposals.filter((pr) => pr.status === 'SHORTLISTED').length;
      return {
        ...p,
        proposalCount: pProposals.length,
        shortlistedCount,
      };
    });

    res.json({
      success: true,
      data: {
        projects: projectsWithDetails,
        stats: {
          total: projects.length,
          published: projects.filter((p) => p.status === 'PUBLISHED').length,
          drafts: projects.filter((p) => p.status === 'DRAFT').length,
          inProgress: projects.filter((p) => p.status === 'IN_PROGRESS').length,
          completed: projects.filter((p) => p.status === 'COMPLETED').length,
        },
      },
    });
  } catch (err: any) {
    console.error('getMySellerProjects error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch seller projects', code: 'SERVER_ERROR' });
  }
}
