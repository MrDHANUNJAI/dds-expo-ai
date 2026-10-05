import { Router } from 'express';
import {
  createProjectWithAI,
  extractSkills,
  analyzeRequirements,
  improveProposal,
  checkProposalQuality,
  improveProfile,
  explainMatch,
  parseSearchQuery,
  supportAssistant,
  summarizeDispute,
  getAIUsageMetrics,
} from '../controllers/aiController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public search query natural language parse
router.post('/search/parse', parseSearchQuery);

// Authenticated AI assistance
router.use(authenticate);

router.post('/project/create', createProjectWithAI);
router.post('/skills/extract', extractSkills);
router.post('/requirements/analyze', analyzeRequirements);
router.post('/proposals/improve', improveProposal);
router.post('/proposals/check', checkProposalQuality);
router.post('/profile/improve', improveProfile);
router.post('/match/explain', explainMatch);
router.post('/support/chat', supportAssistant);

// Admin-only AI intelligence
router.get('/disputes/:id/summary', summarizeDispute);
router.get('/usage', getAIUsageMetrics);

export default router;
