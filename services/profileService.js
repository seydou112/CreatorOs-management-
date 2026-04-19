const profiles = new Map();

export function saveProfile(userId, data) {
  const existing = profiles.get(userId) || {};
  const profile = {
    ...existing,
    niche: data.niche ?? existing.niche ?? null,
    tone: data.tone ?? existing.tone ?? null,
    audience: data.audience ?? existing.audience ?? null,
    userId,
    createdAt: existing.createdAt || new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };
  profiles.set(userId, profile);
  return profile;
}

export function getProfile(userId) {
  return profiles.get(userId) || null;
}
