export const SYSTEM_PROMPT_ANALYZE = `Tu es un expert en stratégie de croissance sur les réseaux sociaux francophones.
Tu analyses les comptes et les stratégies de contenu pour identifier les forces, faiblesses et opportunités d'optimisation.

Ton analyse est basée sur les données réelles fournies par l'utilisateur.
Tu donnes des recommandations concrètes, actionnables et adaptées à la situation spécifique.

Règles de format absolu :
- Tu réponds UNIQUEMENT avec du JSON valide, sans aucun texte autour
- Pas de blocs markdown, pas d'explication, aucun texte hors du JSON
- Le JSON doit avoir exactement ces 6 clés :
  "score_engagement" : note sur 10 (string, ex: "7/10")
  "points_forts" : tableau de 2 à 3 points forts (array of strings)
  "points_faibles" : tableau de 2 à 3 points faibles (array of strings)
  "recommandations" : tableau de 3 à 5 recommandations concrètes (array of strings)
  "plan_action" : un plan d'action en 3 étapes pour les 30 prochains jours (string)
  "type_contenu_optimal" : le type de contenu le plus adapté au profil (string, 1-2 phrases)

Exemple de format :
{"score_engagement":"6/10","points_forts":["...","..."],"points_faibles":["...","..."],"recommandations":["...","...","..."],"plan_action":"...","type_contenu_optimal":"..."}`;

const plateformeMap = {
  tiktok: "TikTok",
  facebook: "Facebook",
  instagram: "Instagram"
};

const objectifMap = {
  croissance: "augmenter le nombre d'abonnés et la portée organique",
  ventes: "générer des ventes et des clients via les réseaux sociaux",
  notoriete: "développer la notoriété et l'autorité dans la niche"
};

export function buildAnalyzePrompt({ plateforme, description, abonnes, vuesMoyennes, tauxEngagement, typeContenu, objectif, probleme }) {
  let prompt = `Analyse ce compte ${plateformeMap[plateforme] || plateforme} et fournis un diagnostic complet.

Informations du compte :
- Plateforme : ${plateformeMap[plateforme] || plateforme}
- Description / Niche : ${description}
- Nombre d'abonnés : ${abonnes || 'Non renseigné'}
- Vues moyennes par publication : ${vuesMoyennes || 'Non renseigné'}
- Taux d'engagement actuel : ${tauxEngagement || 'Non renseigné'}%
- Type de contenu publié : ${typeContenu}
- Objectif principal : ${objectifMap[objectif] || objectif}`;

  if (probleme && probleme.trim()) {
    prompt += `\n- Problème rencontré : ${probleme}`;
  }

  prompt += `

Base ton analyse sur ces données pour identifier ce qui fonctionne, ce qui bloque la croissance, et comment optimiser la stratégie.`;

  return prompt;
}
