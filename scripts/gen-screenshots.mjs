import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/screenshots');
mkdirSync(OUT, { recursive: true });

// ===== DESKTOP 1280×720 =====
const desktopSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050508"/>
      <stop offset="100%" stop-color="#0a0a14"/>
    </linearGradient>
    <linearGradient id="purple" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="card1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0d0d15"/>
      <stop offset="100%" stop-color="#0d0d18"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <clipPath id="round"><rect width="1280" height="720" rx="0"/></clipPath>
  </defs>

  <!-- Background -->
  <rect width="1280" height="720" fill="url(#bg)"/>

  <!-- Grid dots -->
  <pattern id="grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
    <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.04)"/>
  </pattern>
  <rect width="1280" height="720" fill="url(#grid)"/>

  <!-- Blob purple -->
  <ellipse cx="200" cy="200" rx="220" ry="180" fill="rgba(124,58,237,0.12)" filter="url(#glow)"/>
  <!-- Blob cyan -->
  <ellipse cx="1100" cy="550" rx="180" ry="140" fill="rgba(6,182,212,0.09)" filter="url(#glow)"/>

  <!-- NAVBAR -->
  <rect width="1280" height="58" fill="rgba(5,5,8,0.9)"/>
  <rect y="57" width="1280" height="1" fill="rgba(255,255,255,0.07)"/>
  <!-- Logo -->
  <text x="40" y="37" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="900" fill="url(#purple)">Viral</text>
  <!-- Nav links -->
  <text x="200" y="36" font-family="Inter,Arial,sans-serif" font-size="13" fill="#94a3b8">Accueil</text>
  <text x="290" y="36" font-family="Inter,Arial,sans-serif" font-size="13" fill="#f1f5f9" font-weight="600">Générateur</text>
  <text x="400" y="36" font-family="Inter,Arial,sans-serif" font-size="13" fill="#94a3b8">Blog</text>
  <text x="460" y="36" font-family="Inter,Arial,sans-serif" font-size="13" fill="#94a3b8">Analyse IA</text>
  <text x="560" y="36" font-family="Inter,Arial,sans-serif" font-size="13" fill="#94a3b8">Bibliothèque</text>
  <!-- Auth button -->
  <rect x="1140" y="16" width="110" height="30" rx="8" fill="#7c3aed"/>
  <text x="1195" y="35" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="700" fill="white" text-anchor="middle">S'inscrire</text>

  <!-- PAGE HEADER -->
  <text x="640" y="115" font-family="Inter,Arial,sans-serif" font-size="32" font-weight="900" fill="#f1f5f9" text-anchor="middle">Générateur</text>
  <text x="640" y="115" font-family="Inter,Arial,sans-serif" font-size="32" font-weight="900" fill="url(#purple)" text-anchor="middle" dx="130"> Viral</text>
  <text x="640" y="145" font-family="Inter,Arial,sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">Remplissez le formulaire et obtenez un contenu optimisé en quelques secondes</text>

  <!-- LEFT PANEL — FORM -->
  <rect x="40" y="175" width="560" height="510" rx="20" fill="#0d0d15" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>

  <!-- Usage bar -->
  <rect x="60" y="195" width="520" height="50" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <text x="75" y="225" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="600" fill="#94a3b8">3 générations restantes aujourd'hui</text>
  <rect x="75" y="234" width="490" height="4" rx="99" fill="rgba(255,255,255,0.06)"/>
  <rect x="75" y="234" width="490" height="4" rx="99" fill="url(#purple)"/>

  <!-- Input: sujet -->
  <text x="60" y="278" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="600" fill="#94a3b8">VOTRE SUJET</text>
  <rect x="60" y="284" width="520" height="44" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(124,58,237,0.5)" stroke-width="1"/>
  <text x="76" y="311" font-family="Inter,Arial,sans-serif" font-size="13" fill="#475569">Comment gagner de l'argent en ligne avec l'IA...</text>

  <!-- Row: Cible + Objectif -->
  <text x="60" y="355" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="600" fill="#94a3b8">CIBLE</text>
  <rect x="60" y="361" width="250" height="44" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="76" y="388" font-family="Inter,Arial,sans-serif" font-size="13" fill="#f1f5f9">Entrepreneur</text>

  <text x="330" y="355" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="600" fill="#94a3b8">OBJECTIF</text>
  <rect x="330" y="361" width="250" height="44" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="346" y="388" font-family="Inter,Arial,sans-serif" font-size="13" fill="#f1f5f9">Engager</text>

  <!-- Row: Plateforme + Mode -->
  <text x="60" y="432" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="600" fill="#94a3b8">PLATEFORME</text>
  <rect x="60" y="438" width="250" height="44" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="76" y="465" font-family="Inter,Arial,sans-serif" font-size="13" fill="#f1f5f9">🎵 TikTok</text>

  <text x="330" y="432" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="600" fill="#94a3b8">MODE</text>
  <rect x="330" y="438" width="250" height="44" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="346" y="465" font-family="Inter,Arial,sans-serif" font-size="13" fill="#f1f5f9">🔥 Viral Extrême</text>

  <!-- Generate button -->
  <rect x="60" y="505" width="520" height="52" rx="12" fill="url(#purple)"/>
  <text x="320" y="536" font-family="Inter,Arial,sans-serif" font-size="15" font-weight="700" fill="white" text-anchor="middle">▶  Générer le contenu</text>

  <!-- RIGHT PANEL — RESULTS -->
  <rect x="640" y="175" width="600" height="510" rx="20" fill="#0d0d15" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>

  <!-- Variation tabs -->
  <rect x="660" y="195" width="170" height="36" rx="8" fill="#7c3aed"/>
  <text x="745" y="218" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="700" fill="white" text-anchor="middle">⚡ Version A</text>
  <rect x="838" y="195" width="170" height="36" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="923" y="218" font-family="Inter,Arial,sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">✦ Version B</text>
  <rect x="1016" y="195" width="170" height="36" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="1101" y="218" font-family="Inter,Arial,sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">✶ Version C</text>

  <!-- Hook card -->
  <rect x="660" y="244" width="560" height="85" rx="12" fill="rgba(124,58,237,0.08)" stroke="rgba(124,58,237,0.3)" stroke-width="1"/>
  <text x="676" y="266" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="700" fill="#7c3aed" letter-spacing="1">HOOK</text>
  <text x="676" y="286" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="#f1f5f9">Tu fais +50h de travail par semaine pour gagner</text>
  <text x="676" y="304" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="#f1f5f9">moins qu'une IA en 2h. Voici comment inverser ça.</text>

  <!-- Script card -->
  <rect x="660" y="343" width="560" height="120" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="676" y="365" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="700" fill="#94a3b8" letter-spacing="1">SCRIPT</text>
  <text x="676" y="385" font-family="Inter,Arial,sans-serif" font-size="12" fill="#94a3b8">J'ai passé 3 ans à travailler 60h par semaine. Résultat : épuisé et</text>
  <text x="676" y="403" font-family="Inter,Arial,sans-serif" font-size="12" fill="#94a3b8">sans résultats. Jusqu'au jour où j'ai découvert comment utiliser l'IA</text>
  <text x="676" y="421" font-family="Inter,Arial,sans-serif" font-size="12" fill="#94a3b8">pour automatiser 80% de mes tâches en moins de 2 semaines.</text>
  <text x="676" y="445" font-family="Inter,Arial,sans-serif" font-size="12" fill="#64748b">Aujourd'hui je gagne 3x plus en travaillant 20h par semaine.</text>

  <!-- CTA card -->
  <rect x="660" y="477" width="560" height="60" rx="12" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.25)" stroke-width="1"/>
  <text x="676" y="498" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="700" fill="#06b6d4" letter-spacing="1">CALL TO ACTION</text>
  <text x="676" y="518" font-family="Inter,Arial,sans-serif" font-size="13" fill="#f1f5f9">Sauvegarde ce post et dis-moi en commentaire : tu travailles</text>
  <text x="676" y="534" font-family="Inter,Arial,sans-serif" font-size="13" fill="#f1f5f9">combien d'heures par semaine ? 👇</text>

  <!-- Score card -->
  <rect x="660" y="551" width="270" height="110" rx="12" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.25)" stroke-width="1"/>
  <text x="676" y="572" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="700" fill="#10b981" letter-spacing="1">SCORE VIRAL</text>
  <text x="730" y="630" font-family="Inter,Arial,sans-serif" font-size="48" font-weight="900" fill="#f1f5f9" text-anchor="middle">87</text>
  <text x="770" y="630" font-family="Inter,Arial,sans-serif" font-size="16" fill="#94a3b8">/100</text>
  <rect x="676" y="645" width="240" height="5" rx="99" fill="rgba(255,255,255,0.06)"/>
  <rect x="676" y="645" width="209" height="5" rx="99" fill="url(#purple)"/>

  <!-- Hashtags card -->
  <rect x="950" y="551" width="270" height="110" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="966" y="572" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="700" fill="#94a3b8" letter-spacing="1">HASHTAGS</text>
  <rect x="966" y="580" width="80" height="22" rx="99" fill="rgba(124,58,237,0.15)" stroke="rgba(124,58,237,0.3)" stroke-width="1"/>
  <text x="1006" y="595" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="600" fill="#9d5fff" text-anchor="middle">#ia</text>
  <rect x="1056" y="580" width="100" height="22" rx="99" fill="rgba(124,58,237,0.15)" stroke="rgba(124,58,237,0.3)" stroke-width="1"/>
  <text x="1106" y="595" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="600" fill="#9d5fff" text-anchor="middle">#argent</text>
  <rect x="966" y="610" width="120" height="22" rx="99" fill="rgba(6,182,212,0.12)" stroke="rgba(6,182,212,0.25)" stroke-width="1"/>
  <text x="1026" y="625" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="600" fill="#06b6d4" text-anchor="middle">#entrepreneuriat</text>
  <rect x="1096" y="610" width="100" height="22" rx="99" fill="rgba(6,182,212,0.12)" stroke="rgba(6,182,212,0.25)" stroke-width="1"/>
  <text x="1146" y="625" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="600" fill="#06b6d4" text-anchor="middle">#tiktok2026</text>
  <rect x="966" y="640" width="90" height="22" rx="99" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.25)" stroke-width="1"/>
  <text x="1011" y="655" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="600" fill="#f59e0b" text-anchor="middle">#viral</text>
</svg>`;

// ===== MOBILE 390×844 =====
const mobileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#050508"/>
      <stop offset="100%" stop-color="#0a0a14"/>
    </linearGradient>
    <linearGradient id="purple" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="30" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="390" height="844" fill="url(#bg)"/>
  <pattern id="grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
    <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.04)"/>
  </pattern>
  <rect width="390" height="844" fill="url(#grid)"/>

  <!-- Blob -->
  <ellipse cx="80" cy="150" rx="150" ry="120" fill="rgba(124,58,237,0.12)" filter="url(#glow)"/>
  <ellipse cx="320" cy="700" rx="120" ry="100" fill="rgba(6,182,212,0.09)" filter="url(#glow)"/>

  <!-- STATUS BAR -->
  <rect width="390" height="44" fill="rgba(5,5,8,0.95)"/>
  <text x="20" y="28" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="600" fill="#f1f5f9">9:41</text>
  <text x="355" y="28" font-family="Inter,Arial,sans-serif" font-size="11" fill="#f1f5f9" text-anchor="middle">●●●</text>

  <!-- NAVBAR -->
  <rect y="44" width="390" height="50" fill="rgba(5,5,8,0.9)"/>
  <rect y="93" width="390" height="1" fill="rgba(255,255,255,0.07)"/>
  <text x="20" y="74" font-family="Inter,Arial,sans-serif" font-size="18" font-weight="900" fill="url(#purple)">Viral</text>
  <rect x="325" y="58" width="48" height="22" rx="6" fill="#7c3aed"/>
  <text x="349" y="73" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="700" fill="white" text-anchor="middle">Menu</text>

  <!-- HEADER -->
  <text x="195" y="136" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="900" fill="#f1f5f9" text-anchor="middle">Générateur Viral</text>
  <text x="195" y="158" font-family="Inter,Arial,sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">Contenu viral optimisé par l'IA</text>

  <!-- FORM CARD -->
  <rect x="16" y="174" width="358" height="380" rx="18" fill="#0d0d15" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>

  <!-- Usage bar -->
  <rect x="32" y="190" width="326" height="42" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
  <text x="48" y="213" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="600" fill="#94a3b8">3 générations gratuites aujourd'hui</text>
  <rect x="48" y="222" width="294" height="3" rx="99" fill="rgba(255,255,255,0.06)"/>
  <rect x="48" y="222" width="294" height="3" rx="99" fill="url(#purple)"/>

  <!-- Input sujet -->
  <text x="32" y="258" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">VOTRE SUJET</text>
  <rect x="32" y="264" width="326" height="40" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(124,58,237,0.4)" stroke-width="1"/>
  <text x="46" y="288" font-family="Inter,Arial,sans-serif" font-size="12" fill="#475569">Comment gagner de l'argent en ligne...</text>

  <!-- Cible -->
  <text x="32" y="326" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">CIBLE</text>
  <rect x="32" y="332" width="155" height="38" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="46" y="355" font-family="Inter,Arial,sans-serif" font-size="12" fill="#f1f5f9">Entrepreneur</text>

  <text x="200" y="326" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">OBJECTIF</text>
  <rect x="200" y="332" width="158" height="38" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="214" y="355" font-family="Inter,Arial,sans-serif" font-size="12" fill="#f1f5f9">Engager</text>

  <!-- Plateforme -->
  <text x="32" y="393" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">PLATEFORME</text>
  <rect x="32" y="399" width="155" height="38" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="46" y="422" font-family="Inter,Arial,sans-serif" font-size="12" fill="#f1f5f9">🎵 TikTok</text>

  <text x="200" y="393" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="600" fill="#94a3b8">MODE</text>
  <rect x="200" y="399" width="158" height="38" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="214" y="422" font-family="Inter,Arial,sans-serif" font-size="12" fill="#f1f5f9">🔥 Viral Extrême</text>

  <!-- Generate button -->
  <rect x="32" y="454" width="326" height="48" rx="12" fill="url(#purple)"/>
  <text x="195" y="483" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="white" text-anchor="middle">▶  Générer le contenu</text>

  <!-- RESULTS CARD -->
  <rect x="16" y="568" width="358" height="258" rx="18" fill="#0d0d15" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>

  <!-- Variation tabs mobile -->
  <rect x="32" y="584" width="100" height="28" rx="7" fill="#7c3aed"/>
  <text x="82" y="602" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="700" fill="white" text-anchor="middle">⚡ A</text>
  <rect x="140" y="584" width="100" height="28" rx="7" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="190" y="602" font-family="Inter,Arial,sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">✦ B</text>
  <rect x="248" y="584" width="100" height="28" rx="7" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="298" y="602" font-family="Inter,Arial,sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">✶ C</text>

  <!-- Hook -->
  <rect x="32" y="624" width="326" height="60" rx="10" fill="rgba(124,58,237,0.08)" stroke="rgba(124,58,237,0.25)" stroke-width="1"/>
  <text x="46" y="643" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="700" fill="#7c3aed" letter-spacing="1">HOOK</text>
  <text x="46" y="661" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="700" fill="#f1f5f9">Tu travailles 60h/sem pour gagner moins</text>
  <text x="46" y="677" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="700" fill="#f1f5f9">qu'une IA en 2h. Voici comment changer ça.</text>

  <!-- Score -->
  <rect x="32" y="698" width="155" height="60" rx="10" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.2)" stroke-width="1"/>
  <text x="46" y="716" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="700" fill="#10b981" letter-spacing="1">SCORE VIRAL</text>
  <text x="100" y="748" font-family="Inter,Arial,sans-serif" font-size="32" font-weight="900" fill="#f1f5f9" text-anchor="middle">87</text>
  <text x="130" y="748" font-family="Inter,Arial,sans-serif" font-size="11" fill="#94a3b8">/100</text>

  <!-- Hashtags mobile -->
  <rect x="200" y="698" width="158" height="60" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <text x="214" y="716" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="700" fill="#94a3b8" letter-spacing="1">HASHTAGS</text>
  <rect x="214" y="722" width="50" height="18" rx="99" fill="rgba(124,58,237,0.15)" stroke="rgba(124,58,237,0.3)" stroke-width="1"/>
  <text x="239" y="734" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="600" fill="#9d5fff" text-anchor="middle">#ia</text>
  <rect x="272" y="722" width="70" height="18" rx="99" fill="rgba(124,58,237,0.15)" stroke="rgba(124,58,237,0.3)" stroke-width="1"/>
  <text x="307" y="734" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="600" fill="#9d5fff" text-anchor="middle">#argent</text>
  <rect x="214" y="746" width="120" height="18" rx="99" fill="rgba(6,182,212,0.12)" stroke="rgba(6,182,212,0.25)" stroke-width="1"/>
  <text x="274" y="758" font-family="Inter,Arial,sans-serif" font-size="9" font-weight="600" fill="#06b6d4" text-anchor="middle">#entrepreneuriat</text>

  <!-- Actions -->
  <rect x="32" y="772" width="155" height="34" rx="10" fill="url(#purple)"/>
  <text x="110" y="793" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="700" fill="white" text-anchor="middle">Tout copier</text>
  <rect x="200" y="772" width="158" height="34" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <text x="279" y="793" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="600" fill="#94a3b8" text-anchor="middle">Régénérer</text>
</svg>`;

async function generate(svgStr, filename, width, height) {
  await sharp(Buffer.from(svgStr))
    .resize(width, height)
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(join(OUT, filename));
  console.log(`✓ ${filename} (${width}×${height})`);
}

await generate(desktopSvg, 'desktop.png', 1280, 720);
await generate(mobileSvg, 'mobile.png', 390, 844);
console.log('Screenshots générés dans public/screenshots/');
