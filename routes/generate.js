import { Router } from 'express';
import { validateGenerate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { buildUserPrompt } from '../utils/promptBuilder.js';
import { generateContent } from '../services/claude.js';

const router = Router();

router.post('/', requireAuth, validateGenerate, rateLimit, async (req, res, next) => {
  try {
    const { theme, cible, objectif, plateforme, mode, ton, duree } = req.body;
    const userPrompt = buildUserPrompt({ theme, cible, objectif, plateforme, mode, ton, duree });
    const result = await generateContent(userPrompt);
    await req.commitUsage();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
