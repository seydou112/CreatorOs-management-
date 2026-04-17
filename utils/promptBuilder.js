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
- Le JSON doit avoir exactement ces clés :

{
  "variations": [
    {"hook": "...", "script": "...", "call_to_action": "..."},
    {"hook": "...", "script": "...", "call_to_action": "..."},
    {"hook": "...", "script": "...", "call_to_action": "..."}
  ],
  "score_viral": 85,
  "score_explication": "Explication honnête du score en 1 phrase.",
  "hashtags": {
    "tendance": ["#tag1", "#tag2", "#tag3", "#tag4"],
    "niche": ["#tag5", "#tag6", "#tag7", "#tag8"],
    "volume": ["#tag9", "#tag10", "#tag11", "#tag12"]
  }
}

Instructions pour les variations :
- Variation 1 (Version A) : angle le plus direct et percutant
- Variation 2 (Version B) : angle storytelling / émotionnel
- Variation 3 (Version C) : angle éducatif ou contre-intuitif
- Chaque variation = un angle différent, pas une simple reformulation
- "hook" : phrase d'accroche ultra-puissante (max 2 lignes)
- "script" : corps du contenu en 3-5 paragraphes courts séparés par une ligne vide
- "call_to_action" : appel à l'action clair (1-2 phrases)
- "score_viral" : entier de 0 à 100 estimant honnêtement le potentiel viral
- "hashtags" : 4 hashtags par groupe, sans espaces, avec #`;

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

const tonMap = {
  audacieux: "Ton audacieux et direct — affirmatif, percutant, sans détour",
  inspirant: "Ton inspirant et positif — élève l'audience, donne envie de se dépasser",
  drole: "Ton humoristique et léger — humour, autodérision, rend le contenu addictif",
  professionnel: "Ton professionnel et crédible — expertise, chiffres, autorité naturelle",
  educatif: "Ton éducatif et bienveillant — explique simplement, donne envie d'apprendre"
};

const dureeMap = {
  '15s': "Durée ultra-courte (15 secondes max) — script très court, chaque mot compte, va droit au but",
  '30s': "Durée courte (30 secondes) — contenu concis et percutant, 3 actes express",
  '60s': "Durée standard (1 minute) — développe l'argument, plus de contexte et de détails",
  'long': "Long format (2-3 minutes) — narration riche, storytelling complet, développement approfondi"
};

export function buildUserPrompt({ theme, cible, objectif, plateforme, mode, ton, duree }) {
  let prompt = `Crée du contenu viral sur le sujet : "${theme}"

Public cible : ${audienceMap[cible]}
Objectif : ${objectifMap[objectif]}
Plateforme : ${plateformeMap[plateforme]}
Langue : Français`;

  if (ton && tonMap[ton]) prompt += `\nTon souhaité : ${tonMap[ton]}`;
  if (duree && dureeMap[duree]) prompt += `\nDurée cible : ${dureeMap[duree]}`;

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
