// ===== NAV =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
window.addEventListener('scroll', () => navbar?.classList.toggle('scrolled', window.scrollY > 20));
navToggle?.addEventListener('click', () => navLinks?.classList.toggle('open'));

const catLabels = {
  astuces: 'badge-astuces',
  guides: 'badge-guides',
  nouveautes: 'badge-nouveautes',
  tendances: 'badge-tendances'
};

// ===== PAGE LISTE BLOG =====
if (document.getElementById('blogGrid')) {
  const grid = document.getElementById('blogGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  let allPosts = [];

  // Pré-remplir depuis le cache localStorage si hors ligne
  function getCachedPosts() {
    return JSON.parse(localStorage.getItem('viral_blog_list') || '[]');
  }

  async function loadPosts(categorie = 'tous') {
    const url = categorie === 'tous' ? '/api/blog' : `/api/blog?categorie=${categorie}`;

    if (!navigator.onLine) {
      const cached = getCachedPosts().filter(p => categorie === 'tous' || p.categorie === categorie);
      renderPosts(cached);
      return;
    }

    try {
      const res = await fetch(url);
      const posts = await res.json();
      allPosts = posts;
      localStorage.setItem('viral_blog_list', JSON.stringify(posts));
      renderPosts(categorie === 'tous' ? posts : posts.filter(p => p.categorie === categorie));
    } catch {
      const cached = getCachedPosts();
      renderPosts(cached);
    }
  }

  function renderPosts(posts) {
    grid.innerHTML = '';
    if (!posts.length) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-dim);padding:3rem">Aucun article dans cette catégorie.</p>';
      return;
    }
    posts.forEach((post, i) => {
      const card = document.createElement('a');
      card.href = `/blog-post.html?slug=${post.slug}`;
      card.className = 'blog-card';
      card.style.animationDelay = `${i * 0.08}s`;
      card.innerHTML = `
        <div class="blog-card-img-wrap">
          <img class="blog-card-img" src="${post.image || ''}" alt="${post.titre}" loading="lazy" onerror="this.style.display='none'" />
        </div>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span class="badge ${catLabels[post.categorie] || ''}">${post.categorie}</span>
            <span>${post.date}</span>
            <span>${post.tempsLecture}</span>
          </div>
          <h3>${post.titre}</h3>
          <p class="blog-card-excerpt">${post.extrait}</p>
          <div class="blog-card-footer">
            ${(post.tags || []).map(t => `<span class="blog-tag">#${t}</span>`).join('')}
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadPosts(btn.dataset.cat);
    });
  });

  // Lire le paramètre URL ?categorie=
  const urlCat = new URLSearchParams(window.location.search).get('categorie') || 'tous';
  const matchBtn = [...filterBtns].find(b => b.dataset.cat === urlCat);
  if (matchBtn) { filterBtns.forEach(b => b.classList.remove('active')); matchBtn.classList.add('active'); }
  loadPosts(urlCat);
}

// ===== PAGE ARTICLE =====
if (document.getElementById('postMain')) {
  const slug = new URLSearchParams(window.location.search).get('slug');
  const loading = document.getElementById('postLoading');
  const content = document.getElementById('postContent');
  const notFound = document.getElementById('postNotFound');

  function getCachedPost(slug) {
    return JSON.parse(localStorage.getItem(`viral_blog_post_${slug}`) || 'null');
  }

  async function loadPost() {
    if (!slug) { loading.style.display = 'none'; notFound.style.display = 'flex'; return; }

    if (!navigator.onLine) {
      const cached = getCachedPost(slug);
      if (cached) { renderPost(cached); }
      else { loading.style.display = 'none'; notFound.style.display = 'flex'; }
      return;
    }

    try {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) { loading.style.display = 'none'; notFound.style.display = 'flex'; return; }
      const post = await res.json();
      localStorage.setItem(`viral_blog_post_${slug}`, JSON.stringify(post));
      renderPost(post);
    } catch {
      const cached = getCachedPost(slug);
      if (cached) renderPost(cached);
      else { loading.style.display = 'none'; notFound.style.display = 'flex'; }
    }
  }

  function renderPost(post) {
    document.title = `${post.titre} — Viral`;

    document.getElementById('postImage').src = post.image || '';
    document.getElementById('postImage').alt = post.titre;

    const badge = document.getElementById('postBadge');
    badge.textContent = post.categorie;
    badge.className = `badge ${catLabels[post.categorie] || ''}`;

    document.getElementById('postDate').textContent = post.date;
    document.getElementById('postRead').textContent = `· ${post.tempsLecture} de lecture`;
    document.getElementById('postTitle').textContent = post.titre;

    const tagsEl = document.getElementById('postTags');
    tagsEl.innerHTML = (post.tags || []).map(t => `<span class="post-tag">#${t}</span>`).join('');

    document.getElementById('postBody').innerHTML = post.contenu || '';

    loading.style.display = 'none';
    content.style.display = 'block';
    content.style.animation = 'fadeIn 0.5s ease';
  }

  loadPost();
}
