import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../models/db';

export async function createOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const { name, type, description, website, industry, country, timezone, currency, logoUrl } = req.body;
    if (!name || !type) {
      res.status(400).json({ success: false, message: 'Name and organization type are required' });
      return;
    }

    const user = db.findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const userCountry = (user as any).country || 'Global';

    const { organization, membership } = db.createOrganization(
      {
        name,
        slug: '',
        type,
        description: description || '',
        website: website || '',
        industry: industry || 'Technology & Creative',
        country: country || userCountry,
        timezone: timezone || 'UTC',
        currency: currency || 'USD',
        ownerId: user.id,
        verified: false,
        status: 'ACTIVE',
        logoUrl: logoUrl || '',
      },
      user
    );

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: { organization, membership },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create organization' });
  }
}

export async function getMyOrganizations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const orgs = db.listUserOrganizations(req.user.id);
    res.json({ success: true, data: orgs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch organizations' });
  }
}

export async function getOrganizationById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    let org = db.getOrganizationById(id);
    if (!org) {
      org = db.getOrganizationBySlug(id);
    }
    if (!org) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }
    const members = db.getOrganizationMembers(org.id);
    res.json({ success: true, data: { ...org, members } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch organization' });
  }
}

export async function updateOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const org = db.getOrganizationById(id);
    if (!org) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    // Check permission
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const members = db.getOrganizationMembers(id);
    const userMember = members.find((m) => m.userId === req.user?.id);
    if (!userMember || (userMember.role !== 'OWNER' && userMember.role !== 'ADMIN')) {
      res.status(403).json({ success: false, message: 'Only organization owners or admins can edit details' });
      return;
    }

    const updated = db.updateOrganization(id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update organization' });
  }
}

export async function getOrganizationMembers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const members = db.getOrganizationMembers(id);
    const invitations = db.listOrganizationInvitations(id);
    res.json({ success: true, data: { members, invitations } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch members' });
  }
}

export async function inviteOrganizationMember(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const { email, role } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Member email is required' });
      return;
    }

    const org = db.getOrganizationById(id);
    if (!org) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    // Check if target user already exists
    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      const existingMember = db.getOrganizationMembers(id).find((m) => m.userId === existingUser.id);
      if (existingMember) {
        res.status(400).json({ success: false, message: 'User is already a member of this organization' });
        return;
      }
      // Add directly
      const member = db.addOrganizationMember(id, existingUser, role || 'MEMBER');
      res.status(201).json({
        success: true,
        message: `${existingUser.firstName} added to organization successfully`,
        data: member,
      });
      return;
    }

    const invitation = db.createOrganizationInvitation({
      organizationId: id,
      organizationName: org.name,
      inviterId: req.user.id,
      email,
      role: role || 'MEMBER',
    });

    res.status(201).json({
      success: true,
      message: `Invitation generated for ${email}`,
      data: invitation,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to invite member' });
  }
}

export async function removeOrganizationMember(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id, memberId } = req.params;
    const org = db.getOrganizationById(id);
    if (!org) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    if (org.ownerId === memberId) {
      res.status(400).json({ success: false, message: 'Cannot remove the organization owner' });
      return;
    }

    const removed = db.removeOrganizationMember(id, memberId);
    res.json({ success: true, message: 'Member removed from organization', data: { removed } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to remove member' });
  }
}

export async function updateOrganizationMemberRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id, memberId } = req.params;
    const { role } = req.body;
    if (!role) {
      res.status(400).json({ success: false, message: 'New role is required' });
      return;
    }

    const updated = db.updateOrganizationMemberRole(id, memberId, role);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Member not found' });
      return;
    }

    res.json({ success: true, message: 'Role updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update member role' });
  }
}

export async function acceptInvitation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, message: 'Invitation token is required' });
      return;
    }

    const user = db.findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const member = db.acceptOrganizationInvitation(token, user);
    if (!member) {
      res.status(400).json({ success: false, message: 'Invalid or expired invitation token' });
      return;
    }

    res.json({ success: true, message: 'Successfully joined organization', data: member });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to accept invitation' });
  }
}
