const ENUMS = {
  cible: ['debutant', 'entrepreneur', 'influenceur'],
  objectif: ['engager', 'vendre', 'inspirer'],
  plateforme: ['tiktok', 'facebook', 'instagram'],
  mode: ['normal', 'viral_extreme', 'storytelling']
};

export function validateGenerate(req, res, next) {
  const { theme, cible, objectif, plateforme, mode } = req.body;

  if (!theme || typeof theme !== 'string' || theme.trim().length === 0) {
    return res.status(400).json({ error: 'Le champ "thème" est obligatoire.' });
  }
  if (theme.trim().length > 200) {
    return res.status(400).json({ error: 'Le thème ne doit pas dépasser 200 caractères.' });
  }

  for (const [field, values] of Object.entries(ENUMS)) {
    const val = req.body[field];
    if (!val || !values.includes(val)) {
      return res.status(400).json({ error: `Le champ "${field}" est invalide. Valeurs acceptées : ${values.join(', ')}.` });
    }
  }

  req.body.theme = theme.trim();
  next();
}

export function validateAnalyze(req, res, next) {
  const { plateforme, description, typeContenu, objectif } = req.body;

  if (!plateforme || !['tiktok', 'facebook', 'instagram'].includes(plateforme)) {
    return res.status(400).json({ error: 'Plateforme invalide.' });
  }
  if (!description || description.trim().length < 10) {
    return res.status(400).json({ error: 'La description du compte est trop courte (min 10 caractères).' });
  }
  if (!typeContenu || typeContenu.trim().length === 0) {
    return res.status(400).json({ error: 'Le type de contenu est obligatoire.' });
  }
  if (!objectif || !['croissance', 'ventes', 'notoriete'].includes(objectif)) {
    return res.status(400).json({ error: 'Objectif invalide.' });
  }

  next();
}
