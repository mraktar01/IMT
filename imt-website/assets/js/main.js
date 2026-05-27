/* ============================================================
   IMT — Main JavaScript  v4
   • Section Focus Mode on BOTH desktop + mobile
   • Explore More (2-item limit on mobile, 3 on desktop)
   • Quotes carousel, post modal, legal modal, toast, contact
   ============================================================ */
'use strict';

// ══════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════

const ALL_SECTIONS = ['hero','mission','programs','about','moments','posts','quotes','contact'];

// map nav-key → section id  (null = Home = show all)
const SECTION_MAP = {
  hero: null, mission:'mission', programs:'programs',
  about:'about', moments:'moments', posts:'posts', contact:'contact'
};

const SECTION_NAMES = {
  mission:'Mission & Vision', programs:'Our Programs', about:'About Us',
  moments:'Moments', posts:'Recent Posts', contact:'Contact Us'
};

// How many cards to show before "Explore More"
const MOBILE_LIMIT  = 2;   // ≤768 px
const DESKTOP_LIMIT = 3;   // >768 px  (only for gallery/posts; programs always show 3 on desktop)

let focusedSection = null;

// ══════════════════════════════════════════════════════════════
// UTILITY
// ══════════════════════════════════════════════════════════════

function isMobile() { return window.innerWidth <= 768; }

function getNavOffset() {
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
  const barH = document.body.classList.contains('bar-visible')
    ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')) || 44 : 0;
  return navH + barH;
}

// ══════════════════════════════════════════════════════════════
// SECTION FOCUS MODE  (desktop + mobile)
// ══════════════════════════════════════════════════════════════

/**
 * Show ONLY one section (+ footer).  null = restore full page.
 */
function focusSection(sectionId) {
  focusedSection = sectionId;

  ALL_SECTIONS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const show = (!sectionId) || (id === sectionId);
    if (show) {
      el.style.removeProperty('display');
      el.classList.add('section-focus-visible');
      el.classList.remove('section-focus-hidden');
    } else {
      el.style.display = 'none';
      el.classList.add('section-focus-hidden');
      el.classList.remove('section-focus-visible');
    }
  });

  // Footer always visible
  const footer = document.getElementById('footer');
  if (footer) footer.style.removeProperty('display');

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // body class (drives CSS padding / indicator)
  document.body.classList.toggle('focus-mode', !!sectionId);

  // ── Mobile back banner ────────────────────────────────────
  const mob = document.getElementById('mobile-back-banner');
  if (mob) {
    mob.style.display = (sectionId && isMobile()) ? 'flex' : 'none';
    const lbl = document.getElementById('mobile-back-label');
    if (lbl && sectionId) lbl.textContent = SECTION_NAMES[sectionId] || sectionId;
  }

  // ── Desktop focus bar (inside navbar) ─────────────────────
  const deskBar = document.getElementById('desktop-focus-bar');
  if (deskBar) {
    deskBar.style.display = (sectionId && !isMobile()) ? 'flex' : 'none';
    const deskLbl = document.getElementById('desktop-focus-label');
    if (deskLbl && sectionId) deskLbl.textContent = SECTION_NAMES[sectionId] || sectionId;
  }

  // ── Active nav state ──────────────────────────────────────
  const activeKey = sectionId || 'hero';
  document.querySelectorAll('.nav-link[data-section]').forEach(l =>
    l.classList.toggle('active', l.dataset.section === activeKey));
  document.querySelectorAll('.mob-nav-item[data-section]').forEach(i =>
    i.classList.toggle('active', i.dataset.section === activeKey));

  // Re-run explore-more after section is shown
  if (sectionId) setTimeout(() => applyExploreMore(sectionId), 50);
}

/** Restore full page */
window.showFullPage = function () {
  focusedSection = null;
  ALL_SECTIONS.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.removeProperty('display');
      el.classList.remove('section-focus-hidden','section-focus-visible');
    }
  });
  document.body.classList.remove('focus-mode');

  const mob    = document.getElementById('mobile-back-banner');
  const deskBar= document.getElementById('desktop-focus-bar');
  if (mob)     mob.style.display  = 'none';
  if (deskBar) deskBar.style.display = 'none';

  window.scrollTo({ top: 0, behavior: 'smooth' });

  document.querySelectorAll('.nav-link[data-section]').forEach(l =>
    l.classList.toggle('active', l.dataset.section === 'hero'));
  document.querySelectorAll('.mob-nav-item[data-section]').forEach(i =>
    i.classList.toggle('active', i.dataset.section === 'hero'));

  // Restore all explore-more limits
  setTimeout(applyAllExploreMore, 50);
};

// Restore full page on resize to avoid stale hide state
window.addEventListener('resize', () => {
  if (focusedSection) {
    // Re-trigger to update mobile vs desktop bars
    focusSection(focusedSection);
  } else {
    // Ensure everything is shown
    ALL_SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.removeProperty('display');
    });
    const mob    = document.getElementById('mobile-back-banner');
    const deskBar= document.getElementById('desktop-focus-bar');
    if (mob)     mob.style.display = 'none';
    if (deskBar) deskBar.style.display = 'none';
  }
  setTimeout(applyAllExploreMore, 50);
}, { passive: true });

// ── Nav click handlers ────────────────────────────────────────

document.querySelectorAll('.nav-link[data-section]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const sec = link.dataset.section;
    if (sec === 'hero') showFullPage();
    else focusSection(SECTION_MAP[sec] || sec);
  });
});

document.querySelectorAll('.mob-nav-item[data-section]').forEach(item => {
  item.addEventListener('click', () => {
    const sec = item.dataset.section;
    if (sec === 'hero') showFullPage();
    else focusSection(SECTION_MAP[sec] || sec);
  });
});

// Internal anchor links (e.g. "Explore Programs" button)
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  if (id === 'hero') showFullPage();
  else focusSection(id);
});

// ══════════════════════════════════════════════════════════════
// EXPLORE MORE  (2 on mobile, 3 on desktop for gallery/posts)
// Programs section: 3 on desktop always, 2 on mobile
// ══════════════════════════════════════════════════════════════

function applyExploreMore(sectionId) {
  if (sectionId === 'programs') applyProgramsLimit();
  if (sectionId === 'moments')  applyGalleryLimit();
  if (sectionId === 'posts')    applyPostsLimit();
}

function applyAllExploreMore() {
  applyProgramsLimit();
  applyGalleryLimit();
  applyPostsLimit();
}

// ── Programs (static cards) ───────────────────────────────────

function applyProgramsLimit() {
  const grid  = document.querySelector('.programs-grid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.program-card'));
  const limit = isMobile() ? MOBILE_LIMIT : 999; // Desktop: show all
  removeExploreBtn(grid);
  cards.forEach((c, i) => {
    c.style.display = (i < limit) ? '' : 'none';
  });
  if (isMobile() && cards.length > limit) addExploreBtn(grid, cards, 'programs');
}

// ── Gallery (dynamic) ─────────────────────────────────────────

function applyGalleryLimit() {
  const grid  = document.getElementById('gallery-grid');
  if (!grid) return;
  const items = Array.from(grid.querySelectorAll('.gallery-item'));
  if (!items.length) return;
  const limit = isMobile() ? MOBILE_LIMIT : DESKTOP_LIMIT;
  removeExploreBtn(grid);
  items.forEach((c, i) => {
    c.style.display = (i < limit) ? '' : 'none';
  });
  if (items.length > limit) addExploreBtn(grid, items, 'moments');
}

// ── Posts (dynamic) ───────────────────────────────────────────

function applyPostsLimit() {
  const grid  = document.getElementById('posts-grid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.post-card'));
  if (!cards.length) return;
  const limit = isMobile() ? MOBILE_LIMIT : DESKTOP_LIMIT;
  removeExploreBtn(grid);
  cards.forEach((c, i) => {
    c.style.display = (i < limit) ? '' : 'none';
  });
  if (cards.length > limit) addExploreBtn(grid, cards, 'posts');
}

function removeExploreBtn(container) {
  container.parentElement?.querySelectorAll('.explore-more-wrap').forEach(b => b.remove());
}

function addExploreBtn(grid, items, sectionId) {
  const wrap = document.createElement('div');
  wrap.className = 'explore-more-wrap';
  const btn = document.createElement('button');
  btn.className = 'btn-explore-more';
  btn.innerHTML = 'Explore More <span class="explore-arrow">↓</span>';
  btn.onclick = () => {
    items.forEach(c => c.style.display = '');
    wrap.remove();
  };
  wrap.appendChild(btn);
  grid.parentElement.appendChild(wrap);
}

// Observe gallery/posts grid changes (Firebase fills them dynamically)
new MutationObserver(() => {
  applyGalleryLimit();
  applyPostsLimit();
}).observe(document.body, { childList: true, subtree: true });

// Initial apply on load
window.addEventListener('load', applyAllExploreMore);

// ══════════════════════════════════════════════════════════════
// DESKTOP NAVBAR — scroll shadow
// ══════════════════════════════════════════════════════════════

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ══════════════════════════════════════════════════════════════
// ANNOUNCEMENT BAR
// ══════════════════════════════════════════════════════════════

document.getElementById('ann-close')?.addEventListener('click', () => {
  document.getElementById('announcement-bar').classList.add('hidden');
  document.body.classList.remove('bar-visible');
});

// ══════════════════════════════════════════════════════════════
// SCROLL REVEAL
// ══════════════════════════════════════════════════════════════

function observeReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}
window.observeReveal = observeReveal;
observeReveal();
new MutationObserver(observeReveal).observe(document.body, { childList: true, subtree: true });

// ══════════════════════════════════════════════════════════════
// QUOTES — infinite ticker bar
// ══════════════════════════════════════════════════════════════

const QUOTES = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "Technology is best when it brings people together.", author: "Matt Mullenweg" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "The advance of technology is based on making it fit in so that you don't really even notice it.", author: "Bill Gates" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" }
];

function renderQuotesTicker() {
  const track = document.getElementById('quotes-track');
  if (!track) return;

  // Build one set of items, then duplicate for seamless loop
  function buildSet() {
    return QUOTES.map(q => `
      <span class="quote-ticker-item">
        <span class="quote-ticker-mark">"</span>
        <span class="quote-ticker-text">${q.text}</span>
        <span class="quote-ticker-author">— ${q.author}</span>
        <span class="quote-ticker-sep">✦</span>
      </span>`).join('');
  }

  track.innerHTML = buildSet() + buildSet(); // duplicate for infinite loop
}

renderQuotesTicker();

// ══════════════════════════════════════════════════════════════
// POST MODAL
// ══════════════════════════════════════════════════════════════

window.openPost = function(postData) {
  if (typeof postData === 'string') { try { postData = JSON.parse(postData); } catch(e){} }
  document.getElementById('modal-post-title').textContent   = postData.title   || '';
  document.getElementById('modal-post-type').textContent    = postData.type    || '';
  document.getElementById('modal-post-content').textContent = postData.content || '';
  const img = document.getElementById('modal-post-img');
  img.style.display = postData.imageUrl ? 'block' : 'none';
  if (postData.imageUrl) img.src = postData.imageUrl;
  document.getElementById('post-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
};
window.closeModal      = (e,id) => { if (e.target.id===id) closeModalDirect(id); };
window.closeModalDirect = id => { document.getElementById(id)?.classList.remove('open'); document.body.style.overflow=''; };
document.addEventListener('keydown', e => {
  if (e.key==='Escape') { document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open')); document.body.style.overflow=''; }
});

// ══════════════════════════════════════════════════════════════
// LEGAL MODALS — decorated, with "I Understood" button
// ══════════════════════════════════════════════════════════════

// Default static content (used when Firestore hasn't loaded yet)
const LEGAL_DEFAULT = {
  privacy: {
    title: 'Privacy Policy',
    effectiveDate: 'April 2026',
    html: `
      <h3>📋 1. Information We Collect</h3>
      <p>We collect information you provide directly when you fill out our contact form: <strong>name, email address, subject,</strong> and <strong>message</strong>. We do not collect any information automatically or through cookies.</p>
      <h3>🔒 2. How We Use Your Information</h3>
      <p>Your information is used solely to respond to your inquiry and improve our services. We <strong>never sell, rent, or share</strong> your personal data with third parties for marketing purposes.</p>
      <h3>🛡️ 3. Data Security</h3>
      <p>All form submissions are securely stored using <strong>Firebase Firestore</strong> (Google Cloud infrastructure), protected by industry-standard encryption and access controls.</p>
      <h3>🍪 4. Cookies</h3>
      <p>This website does <strong>not use tracking cookies</strong> or any third-party analytics. Firebase may use essential technical session tokens for its operation.</p>
      <h3>🖼️ 5. Images & Media</h3>
      <p>Gallery images and post thumbnails are hosted on <strong>Cloudinary</strong> and served via secure CDN. No personal images are stored without explicit permission.</p>
      <h3>👤 6. Your Rights</h3>
      <p>You have the right to request access to, correction of, or deletion of any personal data we hold about you. Contact us at <strong>info@imtinstitute.org</strong> to exercise these rights.</p>
      <h3>✏️ 7. Changes to This Policy</h3>
      <p>We may update this Privacy Policy periodically. Any changes will be reflected with an updated effective date on this page.`
  },
  terms: {
    title: 'Terms & Conditions',
    effectiveDate: 'April 2026',
    html: `
      <h3>✅ 1. Acceptance of Terms</h3>
      <p>By accessing and using this website, you <strong>accept and agree</strong> to be bound by these Terms and Conditions. If you do not agree, please discontinue use of this site.</p>
      <h3>🌐 2. Use of the Website</h3>
      <p>This website is provided for <strong>informational purposes</strong> about the Institute of Modern Technology, its programs, and activities. You agree not to misuse the website, its content, or its services.</p>
      <h3>©️ 3. Intellectual Property</h3>
      <p>All content on this website — including text, images, logos, and design — is the <strong>intellectual property of the Institute of Modern Technology</strong> and may not be reproduced, distributed, or used without prior written permission.</p>
      <h3>🎓 4. Program Eligibility</h3>
      <p>Scholarship and program eligibility is subject to the institute's <strong>internal criteria</strong>, which may change without prior notice. Final decisions on eligibility rest solely with IMT.</p>
      <h3>📧 5. Contact Form Use</h3>
      <p>By submitting the contact form, you consent to us storing your submitted information for the purpose of responding to your inquiry. Do not submit sensitive personal information through the form.</p>
      <h3>⚠️ 6. Disclaimer</h3>
      <p>Information on this website is provided <strong>in good faith</strong>. IMT does not guarantee the completeness or accuracy of all information and reserves the right to update content at any time without notice.</p>
      <h3>⚖️ 7. Governing Law</h3>
      <p>These terms shall be governed by and construed in accordance with the laws applicable in the jurisdiction where the Institute of Modern Technology is registered.`
  }
};

window.openLegal = function (type) {
  // Try Firestore-loaded content first, fall back to static default
  const firestoreData = window._imt_legal?.[type];
  const defaults      = LEGAL_DEFAULT[type];
  if (!defaults) return;

  const title         = firestoreData?.title         || defaults.title;
  const effectiveDate = firestoreData?.effectiveDate || defaults.effectiveDate;
  const html          = firestoreData?.html          || defaults.html;

  document.getElementById('legal-modal-title').textContent     = title;
  document.getElementById('legal-modal-effective').textContent = `Effective Date: ${effectiveDate}`;
  document.getElementById('legal-footer-note').textContent     = `Last updated: ${effectiveDate}`;
  document.getElementById('legal-modal-body').innerHTML        = html;
  document.getElementById('legal-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
};

// ══════════════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════════════

window.showToast = function(msg, type='success') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `show ${type}`;
  clearTimeout(t._t); t._t = setTimeout(() => { t.className=''; }, 3500);
};

// ══════════════════════════════════════════════════════════════
// CONTACT FORM
// ══════════════════════════════════════════════════════════════

window.submitContact = async function() {
  const name    = document.getElementById('cf-name').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const subject = document.getElementById('cf-subject').value.trim();
  const message = document.getElementById('cf-message').value.trim();
  if (!name||!email||!subject||!message) { showToast('Please fill in all fields.','error'); return; }
  if (!email.includes('@'))              { showToast('Please enter a valid email.','error'); return; }
  const db = window._imt_db;
  if (db) {
    try {
      const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      await addDoc(collection(db,'contacts'), { name, email, subject, message, createdAt: new Date() });
    } catch(e) { console.error(e); }
  }
  document.getElementById('contact-form-wrap').style.display = 'none';
  document.getElementById('form-success').style.display      = 'block';
  showToast('Message sent successfully!','success');
};
