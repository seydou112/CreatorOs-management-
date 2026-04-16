import { Router } from 'express';
import { getAllPosts, getPostBySlug } from '../data/blogPosts.js';

const router = Router();

router.get('/', (req, res) => {
  const { categorie } = req.query;
  let posts = getAllPosts();
  if (categorie && categorie !== 'tous') {
    posts = posts.filter(p => p.categorie === categorie);
  }
  res.json(posts);
});

router.get('/:slug', (req, res) => {
  const post = getPostBySlug(req.params.slug);
  if (!post) return res.status(404).json({ error: 'Article introuvable.' });
  res.json(post);
});

export default router;
