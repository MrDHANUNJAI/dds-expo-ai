import { Request, Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function getCategories(_req: Request, res: Response): Promise<void> {
  try {
    const categories = db.listCategories();
    // Update live counts from projects database
    const allProjects = db.listProjects({ status: 'PUBLISHED' });

    const categoriesWithLiveCounts = categories.map((cat) => {
      const count = allProjects.filter((p) => p.categoryId === cat.id).length;
      return {
        ...cat,
        projectCount: count > 0 ? count : cat.projectCount,
      };
    });

    res.json({
      success: true,
      data: { categories: categoriesWithLiveCounts },
    });
  } catch (err: any) {
    console.error('getCategories error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories', code: 'SERVER_ERROR' });
  }
}

export async function getCategoryBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const category = db.findCategoryByIdOrSlug(slug);

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found', code: 'NOT_FOUND' });
      return;
    }

    const projects = db.listProjects({ categoryId: category.id, status: 'PUBLISHED' });

    res.json({
      success: true,
      data: { category, projects },
    });
  } catch (err: any) {
    console.error('getCategoryBySlug error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch category details', code: 'SERVER_ERROR' });
  }
}

export async function getSkills(_req: Request, res: Response): Promise<void> {
  try {
    const skills = db.listSkills();
    res.json({
      success: true,
      data: { skills },
    });
  } catch (err: any) {
    console.error('getSkills error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch skills', code: 'SERVER_ERROR' });
  }
}

export async function createCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required', code: 'FORBIDDEN' });
      return;
    }

    const { name, slug, description, icon, subcategories } = req.body;
    if (!name || !description) {
      res.status(400).json({ success: false, message: 'Name and description are required', code: 'VALIDATION_ERROR' });
      return;
    }

    const newCat = db.createCategory({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      icon: icon || 'Briefcase',
      subcategories: Array.isArray(subcategories) ? subcategories : [],
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category: newCat },
    });
  } catch (err: any) {
    console.error('createCategory error:', err);
    res.status(500).json({ success: false, message: 'Failed to create category', code: 'SERVER_ERROR' });
  }
}

export async function updateCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Admin access required', code: 'FORBIDDEN' });
      return;
    }

    const { id } = req.params;
    const updated = db.updateCategory(id, req.body);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category: updated },
    });
  } catch (err: any) {
    console.error('updateCategory error:', err);
    res.status(500).json({ success: false, message: 'Failed to update category', code: 'SERVER_ERROR' });
  }
}
