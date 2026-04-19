// ===== UTILS =====
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== NAV =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
window.addEventListener('scroll', () => navbar?.classList.toggle('scrolled', window.scrollY > 20));
navToggle?.addEventListener('click', () => navLinks?.classList.toggle('open'));

// ===== TOAST =====
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== ANIMATION COMPTEUR SCORE =====
function animateCounter(el, target, duration = 1200) {
  const start = Date.now();
  const from = 0;
  function update() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * eased);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ===== TYPEWRITER PLAN D'ACTION =====
function typewriterEffect(el, text, delay = 18) {
  el.textContent = '';
  let i = 0;
  function type() {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
      setTimeout(type, delay);
    }
  }
  type();
}

// ===== ÉTAT CHARGEMENT =====
const analyzeBtn = document.getElementById('analyzeBtn');
const analyzeBtnText = document.getElementById('analyzeBtnText');
const analyzeBtnSpinner = document.getElementById('analyzeBtnSpinner');

function setLoading(on) {
  analyzeBtn.disabled = on;
  analyzeBtn.classList.toggle('loading', on);
  analyzeBtnText.textContent = on ? 'Analyse en cours...' : 'Analyser mon compte';
}

// ===== FORMULAIRE =====
document.getElementById('analyzeForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const description = document.getElementById('anDescription').value.trim();
  const typeContenu = document.getElementById('anTypeContenu').value.trim();

  if (description.length < 10) { showToast('La description est trop courte.', 'error'); return; }
  if (!typeContenu) { showToast('Indiquez le type de contenu publié.', 'error'); return; }

  if (!navigator.onLine) { showToast('Vous êtes hors ligne — analyse impossible.', 'error'); return; }

  setLoading(true);

  // Afficher l'animation de scan
  document.getElementById('analyzePlaceholder').style.display = 'none';
  document.getElementById('analyzeContent').style.display = 'none';
  const scanOverlay = document.getElementById('scanOverlay');
  scanOverlay.style.display = 'flex';

  const body = {
    plateforme: document.getElementById('anPlateforme').value,
    description,
    abonnes: document.getElementById('anAbonnes').value,
    vuesMoyennes: document.getElementById('anVues').value,
    tauxEngagement: document.getElementById('anEngagement').value,
    typeContenu,
    objectif: document.getElementById('anObjectif').value,
    probleme: document.getElementById('anProbleme').value
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'Erreur lors de l\'analyse.', 'error'); return; }

    await new Promise(r => setTimeout(r, 800));
    scanOverlay.style.display = 'none';
    displayResults(data);

  } catch (err) {
    scanOverlay.style.display = 'none';
    document.getElementById('analyzePlaceholder').style.display = 'flex';
    if (err.name === 'AbortError') {
      showToast('Le serveur met du temps à répondre. Réessayez dans 30 secondes.', 'error');
    } else {
      showToast('Connexion impossible. Vérifiez votre connexion.', 'error');
    }
  } finally {
    clearTimeout(timeout);
    setLoading(false);
  }
});

// ===== AFFICHAGE RÉSULTATS =====
function displayResults(data) {
  const content = document.getElementById('analyzeContent');
  content.style.display = 'flex';

  // Score
  const scoreNum = document.getElementById('scoreNum');
  const scoreBar = document.getElementById('scoreBar');
  const scoreType = document.getElementById('scoreType');
  const targetScore = parseInt(data.score_engagement) || 0;
  const scoreCard = document.getElementById('scoreCard');

  scoreType.textContent = data.type_contenu_optimal || '';

  setTimeout(() => {
    scoreCard.classList.add('visible');
    animateCounter(scoreNum, targetScore);
    setTimeout(() => {
      scoreBar.style.width = `${(targetScore / 10) * 100}%`;
    }, 200);
  }, 100);

  // Forces
  const strengthsCard = document.getElementById('strengthsCard');
  const strengthsList = document.getElementById('strengthsList');
  strengthsList.innerHTML = (data.points_forts || []).map(p => `<li>${escHtml(p)}</li>`).join('');
  setTimeout(() => strengthsCard.classList.add('visible'), 300);

  // Faiblesses
  const weaknessesCard = document.getElementById('weaknessesCard');
  const weaknessesList = document.getElementById('weaknessesList');
  weaknessesList.innerHTML = (data.points_faibles || []).map(p => `<li>${escHtml(p)}</li>`).join('');
  setTimeout(() => weaknessesCard.classList.add('visible'), 450);

  // Recommandations
  const recoCard = document.getElementById('recoCard');
  const recoList = document.getElementById('recoList');
  recoList.innerHTML = (data.recommandations || []).map((r, i) =>
    `<li class="reco-item" id="recoItem${i}"><span class="reco-num">${i + 1}</span><span>${escHtml(r)}</span></li>`
  ).join('');
  setTimeout(() => {
    recoCard.classList.add('visible');
    (data.recommandations || []).forEach((_, i) => {
      setTimeout(() => {
        document.getElementById(`recoItem${i}`)?.classList.add('visible');
      }, i * 120);
    });
  }, 600);

  // Plan d'action (typewriter)
  const planCard = document.getElementById('planCard');
  const planText = document.getElementById('planText');
  setTimeout(() => {
    planCard.classList.add('visible');
    setTimeout(() => typewriterEffect(planText, data.plan_action || '', 16), 300);
  }, 900);

  content.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
