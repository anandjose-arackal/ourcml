/* =========================================================================
   Cherupushpa Mission League — Interactive Badge
   Replaces the audio player on /badge. script.js calls CMLBadge.open()
   when the badge route opens and CMLBadge.close() when the player closes.
   GSAP is loaded on first open so other routes stay light.
   ========================================================================= */

(() => {
  'use strict';

  const GSAP_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
  const NS = 'http://www.w3.org/2000/svg';

  const PARTS = {
    ribbon: {
      name: 'Red ribbon', spec: '8 cm long · 4 cm wide', color: '#e63a1e',
      meaning: 'Red indicates martyrdom for the Church.', measures: ['bx-m-top', 'bx-m-ribbon'],
      ml: { name: 'ചുവന്ന റിബൺ', spec: '8 സെ.മീ. നീളം · 4 സെ.മീ. വീതി',
        meaning: 'ചുവപ്പ് നിറം സഭയ്ക്കുവേണ്ടിയുള്ള രക്തസാക്ഷിത്വത്തെ സൂചിപ്പിക്കുന്നു.' },
    },
    frills: {
      name: 'Yellow frills', spec: '4 cm long · 4 cm wide', color: '#ffdd1f',
      meaning: 'The yellow frills finish the ribbon, 4 cm long and 4 cm wide.',
      note: 'On the CML flag, yellow stands for peace and harmony.', measures: ['bx-m-frills'],
      ml: { name: 'മഞ്ഞ തൊങ്ങലുകൾ', spec: '4 സെ.മീ. നീളം · 4 സെ.മീ. വീതി',
        meaning: '4 സെ.മീ. നീളവും 4 സെ.മീ. വീതിയുമുള്ള മഞ്ഞ തൊങ്ങലുകൾ റിബണിനെ പൂർത്തിയാക്കുന്നു.',
        note: 'സി.എം.എൽ. പതാകയിൽ മഞ്ഞ നിറം സമാധാനത്തെയും ഐക്യത്തെയും സൂചിപ്പിക്കുന്നു.' },
    },
    shield: {
      name: 'Green heart-shaped shield', spec: 'Behind the cross', color: '#1e8c3a',
      meaning: 'The heart-shaped green shield is the symbol of Faith and Hope.',
      ml: { name: 'ഹൃദയാകൃതിയിലുള്ള പച്ച പരിച', spec: 'കുരിശിന് പിന്നിൽ',
        meaning: 'ഹൃദയാകൃതിയിലുള്ള പച്ച പരിച വിശ്വാസത്തിന്റെയും പ്രത്യാശയുടെയും പ്രതീകമാണ്.' },
    },
    cross: {
      name: 'White cross', spec: 'Across the shield', color: '#ffffff',
      meaning: 'The white cross reminds us of the martyrs who witnessed for Christ.',
      ml: { name: 'വെള്ള കുരിശ്', spec: 'പരിചയ്ക്ക് കുറുകെ',
        meaning: 'ക്രിസ്തുവിന് സാക്ഷ്യം വഹിച്ച രക്തസാക്ഷികളെ വെള്ള കുരിശ് നമ്മെ ഓർമ്മിപ്പിക്കുന്നു.' },
    },
    medal: {
      name: 'Medal of St. Little Flower', spec: 'At the centre', color: '#e8b84a',
      meaning: 'It symbolises our love, reverence and devotion to our Heavenly Patroness, Saint Little Theresa of Child Jesus, and our efforts to attain her missionary spirit.',
      ml: { name: 'ചെറുപുഷ്പത്തിന്റെ മെഡൽ', spec: 'മധ്യഭാഗത്ത്',
        meaning: 'നമ്മുടെ സ്വർഗീയ മധ്യസ്ഥയായ ഉണ്ണീശോയുടെ വിശുദ്ധ കൊച്ചുത്രേസ്യയോടുള്ള സ്നേഹം, ആദരവ്, ഭക്തി എന്നിവയെയും അവളുടെ പ്രേഷിതചൈതന്യം സ്വന്തമാക്കാനുള്ള നമ്മുടെ പരിശ്രമങ്ങളെയും ഇത് പ്രതീകപ്പെടുത്തുന്നു.' },
    },
  };
  const INTRO = {
    name: 'Five parts, one badge', spec: 'Cloth badge · medal at the centre', color: '#ffdd1f',
    meaning: 'The badge is a red cloth ribbon with yellow frills. On it sit a green heart-shaped shield, a white cross, and the medal of St. Little Flower.',
    ml: { name: 'അഞ്ച് ഭാഗങ്ങൾ, ഒരു ബാഡ്ജ്', spec: 'തുണി ബാഡ്ജ് · മധ്യത്തിൽ മെഡൽ',
      meaning: 'ചുവന്ന തുണി റിബണും മഞ്ഞ തൊങ്ങലുകളും ചേർന്നതാണ് ബാഡ്ജ്. അതിൽ ഹൃദയാകൃതിയിലുള്ള പച്ച പരിചയും വെള്ള കുരിശും ചെറുപുഷ്പത്തിന്റെ മെഡലും ഉണ്ട്.' },
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let gsapPromise = null;
  let ready = false;
  let isOpen = false;
  let active = null;
  let G = null;
  let build = null;
  let idle = [];
  let strands = [];

  function loadGsap() {
    if (window.gsap) return Promise.resolve(window.gsap);
    if (!gsapPromise) {
      gsapPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = GSAP_SRC;
        s.async = true;
        s.onload = () => resolve(window.gsap);
        s.onerror = () => { gsapPromise = null; reject(new Error('GSAP failed to load')); };
        document.head.appendChild(s);
      });
    }
    return gsapPromise;
  }

  const svgEl = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent.appendChild(n);
    return n;
  };

  /* ---------------------------------------------------------------------
     Card + chips (work without GSAP)
  --------------------------------------------------------------------- */
  const setText = (sel, text) => {
    const n = $(sel);
    n.textContent = text || '';
    n.hidden = !text;
  };

  function showCard(p) {
    setText('#bxName', p.name); setText('#bxNameMl', p.ml.name);
    setText('#bxSpec', p.spec); setText('#bxSpecMl', p.ml.spec);
    setText('#bxMeaning', p.meaning); setText('#bxMeaningMl', p.ml.meaning);
    setText('#bxNote', p.note); setText('#bxNoteMl', p.ml.note);
    $('#bxSwatch').style.background = p.color;
  }

  function drawMeasures(ids) {
    $$('.bx-measure').forEach((m) => m.classList.toggle('is-on', !!ids && ids.includes(m.id)));
    if (!G || !ids) return;
    ids.forEach((id) => G.fromTo(`#${id} .bx-m-line`, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' }));
  }

  /* ---------------------------------------------------------------------
     Per-part animations
  --------------------------------------------------------------------- */
  const ANIM = {
    ribbon() {
      const layer = $('#bx-cloth-layer');
      layer.setAttribute('filter', 'url(#bx-cloth)');
      G.timeline({ onComplete: () => layer.removeAttribute('filter') })
        .fromTo('#bx-clothDisp', { attr: { scale: 0 } }, { attr: { scale: 18 }, duration: 0.45, ease: 'sine.out' })
        .fromTo('#bx-clothNoise', { attr: { baseFrequency: '0.008 0.03' } }, { attr: { baseFrequency: '0.014 0.05' }, duration: 1.6, ease: 'sine.inOut' }, 0)
        .to('#bx-clothDisp', { attr: { scale: 0 }, duration: 1.15, ease: 'sine.inOut' }, 0.45)
        .fromTo('#bx-ribbonPulse', { opacity: 0 }, { opacity: 0.45, duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.1);
    },
    frills() {
      G.fromTo('.bx-scallop', { scaleY: 1 }, { keyframes: { scaleY: [1, 1.6, 0.85, 1] }, duration: 0.7, stagger: 0.07, transformOrigin: '50% 100%', ease: 'sine.inOut' });
      G.fromTo(strands.map((s) => s.r), { rotation: 0 }, { keyframes: { rotation: [0, 16, -11, 6, 0] }, duration: 1.3, stagger: 0.045, transformOrigin: '50% 0%', ease: 'sine.inOut' });
    },
    shield() {
      G.timeline()
        .fromTo('#bx-shieldOutline', { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' })
        .fromTo('#bx-shieldGlow', { opacity: 0 }, { opacity: 0.8, duration: 0.3 }, 0.2)
        .fromTo('#bx-p-shield', { scale: 1 }, { keyframes: { scale: [1, 1.07, 1, 1.07, 1] }, duration: 1.1, transformOrigin: '50% 50%', ease: 'power1.inOut' }, 0.5)
        .to('#bx-shieldGlow', { opacity: 0, duration: 0.6 }, 1.6)
        .to('#bx-shieldOutline', { opacity: 0, duration: 0.6 }, 1.8);
    },
    cross() {
      G.timeline()
        .fromTo('#bx-crossRays', { opacity: 0, rotation: -8, svgOrigin: '120 181' }, { opacity: 1, rotation: 8, duration: 1.6, ease: 'sine.inOut' })
        .fromTo('#bx-sweepV', { y: 0, opacity: 1 }, { y: 420, duration: 0.9, ease: 'power2.inOut' }, 0)
        .fromTo('#bx-sweepH', { x: 0, opacity: 1 }, { x: 330, duration: 0.8, ease: 'power2.inOut' }, 0.55)
        .to('#bx-crossRays', { opacity: 0, duration: 0.7 }, 1.4);
    },
    medal() {
      G.timeline()
        .fromTo('#bx-medalFace', { scaleX: 1 }, { keyframes: { scaleX: [1, 0, -1, 0, 1] }, duration: 1.2, ease: 'sine.inOut', transformOrigin: '50% 50%' })
        .fromTo('#bx-medalRays', { opacity: 1, scale: 0.7, transformOrigin: '50% 50%' }, { opacity: 0, scale: 1.6, duration: 1.1, ease: 'power2.out' }, 0.2)
        .fromTo('#bx-medalHalo', { opacity: 0 }, { opacity: 1, duration: 0.4, yoyo: true, repeat: 1, repeatDelay: 0.6 }, 0)
        .fromTo('#bx-medalPos', { scale: 1 }, { scale: 1.15, duration: 0.5, yoyo: true, repeat: 1, repeatDelay: 0.4, ease: 'back.out(2)', transformOrigin: '50% 50%' }, 0);
    },
  };

  function activate(id) {
    const p = PARTS[id];
    if (!p) return clear();
    active = id;
    showCard(p);
    $$('#bxBadge .bx-part').forEach((n) => {
      const on = n.dataset.part === id;
      n.classList.toggle('is-on', on);
      if (on) n.removeAttribute('filter');
      else n.setAttribute('filter', 'url(#bx-mute)');
    });
    $$('.bx-chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.part === id)));
    drawMeasures(p.measures);
    if (!G) return;
    G.fromTo('#bxCard', { y: 10, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
    if (!reduce) ANIM[id]();
  }

  function clear() {
    active = null;
    $$('#bxBadge .bx-part').forEach((n) => { n.classList.remove('is-on'); n.removeAttribute('filter'); });
    $$('.bx-chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    drawMeasures(null);
    showCard(INTRO);
  }

  /* ---------------------------------------------------------------------
     One-time setup: generated art, events, timelines
  --------------------------------------------------------------------- */
  function generateArt() {
    const SC = 7, SW = 240 / SC;
    for (let i = 0; i < SC; i++) {
      svgEl('path', { class: 'bx-scallop', fill: '#ffdd1f', d: `M${i * SW} 454 A${SW / 2} ${SW / 2} 0 0 1 ${(i + 1) * SW} 454 Z` }, $('#bx-scallops'));
    }
    const FN = 13, FW = 240 / FN;
    for (let i = 0; i < FN; i++) {
      const g = svgEl('g', { class: 'bx-strand' }, $('#bx-fringe'));
      const r = svgEl('rect', { x: i * FW + 3, y: 478, width: FW - 6, height: 92, rx: 1.5, fill: '#ffdd1f', stroke: '#e2b80b', 'stroke-width': 0.8 }, g);
      strands.push({ g, r, cx: i * FW + FW / 2 });
    }
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      svgEl('line', { x1: 54 * Math.sin(a), y1: -54 * Math.cos(a), x2: 76 * Math.sin(a), y2: -76 * Math.cos(a), stroke: '#fff3b0', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, $('#bx-medalRays'));
    }
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12, a2 = a + 0.07;
      svgEl('polygon', { points: `120,181 ${120 + 260 * Math.sin(a)},${181 - 260 * Math.cos(a)} ${120 + 260 * Math.sin(a2)},${181 - 260 * Math.cos(a2)}`, fill: '#eafff0', opacity: 0.35 }, $('#bx-crossRays'));
    }
  }

  function bindEvents() {
    const badge = $('#bxBadge');
    const stage = $('#bxStage');
    const tilt = $('#bxTilt');

    $$('#bxBadge .bx-part').forEach((n) => {
      const id = n.dataset.part;
      // Hovering the badge art previews a part (mouse only); the chips need a click.
      n.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && active !== id) activate(id); });
      n.addEventListener('click', (e) => { e.stopPropagation(); activate(id); });
      n.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(id); }
      });
    });
    $$('.bx-chip').forEach((c) => {
      c.addEventListener('click', () => activate(c.dataset.part));
    });
    stage.addEventListener('click', (e) => { if (!e.target.closest('.bx-part')) clear(); });
    $('#bxReplay').addEventListener('click', () => { clear(); if (build) build.restart(); });

    // Fringe bends away from the pointer / finger like a brushing hand
    const toLocal = (e) => {
      const pt = badge.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(badge.getScreenCTM().inverse());
    };
    const frills = $('#bx-p-frills');
    frills.addEventListener('pointermove', (e) => {
      if (reduce || !G) return;
      const { x } = toLocal(e);
      strands.forEach((s) => {
        const dx = x - s.cx;
        const rot = 18 * Math.exp(-(dx * dx) / (2 * 26 * 26)) * Math.sign(dx || 1);
        G.to(s.r, { rotation: rot, duration: 0.25, transformOrigin: '50% 0%', ease: 'power2.out', overwrite: 'auto' });
      });
    });
    frills.addEventListener('pointerleave', () => {
      if (!G) return;
      G.to(strands.map((s) => s.r), { rotation: 0, duration: 1.4, ease: 'elastic.out(1, .3)', stagger: 0.02, overwrite: 'auto' });
    });

    // Gentle 3D tilt toward the mouse
    stage.addEventListener('pointermove', (e) => {
      if (reduce || !G || e.pointerType !== 'mouse') return;
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      G.to(tilt, { rotationY: px * 14, rotationX: -py * 10, duration: 0.6, ease: 'power2.out' });
    });
    stage.addEventListener('pointerleave', () => { if (G) G.to(tilt, { rotationY: 0, rotationX: 0, duration: 1, ease: 'power3.out' }); });
  }

  function buildTimelines() {
    if (!reduce) {
      idle = [
        ...strands.map((s, i) => G.to(s.g, { rotation: i % 2 ? 2.2 : -2.2, duration: 1.6 + (i % 4) * 0.25, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 0%', delay: i * 0.08, paused: true })),
        G.to('#bx-scallops', { scaleY: 1.06, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%', paused: true }),
        G.fromTo('#bx-shimmer', { y: 0 }, { y: 640, duration: 2.6, repeat: -1, repeatDelay: 3, ease: 'sine.inOut', paused: true }),
        G.fromTo('#bx-sheen', { x: 0 }, { x: 420, duration: 1.8, repeat: -1, repeatDelay: 4.5, ease: 'power1.inOut', delay: 1.5, paused: true }),
        G.fromTo('#bx-medalHalo', { opacity: 0 }, { opacity: 0.45, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 4.5, paused: true }),
      ];
    }

    build = G.timeline({ paused: true })
      .fromTo('#bx-ribbonBody', { scaleY: 0, svgOrigin: '120 0' }, { scaleY: 1, duration: 0.9, ease: 'power3.out' })
      .fromTo('.bx-scallop', { scale: 0, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.45, stagger: 0.05, ease: 'back.out(2.5)' }, 0.7)
      .fromTo(strands.map((s) => s.r), { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.6, stagger: 0.03, ease: 'bounce.out' }, 0.9)
      .fromTo('#bx-shieldOutline', { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 1.3)
      .fromTo('#bx-shieldFill', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.8)
      .to('#bx-shieldOutline', { opacity: 0, duration: 0.4 }, 2.2)
      .fromTo('#bx-crossV', { scaleY: 0, svgOrigin: '120 0' }, { scaleY: 1, duration: 0.6, ease: 'power2.out' }, 2.2)
      .fromTo('#bx-crossH', { scaleX: 0, svgOrigin: '120 181' }, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, 2.55)
      .fromTo('#bx-medalPos', { scale: 0, rotation: -200, transformOrigin: '50% 50%' }, { scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(1.6)' }, 2.9)
      .fromTo('#bx-medalRays', { opacity: 1, scale: 0.7, transformOrigin: '50% 50%' }, { opacity: 0, scale: 1.6, duration: 0.9, ease: 'power2.out' }, 3.5)
      .fromTo('.bx-measure .bx-m-line', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.15 }, 3.6)
      .fromTo('.bx-measure text', { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.15 }, 3.8);
  }

  function setup() {
    if (ready) return;
    ready = true;
    generateArt();
    bindEvents();
    showCard(INTRO);
  }

  /* ---------------------------------------------------------------------
     Public API for script.js
  --------------------------------------------------------------------- */
  function open() {
    isOpen = true;
    setup();
    clear();
    loadGsap()
      .then((gsap) => {
        if (!isOpen) return;
        if (!G) { G = gsap; buildTimelines(); }
        idle.forEach((t) => t.play());
        if (reduce) build.progress(1);
        else build.restart();
      })
      .catch(() => { /* Without GSAP the badge is still shown, fully built and tappable. */ });
  }

  function close() {
    isOpen = false;
    idle.forEach((t) => t.pause());
    if (G) G.killTweensOf('#bxCard');
  }

  window.CMLBadge = { open, close };
})();
