import { saveProfile, getProfile } from '../services/profileService.js';

export function createOrUpdateProfile(req, res) {
  const { userId, niche, tone, audience } = req.body;

  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    return res.status(400).json({ error: 'userId est requis.' });
  }

  if (niche && typeof niche !== 'string') return res.status(400).json({ error: 'niche doit être une chaîne.' });
  if (tone && typeof tone !== 'string') return res.status(400).json({ error: 'tone doit être une chaîne.' });
  if (audience && typeof audience !== 'string') return res.status(400).json({ error: 'audience doit être une chaîne.' });

  const profile = saveProfile(userId.trim(), { niche, tone, audience });
  res.json({ success: true, profile });
}

export function getUserProfile(req, res) {
  const { userId } = req.params;
  const profile = getProfile(userId);
  if (!profile) return res.status(404).json({ error: 'Profil introuvable.' });
  res.json(profile);
}
