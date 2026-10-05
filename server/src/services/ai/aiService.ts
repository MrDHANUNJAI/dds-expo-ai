import { aiProvider, sanitizePromptInput } from './aiProvider';
import { db } from '../../models/db';

export const aiService = {
  // --- 1. AI PROJECT CREATOR ---
  async createProjectWithAI(prompt: string, sellerId?: string) {
    const sanitized = sanitizePromptInput(prompt);
    const schemaInstructions = `{
      "title": "string",
      "description": "string (with markdown sections: ### Overview, ### Key Requirements, ### Deliverables, ### Scope & Timeline)",
      "categoryId": "string (one of: cat-1, cat-2, cat-3, cat-4, cat-5)",
      "categoryName": "string",
      "subcategoryName": "string",
      "skills": ["string"],
      "budgetType": "fixed" | "hourly",
      "budgetMin": number,
      "budgetMax": number,
      "fixedAmount": number,
      "duration": "string",
      "scope": "Small" | "Medium" | "Large",
      "experienceLevel": "Entry" | "Intermediate" | "Expert",
      "budgetGuidance": "string explaining historical pricing context",
      "timelineMilestones": [
        { "title": "string", "durationDays": number, "estimatedCost": number }
      ]
    }`;

    const promptText = `A client wants to create a project on the WorkNova freelance marketplace with this prompt:\n${sanitized}\n\nGenerate a professional, high-standard project draft with clear requirements and milestone breakdown.`;

    const res = await aiProvider.generateStructuredOutput<any>(
      promptText,
      schemaInstructions,
      'You are WorkNova AI Project Architect. Always produce structured, enterprise-ready project drafts. Adhere strictly to the requested JSON schema.'
    );

    db.logAIUsage({
      userId: sellerId,
      feature: 'CREATE_PROJECT',
      provider: res.provider,
      model: res.model,
      inputTokens: res.inputTokens,
      outputTokens: res.outputTokens,
      estimatedCost: (res.inputTokens * 0.00000015 + res.outputTokens * 0.0000006),
      durationMs: res.durationMs,
      success: true,
    });

    return res.result;
  },

  // --- 2. AI SKILL EXTRACTION ---
  async extractSkills(content: string, userId?: string) {
    const sanitized = sanitizePromptInput(content);
    const schema = `{"skills": ["string"]}`;
    const prompt = `Identify the top 4-8 technical or domain skills required for this job description:\n${sanitized}`;

    const res = await aiProvider.generateStructuredOutput<{ skills: string[] }>(
      prompt,
      schema,
      'Extract only established industry skills and technologies.'
    );

    db.logAIUsage({
      userId,
      feature: 'EXTRACT_SKILLS',
      provider: res.provider,
      model: res.model,
      inputTokens: res.inputTokens,
      outputTokens: res.outputTokens,
      estimatedCost: 0.0001,
      durationMs: res.durationMs,
      success: true,
    });

    return res.result.skills || ['React', 'TypeScript', 'Node.js'];
  },

  // --- 3. REQUIREMENT ANALYSIS & QUALITY SCORE ---
  async analyzeRequirements(description: string, userId?: string) {
    const sanitized = sanitizePromptInput(description);
    const schema = `{
      "score": number (0-100),
      "clarity": "POOR" | "FAIR" | "GOOD" | "EXCELLENT",
      "suggestions": ["string"],
      "missingElements": ["string"]
    }`;

    const prompt = `Analyze this freelance project requirement description for completeness, clarity, deliverables, and timeline clarity:\n${sanitized}`;

    const res = await aiProvider.generateStructuredOutput<{
      score: number;
      clarity: string;
      suggestions: string[];
      missingElements: string[];
    }>(prompt, schema);

    db.logAIUsage({
      userId,
      feature: 'ANALYZE_REQUIREMENTS',
      provider: res.provider,
      model: res.model,
      inputTokens: res.inputTokens,
      outputTokens: res.outputTokens,
      estimatedCost: 0.0002,
      durationMs: res.durationMs,
      success: true,
    });

    return res.result;
  },

  // --- 4. PROPOSAL WRITER & IMPROVER ---
  async improveProposal(
    data: {
      projectTitle: string;
      projectDescription: string;
      currentCoverLetter: string;
      freelancerSkills: string[];
    },
    freelancerId?: string
  ) {
    const prompt = `A freelancer wants to refine their proposal for this project:
Project Title: ${data.projectTitle}
Project Description: ${sanitizePromptInput(data.projectDescription)}
Freelancer Profile Skills: ${data.freelancerSkills.join(', ')}
Draft Proposal:
${sanitizePromptInput(data.currentCoverLetter)}

Generate an improved, persuasive, professional proposal that highlights relevant experience, demonstrates understanding of the project goals, outlines a concrete milestone delivery approach, and proposes relevant technical clarification questions. DO NOT invent false past clients or unearned credentials.`;

    const res = await aiProvider.generateText(
      prompt,
      'You are WorkNova Proposal Coach. Produce respectful, crisp, tailored client proposals.'
    );

    db.logAIUsage({
      userId: freelancerId,
      feature: 'IMPROVE_PROPOSAL',
      provider: res.provider,
      model: res.model,
      inputTokens: res.inputTokens,
      outputTokens: res.outputTokens,
      estimatedCost: 0.0004,
      durationMs: res.durationMs,
      success: true,
    });

    return { improvedProposal: res.result };
  },

  // --- 5. PROPOSAL QUALITY CHECK ---
  async checkProposalQuality(
    data: {
      projectDescription: string;
      coverLetter: string;
      bidAmount: number;
    },
    freelancerId?: string
  ) {
    const schema = `{
      "score": number (0-100),
      "tone": "string",
      "clarity": "string",
      "suggestions": ["string"],
      "recommendedQuestions": ["string"]
    }`;

    const prompt = `Evaluate the quality of this proposal against the project requirements:
Project: ${sanitizePromptInput(data.projectDescription)}
Proposal: ${sanitizePromptInput(data.coverLetter)}
Bid: ₹${data.bidAmount}`;

    const res = await aiProvider.generateStructuredOutput<any>(prompt, schema);

    db.logAIUsage({
      userId: freelancerId,
      feature: 'CHECK_PROPOSAL_QUALITY',
      provider: res.provider,
      model: res.model,
      inputTokens: res.inputTokens,
      outputTokens: res.outputTokens,
      estimatedCost: 0.0002,
      durationMs: res.durationMs,
      success: true,
    });

    return res.result;
  },

  // --- 6. PROFILE IMPROVER ---
  async improveProfile(
    data: {
      role: string;
      currentTitle: string;
      bio: string;
      skills: string[];
    },
    userId?: string
  ) {
    const schema = `{
      "suggestedTitle": "string",
      "polishedBio": "string",
      "topHighlights": ["string"]
    }`;

    const prompt = `Refine this freelancer profile for maximum client trust:
Title: ${data.currentTitle}
Current Bio: ${sanitizePromptInput(data.bio)}
Skills: ${data.skills.join(', ')}`;

    const res = await aiProvider.generateStructuredOutput<any>(prompt, schema);

    db.logAIUsage({
      userId,
      feature: 'IMPROVE_PROFILE',
      provider: res.provider,
      model: res.model,
      inputTokens: res.inputTokens,
      outputTokens: res.outputTokens,
      estimatedCost: 0.0002,
      durationMs: res.durationMs,
      success: true,
    });

    return res.result;
  },

  // --- 7. FREELANCER MATCH EXPLANATION ---
  async explainFreelancerMatch(project: any, freelancer: any) {
    const prompt = `Explain in 3-4 bullet points why this freelancer is a great match for the project based ONLY on their verified skills, rating, and experience:
Project: ${project.title} (${project.skills.join(', ')})
Freelancer: ${freelancer.name} - ${freelancer.title} (Rating: ${freelancer.rating}/5, Completed: ${freelancer.completedProjects}, Skills: ${freelancer.skills.join(', ')})`;

    const schema = `{"reasons": ["string"]}`;
    const res = await aiProvider.generateStructuredOutput<{ reasons: string[] }>(prompt, schema);

    return res.result.reasons || [
      'Direct match with requested tech stack',
      'Demonstrated 5.0 client feedback history',
      'Available within project budget and timeline',
    ];
  },

  // --- 8. NATURAL LANGUAGE JOB SEARCH ---
  async parseNaturalLanguageSearch(query: string) {
    const schema = `{
      "keywords": "string",
      "skills": ["string"],
      "minBudget": number,
      "maxBudget": number,
      "isRemote": boolean,
      "category": "string",
      "explanation": "string"
    }`;

    const prompt = `Convert this natural-language job search query into structured marketplace filters:\n${sanitizePromptInput(query)}`;
    const res = await aiProvider.generateStructuredOutput<any>(prompt, schema);

    return res.result;
  },

  // --- 9. AI SUPPORT ASSISTANT WITH FAQ KNOWLEDGE BASE ---
  async supportAssistant(query: string, userId?: string) {
    const faqs = db.listFAQs();
    const faqContext = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');

    const prompt = `A user has asked a question to the WorkNova Support Desk:
"${sanitizePromptInput(query)}"

Here is the official WorkNova approved knowledge base:
${faqContext}

Instructions:
1. Answer accurately based ONLY on the approved knowledge base.
2. If the user asks about releasing escrow payments, disputes, account bans, or identity verification approval, politely inform them that financial and safety operations require human agent assistance and set escalateToHuman to true.
3. Output JSON with fields: { "answer": "string", "escalateToHuman": boolean, "suggestedCategory": "BILLING" | "ACCOUNT" | "TECHNICAL" | "POLICY" }`;

    const schema = `{"answer": "string", "escalateToHuman": boolean, "suggestedCategory": "string"}`;
    const res = await aiProvider.generateStructuredOutput<any>(prompt, schema);

    db.logAIUsage({
      userId,
      feature: 'SUPPORT_ASSISTANT',
      provider: res.provider,
      model: res.model,
      inputTokens: res.inputTokens,
      outputTokens: res.outputTokens,
      estimatedCost: 0.0003,
      durationMs: res.durationMs,
      success: true,
    });

    return res.result;
  },

  // --- 10. AI DISPUTE & MODERATION SUMMARY ---
  async summarizeDispute(disputeId: string, adminId?: string) {
    const dispute = db.findDisputeById(disputeId);
    if (!dispute) throw new Error('Dispute not found');

    const contract = db.findContractById(dispute.contractId);
    const project = db.findProjectById(dispute.projectId);

    const prompt = `Summarize this marketplace dispute for an independent human administrator arbitrator:
Dispute ID: ${dispute.id}
Project: ${project?.title || 'Unknown'}
Contract Total: ${contract?.totalBudget || 0} ${dispute.currency}
Disputed Amount: ${dispute.disputedAmount} ${dispute.currency}
Reason: ${dispute.reason}
Claim: ${sanitizePromptInput(dispute.description)}
Evidence Items: ${dispute.evidence.length} files attached

Instructions:
Produce an objective summary with:
- Project Context
- Claims & Disputed Amounts
- Neutral factual assessment
- Potential resolution options (e.g. Full Release, Partial Refund, Split)
Note: Clearly label that human admin review is mandatory.`;

    const schema = `{
      "summary": "string",
      "facts": ["string"],
      "recommendedOptions": ["string"],
      "requiresHumanReview": true
    }`;

    const res = await aiProvider.generateStructuredOutput<any>(prompt, schema);

    db.logAIUsage({
      userId: adminId,
      feature: 'DISPUTE_SUMMARY',
      provider: res.provider,
      model: res.model,
      inputTokens: res.inputTokens,
      outputTokens: res.outputTokens,
      estimatedCost: 0.0005,
      durationMs: res.durationMs,
      success: true,
    });

    return res.result;
  },
};
