import { Router } from 'express';
import { validateGenerate } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { buildUserPrompt } from '../utils/promptBuilder.js';
import { generateContent } from '../services/claude.js';
import { getProfile } from '../services/profileService.js';

const router = Router();

router.post('/', validateGenerate, rateLimit, async (req, res, next) => {
  try {
    const { theme, cible, objectif, plateforme, mode, ton, duree, userId } = req.body;
    const profile = userId ? getProfile(userId) : null;
    const userPrompt = buildUserPrompt({ theme, cible, objectif, plateforme, mode, ton, duree, profile });
    const result = await generateContent(userPrompt);
    await req.commitUsage();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
