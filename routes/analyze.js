import { Router } from 'express';
import { validateAnalyze } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { buildAnalyzePrompt } from '../utils/analyzeBuilder.js';
import { analyzeAccount } from '../services/claude.js';

const router = Router();

router.post('/', validateAnalyze, rateLimit, async (req, res, next) => {
  try {
    const { plateforme, description, abonnes, vuesMoyennes, tauxEngagement, typeContenu, objectif, probleme } = req.body;
    const userPrompt = buildAnalyzePrompt({ plateforme, description, abonnes, vuesMoyennes, tauxEngagement, typeContenu, objectif, probleme });
    const result = await analyzeAccount(userPrompt);
    req.commitUsage();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
