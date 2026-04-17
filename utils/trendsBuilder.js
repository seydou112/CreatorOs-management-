export const SYSTEM_PROMPT_TRENDS = `Tu es un expert en marketing digital et en veille concurrentielle pour les réseaux sociaux.
Tu as accès à internet via Google Search. Utilise-le pour obtenir des informations récentes et précises.

Tes analyses sont :
- Basées sur des données réelles et récentes trouvées sur internet
- Orientées action : chaque insight doit aider à créer du contenu viral
- Honnêtes : si tu ne trouves pas d'info fiable, dis-le clairement

Réponds UNIQUEMENT en JSON valide, sans texte autour, sans markdown.`;

export function buildTrendsPrompt({ sujet, plateforme }) {
  const plateformeLabel = { tiktok: 'TikTok', instagram: 'Instagram', facebook: 'Facebook' }[plateforme] || plateforme;
  return `Recherche sur internet les TENDANCES ACTUELLES sur ${plateformeLabel} pour le sujet : "${sujet}"

Effectue une recherche Google sur ce qui est viral en ce moment sur ${plateformeLabel} dans cette niche.

Réponds avec ce JSON exact :
{
  "sujet": "${sujet}",
  "plateforme": "${plateformeLabel}",
  "tendances_actuelles": [
    { "titre": "...", "description": "...", "pourquoi_viral": "..." }
  ],
  "hooks_populaires": ["...", "...", "..."],
  "mots_cles_tendance": ["...", "...", "..."],
  "niches_emergentes": [
    { "niche": "...", "potentiel": "fort/moyen/faible", "explication": "..." }
  ],
  "angles_contenu": [
    { "angle": "...", "exemple_hook": "...", "format_ideal": "..." }
  ],
  "sources": ["url1", "url2"]
}`;
}

export function buildCompetitorPrompt({ concurrent, plateforme }) {
  const plateformeLabel = { tiktok: 'TikTok', instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube' }[plateforme] || plateforme;
  return `Recherche sur internet et analyse ce concurrent sur ${plateformeLabel} : "${concurrent}"

Cherche sur Google des informations sur ce compte/cette marque/cette URL.
Analyse leur stratégie de contenu, leur engagement, leurs formats, leurs thèmes récurrents.

Réponds avec ce JSON exact :
{
  "concurrent": "${concurrent}",
  "plateforme": "${plateformeLabel}",
  "profil": {
    "description": "...",
    "niche": "...",
    "style": "..."
  },
  "points_forts": ["...", "...", "..."],
  "points_faibles": ["...", "...", "..."],
  "formats_performants": ["...", "...", "..."],
  "themes_recurrents": ["...", "...", "..."],
  "opportunites": [
    { "opportunite": "...", "comment_exploiter": "..." }
  ],
  "hooks_typiques": ["...", "...", "..."],
  "frequence_publication": "...",
  "sources": ["url1", "url2"],
  "fiabilite": "haute/moyenne/faible",
  "note": "explication si données limitées"
}`;
}
