export const SYSTEM_PROMPT_GENERATION = `Tu es un expert mondial en création de contenu viral pour les réseaux sociaux francophones.
Tu crées du contenu hautement optimisé pour capter l'attention, générer de l'engagement et provoquer des réactions.

Tes contenus respectent ces principes fondamentaux :
- Hook ultra-puissant qui arrête le scroll en moins de 2 secondes
- Tension émotionnelle maintenue tout au long du contenu
- Langage simple, direct, percutant — jamais académique
- Storytelling court et efficace
- Call-to-action clair qui pousse à agir immédiatement

Règles de format absolu :
- Tu réponds UNIQUEMENT avec du JSON valide, sans aucun texte autour
- Pas de blocs markdown, pas d'explication, aucun texte hors du JSON
- Le JSON doit avoir exactement ces 3 clés : "hook", "script", "call_to_action"
- "hook" : une phrase d'accroche ultra-puissante (max 2 lignes)
- "script" : le corps du contenu en 3 à 5 paragraphes courts, séparés par une ligne vide
- "call_to_action" : un appel à l'action clair et motivant (1-2 phrases)

Exemple de format de réponse :
{"hook":"...", "script":"...", "call_to_action":"..."}`;

const audienceMap = {
  debutant: "des débutants qui découvrent le sujet et cherchent des conseils simples et accessibles",
  entrepreneur: "des entrepreneurs et chefs d'entreprise qui veulent des résultats concrets rapidement",
  influenceur: "des créateurs de contenu et influenceurs qui cherchent à développer leur audience"
};

const objectifMap = {
  engager: "maximiser l'engagement (commentaires, partages, sauvegardes) — le contenu doit pousser à réagir",
  vendre: "générer des ventes et des conversions — chaque mot doit pousser vers l'action d'achat",
  inspirer: "inspirer et motiver l'audience — créer un sentiment de possibilité et d'espoir"
};

const plateformeMap = {
  tiktok: "TikTok (contenu court et percutant, rythme rapide, tendances, sous-titres impactants, première phrase = tout)",
  facebook: "Facebook (audience 25-45 ans, contenu partageable, communautaire, un peu plus long que TikTok)",
  instagram: "Instagram (esthétique et inspiration, Reels et carrousels, hashtags, texte visuel fort)"
};

export function buildUserPrompt({ theme, cible, objectif, plateforme, mode }) {
  let prompt = `Crée du contenu viral sur le sujet : "${theme}"

Public cible : ${audienceMap[cible]}
Objectif : ${objectifMap[objectif]}
Plateforme : ${plateformeMap[plateforme]}
Langue : Français`;

  if (mode === 'viral_extreme') {
    prompt += `

MODE VIRAL EXTRÊME ACTIVÉ : Rends ce contenu CHOQUANT et PROVOCATEUR. Utilise des patterns d'interruption, des angles controversés, des affirmations audacieuses et des déclencheurs psychologiques (curiosité, FOMO, preuve sociale). Le hook doit arrêter le scroll INSTANTANÉMENT. Utilise des mots forts et percutants. Sois à la limite — mais jamais offensant.`;
  }

  if (mode === 'storytelling') {
    prompt += `

MODE STORYTELLING ACTIVÉ : Construis une narration immersive et émotionnelle. Commence par une situation reconnaissable, crée une tension ou un conflit, amène une transformation ou une révélation, et termine avec une résonance émotionnelle forte. L'audience doit ressentir quelque chose profondément. Utilise des détails sensoriels et une voix authentique.`;
  }

  return prompt;
}
