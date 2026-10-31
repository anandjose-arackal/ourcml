/* =========================================================================
   Cherupushpa Mission League — Audio Portal
   Vanilla JS: routing, player, visualizer, SEO, PWA registration.
   ========================================================================= */

(() => {
  'use strict';

  /* ---------------------------------------------------------------------
     CONFIG — customize IDs/flags here. Nothing loads unless ENABLE_* = true
     and the placeholder ID has been replaced (keeps first load fast).
  --------------------------------------------------------------------- */
  const CONFIG = {
    SITE_URL: 'https://ourcml.in',
    GA4_ID: 'G-XXXXXXXXXX',
    ENABLE_GA4: false,
    GTM_ID: 'GTM-XXXXXXX',
    ENABLE_GTM: false,
    CLARITY_ID: 'XXXXXXXXXX',
    ENABLE_CLARITY: false,
    ADSENSE_CLIENT: 'ca-pub-XXXXXXXXXXXXXXXX',
    ENABLE_ADSENSE: false, // AdSense is optional and OFF by default per spec
  };

  /* ---------------------------------------------------------------------
     DATA — single source of truth for the player + route SEO.
     Replace audioUrl / coverImage / transcript with real production assets.
     Keep `id` in sync with the static cards in index.html.
  --------------------------------------------------------------------- */
  const AUDIO_ITEMS = [
    {
      id: 'badge',
      path: '/badge',
      englishTitle: 'Badge',
      malayalamTitle: 'ബാഡ്ജ്',
      coverImage: 'https://lkeplxbdecciuwyawmwt.supabase.co/storage/v1/object/public/cml-audio/ourcml/badge.jpg',
      audioUrl: 'https://cml-hub.s3.ap-south-1.amazonaws.com/CML+badge.wav',
      // Shows the interactive badge (badge/badge.js) instead of the audio player.
      illustration: true,
      description: 'Explore the CML Badge — tap each part of the Cherupushpa Mission League badge to see its meaning and symbolism, in English and Malayalam.',
      transcript:
        'This is a placeholder transcript for the CML Badge audio. Replace this text with the actual narration script describing the meaning of the badge.\n\n' +
        'ഇത് CML ബാഡ്ജിന്റെ ട്രാൻസ്ക്രിപ്റ്റിന്റെ മാതൃകയാണ്. ബാഡ്ജിന്റെ അർത്ഥം വിവരിക്കുന്ന യഥാർത്ഥ ഉള്ളടക്കം ഇവിടെ ചേർക്കുക.',
    },
    {
      id: 'emblem',
      path: '/emblem',
      englishTitle: 'Emblem',
      malayalamTitle: 'എബ്ലം',
      coverImage: 'https://lkeplxbdecciuwyawmwt.supabase.co/storage/v1/object/public/cml-audio/ourcml/emblem.jpg',
      audioUrl: 'https://cml-hub.s3.ap-south-1.amazonaws.com/CML+emblem.wav',
      description: 'Listen to the official CML Emblem audio narration in English and Malayalam.',
      transcript:
        'This is a placeholder transcript for the CML Emblem audio. Replace this text with the actual narration script.\n\n' +
        'ഇത് CML എംബ്ലത്തിന്റെ ട്രാൻസ്ക്രിപ്റ്റിന്റെ മാതൃകയാണ്. യഥാർത്ഥ ഉള്ളടക്കം ഇവിടെ ചേർക്കുക.',
    },
    {
      id: 'flag',
      path: '/flag',
      englishTitle: 'Flag',
      malayalamTitle: 'പതാക',
      coverImage: 'https://lkeplxbdecciuwyawmwt.supabase.co/storage/v1/object/public/cml-audio/ourcml/flag.jpg',
      audioUrl: 'https://cml-hub.s3.ap-south-1.amazonaws.com/CML+Flag.wav',
      description: 'Listen to the official CML Flag audio narration in English and Malayalam.',
      transcript:
        'This is a placeholder transcript for the CML Flag audio. Replace this text with the actual narration script.\n\n' +
        'ഇത് CML പതാകയുടെ ട്രാൻസ്ക്രിപ്റ്റിന്റെ മാതൃകയാണ്. യഥാർത്ഥ ഉള്ളടക്കം ഇവിടെ ചേർക്കുക.',
    },
    {
      id: 'prayer',
      path: '/prayer',
      englishTitle: 'Daily Prayer',
      malayalamTitle: 'അനുദിന പ്രാർത്ഥന',
      coverImage: 'https://lkeplxbdecciuwyawmwt.supabase.co/storage/v1/object/public/cml-audio/ourcml/prayer.jpg',
      audioUrl: 'https://cml-hub.s3.ap-south-1.amazonaws.com/Daily+Prayer+CML+June+29.wav',
      description: 'Listen to the official CML Daily Prayer in English and Malayalam.',
      transcript:
        'This is a placeholder transcript for the CML Daily Prayer audio. Replace this text with the actual prayer text.\n\n' +
        'ഇത് CML അനുദിന പ്രാർത്ഥനയുടെ ട്രാൻസ്ക്രിപ്റ്റിന്റെ മാതൃകയാണ്. യഥാർത്ഥ പ്രാർത്ഥന ഇവിടെ ചേർക്കുക.',
    },
    {
      id: 'anthem',
      path: '/anthem',
      englishTitle: 'Anthem',
      malayalamTitle: 'ആന്തം',
      coverImage: 'https://lkeplxbdecciuwyawmwt.supabase.co/storage/v1/object/public/cml-audio/ourcml/thersa.jpg',
      audioUrl: 'https://cml-hub.s3.ap-south-1.amazonaws.com/cml+anthem.wav',
      description: 'Listen to the official CML Anthem in English and Malayalam.',
      transcript:
        'This is a placeholder transcript for the CML Anthem audio. Replace this text with the actual anthem lyrics.\n\n' +
        'ഇത് CML ആന്തത്തിന്റെ ട്രാൻസ്ക്രിപ്റ്റിന്റെ മാതൃകയാണ്. യഥാർത്ഥ വരികൾ ഇവിടെ ചേർക്കുക.',
    },
  ];

  const ITEMS_BY_PATH = new Map(AUDIO_ITEMS.map((item) => [item.path, item]));
  const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2, 0.75];

  /* ---------------------------------------------------------------------
     DOM refs
  --------------------------------------------------------------------- */
  const $ = (sel) => document.querySelector(sel);

  const homeView = $('#homeView');
  const playerView = $('#playerView');
  const playerBack = $('#playerBack');
  const playerCover = $('#playerCover');
  const playerTitleEn = $('#playerTitleEn');
  const playerTitleMl = $('#playerTitleMl');
  const badgeExplorer = $('#badgeExplorer');
  const audioEl = $('#audioEl');
  const seek = $('#seek');
  const currentTimeEl = $('#currentTime');
  const durationEl = $('#duration');
  const playPauseBtn = $('#playPauseBtn');
  const playPauseIcon = $('#playPauseIcon');
  const replayBtn = $('#replayBtn');
  const forwardBtn = $('#forwardBtn');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const speedBtn = $('#speedBtn');
  const transcriptBtn = $('#transcriptBtn');
  const transcriptSheet = $('#transcriptSheet');
  const transcriptContent = $('#transcriptContent');
  const closeTranscriptBtn = $('#closeTranscript');
  const sheetBackdrop = $('#sheetBackdrop');
  const visualizerCanvas = $('#visualizer');
  const structuredDataMount = $('#structuredDataMount');
  const progressRingFg = $('#progressRingFg');
  const soundToggleBtn = $('#soundToggleBtn');
  const soundToggleIcon = $('#soundToggleIcon');
  const shareBtn = $('#shareBtn');
  const playerShareBtn = $('#playerShareBtn');
  const menuBtn = $('#menuBtn');
  const navMenuPopover = $('#navMenuPopover');
  const volumeBtn = $('#volumeBtn');
  const volumeIcon = $('#volumeIcon');
  const volumeControl = $('#volumeControl');
  const volumeSlider = $('#volumeSlider');
  const carouselTrack = $('#carouselTrack');
  const carouselWrap = document.querySelector('.carousel-wrap');
  const carouselCards = Array.from(document.querySelectorAll('.carousel-card'));
  const carouselDotsWrap = $('#carouselDots');
  const carouselDots = Array.from(document.querySelectorAll('.carousel-dot'));
  const carouselPrevBtn = $('#carouselPrevBtn');
  const carouselNextBtn = $('#carouselNextBtn');
  const bgParticles = $('#bgParticles');

  const RING_CIRCUMFERENCE = 2 * Math.PI * 140;

  let currentItem = null;
  let lastFocusedEl = null;
  let rateIndex = 0;
  let isSeeking = false;
  let pendingHeroRect = null;
  let hasPainted = false;

  /* ---------------------------------------------------------------------
     ROUTER
  --------------------------------------------------------------------- */
  function normalizePath(pathname) {
    if (pathname.length > 1 && pathname.endsWith('/')) {
      return pathname.slice(0, -1);
    }
    return pathname || '/';
  }

  function handleLocation() {
    const path = normalizePath(location.pathname);
    if (path === '/') {
      closePlayer({ immediate: true });
      updateSEO(null);
      return;
    }

    const item = ITEMS_BY_PATH.get(path);
    if (item) {
      openPlayer(item);
      updateSEO(item);
    } else {
      // Invalid route -> redirect to home
      history.replaceState({}, '', '/');
      closePlayer({ immediate: true });
      updateSEO(null);
    }
  }

  function navigate(path, { replace = false } = {}) {
    if (normalizePath(location.pathname) === normalizePath(path)) {
      handleLocation();
      return;
    }
    if (replace) {
      history.replaceState({}, '', path);
    } else {
      history.pushState({}, '', path);
    }
    handleLocation();
  }

  function interceptInternalLinks() {
    document.body.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-route]');
      if (!link) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (carouselJustDragged) return; // swallow the synthetic click that follows a drag gesture

      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;

      // CoverFlow UX: tapping a non-centered card recenters it instead of opening it.
      const card = link.closest('.carousel-card');
      if (card) {
        const idx = Number(card.dataset.index);
        if (idx !== activeIndex) {
          e.preventDefault();
          goToIndex(idx);
          return;
        }
        pendingHeroRect = card.querySelector('.carousel-card-art img').getBoundingClientRect();
      }

      closeNavMenu();
      e.preventDefault();
      navigate(url.pathname);
    });

    window.addEventListener('popstate', handleLocation);
  }

  /* Recover the intended path after the GitHub-Pages-style 404 redirect
     trick (see 404.html) which stashes it in sessionStorage. */
  function recoverRedirectedPath() {
    // Try sessionStorage first (set by 404.html)
    let stashed = sessionStorage.getItem('cml-redirect-path');
    if (stashed) {
      sessionStorage.removeItem('cml-redirect-path');
    }
    // Fallback: check ?route= query param (more reliable across redirects)
    if (!stashed) {
      const params = new URLSearchParams(location.search);
      const route = params.get('route');
      if (route) stashed = route;
    }
    if (stashed && stashed !== '/') {
      history.replaceState({}, '', stashed);
    }
  }

  /* ---------------------------------------------------------------------
     3D COVERFLOW CAROUSEL — pure presentation layer over the same
     static, crawlable <a data-route> cards. Drag / wheel / keyboard / dots
     all funnel into goToIndex(); opening an item still goes through the
     existing navigate()/openPlayer() pipeline untouched.
  --------------------------------------------------------------------- */
  let activeIndex = 0;
  let dragPreviewOffset = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragMoved = false;
  let carouselJustDragged = false;
  let currentSpacing = 190;

  function computeSpacing() {
    if (!carouselWrap) return 220;
    const w = carouselWrap.getBoundingClientRect().width;
    return Math.max(110, Math.min(240, w * 0.28));
  }

  function layoutCarousel(previewOffset = 0) {
    currentSpacing = computeSpacing();
    carouselCards.forEach((card, i) => {
      const offset = i - activeIndex - previewOffset;
      const abs = Math.abs(offset);
      const clamped = Math.max(-4, Math.min(4, offset));
      const translateX = clamped * currentSpacing;
      const rotateY = clamped * -28;
      const depth = -Math.min(abs, 4) * 70;
      const scale = abs < 0.5 ? 1 : abs < 1.5 ? 0.82 : abs < 2.5 ? 0.66 : 0.52;
      const opacity = abs < 0.5 ? 1 : abs < 1.5 ? 0.55 : abs < 2.5 ? 0.25 : 0;
      const blur = abs < 0.5 ? 0 : abs < 1.5 ? 1.5 : 4;

      card.style.transform = `translate3d(${translateX}px, 0, ${depth}px) rotateY(${rotateY}deg) scale(${scale})`;
      card.style.opacity = String(opacity);
      card.style.filter = blur ? `blur(${blur}px)` : 'none';
      card.style.zIndex = String(200 - Math.round(abs * 10));
      card.style.pointerEvents = abs > 3 ? 'none' : 'auto';
      card.classList.toggle('is-active', abs < 0.5);
    });

    carouselDots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === activeIndex);
      dot.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
    });
  }

  function goToIndex(index) {
    activeIndex = Math.max(0, Math.min(AUDIO_ITEMS.length - 1, index));
    layoutCarousel(0);
  }

  function setActiveByItemId(id) {
    const idx = AUDIO_ITEMS.findIndex((item) => item.id === id);
    if (idx !== -1) {
      activeIndex = idx;
      layoutCarousel(0);
    }
  }

  function initCarouselInteractions() {
    if (!carouselTrack) return;

    let pendingPointerId = null;

    carouselTrack.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      isDragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      pendingPointerId = e.pointerId;
    });

    carouselTrack.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      if (!dragMoved && Math.abs(dx) > 6) {
        dragMoved = true;
        if (pendingPointerId != null) {
          carouselTrack.setPointerCapture(pendingPointerId);
          carouselTrack.classList.add('is-dragging');
        }
      }
      if (dragMoved) {
        dragPreviewOffset = dx / currentSpacing;
        layoutCarousel(dragPreviewOffset);
      }
    });

    function endDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      pendingPointerId = null;
      carouselTrack.classList.remove('is-dragging');
      const dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 40) {
        goToIndex(activeIndex - Math.sign(dx));
      } else {
        layoutCarousel(0);
      }
      if (dragMoved) {
        carouselJustDragged = true;
        window.setTimeout(() => {
          carouselJustDragged = false;
        }, 50);
      }
      dragPreviewOffset = 0;
    }

    carouselTrack.addEventListener('pointerup', endDrag);
    carouselTrack.addEventListener('pointercancel', endDrag);

    let wheelCooldown = false;
    carouselWrap.addEventListener(
      'wheel',
      (e) => {
        if (playerView.classList.contains('is-open')) return;
        if (Math.abs(e.deltaY) < 8 && Math.abs(e.deltaX) < 8) return;
        e.preventDefault();
        if (wheelCooldown) return;
        const dir = e.deltaY + e.deltaX > 0 ? 1 : -1;
        goToIndex(activeIndex + dir);
        wheelCooldown = true;
        window.setTimeout(() => {
          wheelCooldown = false;
        }, 380);
      },
      { passive: false }
    );

    carouselPrevBtn.addEventListener('click', () => goToIndex(activeIndex - 1));
    carouselNextBtn.addEventListener('click', () => goToIndex(activeIndex + 1));
    carouselDots.forEach((dot) => {
      dot.addEventListener('click', () => goToIndex(Number(dot.dataset.index)));
    });

    window.addEventListener('resize', () => {
      if (!playerView.classList.contains('is-open')) layoutCarousel(0);
    });
  }

  /* ---------------------------------------------------------------------
     HERO TRANSITION — lightweight FLIP animation between a carousel card's
     artwork and the fullscreen player's artwork. Additive visual polish
     only; falls back silently (no-op) for direct/QR loads with no card rect.
  --------------------------------------------------------------------- */
  function playHeroTransitionIn() {
    if (!pendingHeroRect) return;
    const fromRect = pendingHeroRect;
    pendingHeroRect = null;
    requestAnimationFrame(() => {
      const toRect = playerCover.getBoundingClientRect();
      const dx = fromRect.left + fromRect.width / 2 - (toRect.left + toRect.width / 2);
      const dy = fromRect.top + fromRect.height / 2 - (toRect.top + toRect.height / 2);
      const scale = fromRect.width / toRect.width;
      playerCover.style.transition = 'none';
      playerCover.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
      playerCover.style.opacity = '0.85';
      requestAnimationFrame(() => {
        playerCover.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease';
        playerCover.style.transform = '';
        playerCover.style.opacity = '';
      });
    });
  }

  function playHeroTransitionOut(item, fromRect) {
    if (!item) return;
    requestAnimationFrame(() => {
      const card = document.querySelector(`.carousel-card[data-id="${item.id}"] .carousel-card-art img`);
      if (!card) return;
      const toRect = card.getBoundingClientRect();
      const dx = fromRect.left + fromRect.width / 2 - (toRect.left + toRect.width / 2);
      const dy = fromRect.top + fromRect.height / 2 - (toRect.top + toRect.height / 2);
      const scale = fromRect.width / toRect.width;
      card.style.transition = 'none';
      card.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
      card.style.opacity = '0.85';
      requestAnimationFrame(() => {
        card.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease';
        card.style.transform = '';
        card.style.opacity = '';
      });
    });
  }

  /* ---------------------------------------------------------------------
     RIPPLE — small delegated micro-interaction for all .btn-ripple controls.
  --------------------------------------------------------------------- */
  function initRipples() {
    document.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('.btn-ripple');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  }

  /* ---------------------------------------------------------------------
     PARTICLES — decorative floating dots in the background layer.
  --------------------------------------------------------------------- */
  function initParticles() {
    if (!bgParticles) return;
    const count = window.innerWidth < 640 ? 14 : 24;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      const size = 2 + Math.random() * 4;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 80}px`);
      p.style.animationDuration = `${14 + Math.random() * 16}s`;
      p.style.animationDelay = `${Math.random() * -20}s`;
      bgParticles.appendChild(p);
    }
  }

  /* ---------------------------------------------------------------------
     NAV MENU (header + player "more" button share one popover)
  --------------------------------------------------------------------- */
  function openNavMenu(triggerBtn) {
    navMenuPopover.hidden = false;
    navMenuPopover.dataset.trigger = triggerBtn.id;
    triggerBtn.setAttribute('aria-expanded', 'true');
  }

  function closeNavMenu() {
    if (navMenuPopover.hidden) return;
    const triggerId = navMenuPopover.dataset.trigger;
    if (triggerId) {
      const trigger = document.getElementById(triggerId);
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }
    navMenuPopover.hidden = true;
  }

  function initNavMenu() {
    menuBtn.addEventListener('click', () => {
      if (navMenuPopover.hidden) openNavMenu(menuBtn);
      else closeNavMenu();
    });
    document.addEventListener('click', (e) => {
      if (navMenuPopover.hidden) return;
      if (e.target.closest('#navMenuPopover') || e.target.closest('#menuBtn')) return;
      closeNavMenu();
    });
  }

  /* ---------------------------------------------------------------------
     SOUND / VOLUME
  --------------------------------------------------------------------- */
  function initVolumeControls() {
    soundToggleBtn.addEventListener('click', () => {
      audioEl.muted = !audioEl.muted;
      syncSoundIcons();
    });

    volumeBtn.addEventListener('click', () => {
      const opening = !volumeControl.classList.contains('is-open');
      volumeControl.classList.toggle('is-open', opening);
      volumeBtn.setAttribute('aria-expanded', opening ? 'true' : 'false');
    });

    volumeSlider.addEventListener('input', () => {
      const v = Number(volumeSlider.value) / 100;
      audioEl.volume = v;
      audioEl.muted = v === 0;
      volumeSlider.style.setProperty('--vol-pct', `${volumeSlider.value}%`);
      syncSoundIcons();
    });

    document.addEventListener('click', (e) => {
      if (!volumeControl.classList.contains('is-open')) return;
      if (e.target.closest('#volumeControl')) return;
      volumeControl.classList.remove('is-open');
      volumeBtn.setAttribute('aria-expanded', 'false');
    });
  }

  function syncSoundIcons() {
    const muted = audioEl.muted || audioEl.volume === 0;
    const icon = muted ? 'volume_off' : audioEl.volume < 0.5 ? 'volume_down' : 'volume_up';
    soundToggleIcon.textContent = icon;
    volumeIcon.textContent = icon;
    soundToggleBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    soundToggleBtn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
  }

  /* ---------------------------------------------------------------------
     SHARE
  --------------------------------------------------------------------- */
  async function shareContent(title, text, url) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        return; // user cancelled — no fallback needed
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      /* Clipboard unavailable — silently ignore, share is a non-critical enhancement. */
    }
  }

  function initShare() {
    shareBtn.addEventListener('click', () => {
      shareContent('Cherupushpa Mission League', 'Listen to the CML audio portal', `${CONFIG.SITE_URL}/`);
    });
    playerShareBtn.addEventListener('click', () => {
      if (!currentItem) return;
      shareContent(
        `${currentItem.englishTitle} — Cherupushpa Mission League`,
        currentItem.description,
        `${CONFIG.SITE_URL}${currentItem.path}`
      );
    });
  }

  /* ---------------------------------------------------------------------
     PREV / NEXT TRACK
  --------------------------------------------------------------------- */
  function initPrevNext() {
    prevBtn.addEventListener('click', () => {
      if (!currentItem) return;
      const idx = AUDIO_ITEMS.findIndex((i) => i.id === currentItem.id);
      const prev = AUDIO_ITEMS[(idx - 1 + AUDIO_ITEMS.length) % AUDIO_ITEMS.length];
      navigate(prev.path);
    });
    nextBtn.addEventListener('click', () => {
      if (!currentItem) return;
      const idx = AUDIO_ITEMS.findIndex((i) => i.id === currentItem.id);
      const next = AUDIO_ITEMS[(idx + 1) % AUDIO_ITEMS.length];
      navigate(next.path);
    });
  }

  /* ---------------------------------------------------------------------
     SEO — per-route title/meta/canonical/OG/Twitter + JSON-LD
  --------------------------------------------------------------------- */
  function updateSEO(item) {
    const base = CONFIG.SITE_URL;
    const titleEn = item ? item.englishTitle : 'Home';
    const titleMl = item ? item.malayalamTitle : 'ചെറുപുഷ്പ മിഷൻ ലീഗ്';
    const title = item
      ? `${item.englishTitle} | ${item.malayalamTitle} — Cherupushpa Mission League`
      : 'Cherupushpa Mission League | ചെറുപുഷ്പ മിഷൻ ലീഗ്';
    const description = item
      ? item.description
      : 'Official audio portal of Cherupushpa Mission League (CML). Listen to the CML Badge, Emblem, Flag, Daily Prayer and Anthem in English and Malayalam.';
    const url = item ? `${base}${item.path}` : `${base}/`;
    const image = item ? item.coverImage : `${base}/icons/icon-512.svg`;
    const keywords = item
      ? `Cherupushpa Mission League, CML, ${item.englishTitle}, ${item.malayalamTitle}, CML ${item.englishTitle}`
      : 'Cherupushpa Mission League, CML, ചെറുപുഷ്പ മിഷൻ ലീഗ്, CML Badge, CML Emblem, CML Flag, CML Anthem, CML Prayer';

    document.title = title;
    setMeta('name', 'description', description, '#metaDescription');
    setMeta('name', 'keywords', keywords, '#metaKeywords');
    setLink('canonical', url, '#canonicalLink');

    setMeta('property', 'og:title', title, '#ogTitle');
    setMeta('property', 'og:description', description, '#ogDescription');
    setMeta('property', 'og:url', url, '#ogUrl');
    setMeta('property', 'og:image', image, '#ogImage');
    setMeta('property', 'og:type', item ? 'music.song' : 'website', '#ogType');

    setMeta('name', 'twitter:title', title, '#twitterTitle');
    setMeta('name', 'twitter:description', description, '#twitterDescription');
    setMeta('name', 'twitter:image', image, '#twitterImage');

    document.documentElement.lang = item ? 'en' : 'en';
    void titleEn;
    void titleMl;

    updateStructuredData(item, url);
  }

  function setMeta(attr, key, content, idSelector) {
    let el = idSelector ? document.querySelector(idSelector) : null;
    if (!el) {
      el = document.querySelector(`meta[${attr}="${key}"]`);
    }
    if (el) el.setAttribute('content', content);
  }

  function setLink(rel, href, idSelector) {
    let el = idSelector ? document.querySelector(idSelector) : null;
    if (!el) {
      el = document.querySelector(`link[rel="${rel}"]`);
    }
    if (el) el.setAttribute('href', href);
  }

  function updateStructuredData(item, url) {
    structuredDataMount.innerHTML = '';

    if (!item) return;

    const audioObject = document.createElement('script');
    audioObject.type = 'application/ld+json';
    audioObject.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      ...(item.illustration
        ? { '@type': 'ImageObject', contentUrl: item.coverImage }
        : { '@type': 'AudioObject', contentUrl: item.audioUrl, encodingFormat: 'audio/mpeg' }),
      name: `${item.englishTitle} — ${item.malayalamTitle}`,
      description: item.description,
      thumbnailUrl: item.coverImage,
      inLanguage: ['en', 'ml'],
      url,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Cherupushpa Mission League',
        url: `${CONFIG.SITE_URL}/`,
      },
    });
    structuredDataMount.appendChild(audioObject);

    const breadcrumb = document.createElement('script');
    breadcrumb.type = 'application/ld+json';
    breadcrumb.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${CONFIG.SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: item.englishTitle, item: url },
      ],
    });
    structuredDataMount.appendChild(breadcrumb);
  }

  /* ---------------------------------------------------------------------
     PLAYER
  --------------------------------------------------------------------- */
  function openPlayer(item) {
    currentItem = item;
    lastFocusedEl = document.activeElement;

    playerCover.src = item.coverImage;
    playerCover.alt = `${item.englishTitle} (${item.malayalamTitle}) cover art`;
    playerTitleEn.textContent = item.englishTitle;
    playerTitleMl.textContent = item.malayalamTitle;
    transcriptContent.textContent = item.transcript;

    const isIllustration = !!item.illustration;
    playerView.classList.toggle('is-illustration', isIllustration);
    badgeExplorer.hidden = !isIllustration;
    if (isIllustration) stopVisualizerLoop();

    // Lazy-load: only set src when the player actually opens.
    if (audioEl.dataset.loadedId !== item.id) {
      audioEl.pause();
      audioEl.src = item.audioUrl;
      audioEl.dataset.loadedId = item.id;
      audioEl.load();
      resetPlaybackUI();
    }

    rateIndex = 0;
    audioEl.playbackRate = PLAYBACK_RATES[rateIndex];
    speedBtn.textContent = `${PLAYBACK_RATES[rateIndex]}x`;

    setActiveByItemId(item.id);

    if (!hasPainted) {
      // First paint hasn't happened yet (direct URL like /flag).
      // Skip CSS transition — show player instantly.
      playerView.style.transition = 'none';
      playerView.classList.add('is-open');
      playerView.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { playerView.style.transition = ''; });
      });
    } else {
      playerView.classList.add('is-open');
      playerView.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    if (isIllustration) {
      if (window.CMLBadge) window.CMLBadge.open();
      // Narration plays behind the illustration. Browsers may block this on a
      // direct page load with no tap yet; the play button is still there then.
      if (audioEl.paused) togglePlayPause();
    } else {
      if (window.CMLBadge) window.CMLBadge.close();
      initVisualizer();
      playHeroTransitionIn();
    }
    playerBack.focus();
  }

  function closePlayer({ immediate = false } = {}) {
    playerView.classList.remove('is-open');
    playerView.classList.remove('is-playing');
    playerView.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    closeTranscript();
    volumeControl.classList.remove('is-open');
    closeNavMenu();

    audioEl.pause();
    stopVisualizerLoop();
    if (window.CMLBadge) window.CMLBadge.close();

    if (!immediate && lastFocusedEl && document.contains(lastFocusedEl)) {
      lastFocusedEl.focus();
    }
    currentItem = null;
  }

  function resetPlaybackUI() {
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';
    seek.value = 0;
    seek.style.setProperty('--seek-pct', '0%');
    progressRingFg.style.strokeDashoffset = String(RING_CIRCUMFERENCE);
    setPlayingIcon(false);
  }

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  }

  function setPlayingIcon(isPlaying) {
    playPauseIcon.textContent = isPlaying ? 'pause' : 'play_arrow';
    playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  }

  function togglePlayPause() {
    if (audioEl.paused) {
      ensureAudioContext();
      audioEl.play().catch(() => {
        /* Autoplay/network errors are surfaced via the native `error` event handled below. */
      });
    } else {
      audioEl.pause();
    }
  }

  playPauseBtn.addEventListener('click', togglePlayPause);
  replayBtn.addEventListener('click', () => {
    audioEl.currentTime = Math.max(0, audioEl.currentTime - 10);
  });
  forwardBtn.addEventListener('click', () => {
    audioEl.currentTime = Math.min(audioEl.duration || Infinity, audioEl.currentTime + 10);
  });
  speedBtn.addEventListener('click', () => {
    rateIndex = (rateIndex + 1) % PLAYBACK_RATES.length;
    const rate = PLAYBACK_RATES[rateIndex];
    audioEl.playbackRate = rate;
    speedBtn.textContent = `${rate}x`;
    speedBtn.setAttribute('aria-label', `Change playback speed, currently ${rate} times`);
  });

  function updateProgressRing(pct01) {
    progressRingFg.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - pct01));
  }

  audioEl.addEventListener('play', () => {
    setPlayingIcon(true);
    playerView.classList.add('is-playing');
    startVisualizerLoop();
  });
  audioEl.addEventListener('pause', () => {
    setPlayingIcon(false);
    playerView.classList.remove('is-playing');
    stopVisualizerLoop();
  });
  audioEl.addEventListener('ended', () => {
    setPlayingIcon(false);
    playerView.classList.remove('is-playing');
    stopVisualizerLoop();
  });
  audioEl.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audioEl.duration);
  });
  audioEl.addEventListener('timeupdate', () => {
    if (isSeeking) return;
    currentTimeEl.textContent = formatTime(audioEl.currentTime);
    if (audioEl.duration) {
      const pct = audioEl.currentTime / audioEl.duration;
      seek.value = pct * 1000;
      seek.style.setProperty('--seek-pct', `${pct * 100}%`);
      updateProgressRing(pct);
    }
  });

  seek.addEventListener('input', () => {
    isSeeking = true;
    if (audioEl.duration) {
      const pct = Number(seek.value) / 1000;
      currentTimeEl.textContent = formatTime(pct * audioEl.duration);
      seek.style.setProperty('--seek-pct', `${pct * 100}%`);
      updateProgressRing(pct);
    }
  });
  seek.addEventListener('change', () => {
    if (audioEl.duration) {
      audioEl.currentTime = (Number(seek.value) / 1000) * audioEl.duration;
    }
    isSeeking = false;
  });

  playerBack.addEventListener('click', () => {
    const item = currentItem;
    const fromRect = item && !item.illustration ? playerCover.getBoundingClientRect() : null;
    navigate('/');
    if (item && fromRect) playHeroTransitionOut(item, fromRect);
  });

  /* ---------------------------------------------------------------------
     TRANSCRIPT BOTTOM SHEET
  --------------------------------------------------------------------- */
  function openTranscript() {
    transcriptSheet.hidden = false;
    sheetBackdrop.hidden = false;
    requestAnimationFrame(() => {
      transcriptSheet.classList.add('is-open');
      sheetBackdrop.classList.add('is-open');
    });
    transcriptBtn.setAttribute('aria-expanded', 'true');
    closeTranscriptBtn.focus();
  }

  function closeTranscript() {
    transcriptSheet.classList.remove('is-open');
    sheetBackdrop.classList.remove('is-open');
    transcriptBtn.setAttribute('aria-expanded', 'false');
    window.setTimeout(() => {
      if (!transcriptSheet.classList.contains('is-open')) {
        transcriptSheet.hidden = true;
        sheetBackdrop.hidden = true;
      }
    }, 400);
  }

  transcriptBtn.addEventListener('click', () => {
    if (transcriptSheet.classList.contains('is-open')) {
      closeTranscript();
    } else {
      openTranscript();
    }
  });
  closeTranscriptBtn.addEventListener('click', closeTranscript);
  sheetBackdrop.addEventListener('click', closeTranscript);

  /* ---------------------------------------------------------------------
     KEYBOARD
  --------------------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (transcriptSheet.classList.contains('is-open')) {
        closeTranscript();
      } else if (!navMenuPopover.hidden) {
        closeNavMenu();
      } else if (playerView.classList.contains('is-open')) {
        playerBack.click();
      }
      return;
    }

    if (playerView.classList.contains('is-open')) return;
    if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToIndex(activeIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToIndex(activeIndex - 1);
    }
  });

  /* ---------------------------------------------------------------------
     VISUALIZER — real Web Audio analysis with a graceful pseudo fallback
     for cross-origin audio without CORS headers (getByteFrequencyData
     returns all-zero data in that case; we detect and switch modes).
  --------------------------------------------------------------------- */
  let audioCtx = null;
  let analyser = null;
  let sourceNode = null;
  let freqData = null;
  let rafId = null;
  let usePseudoVisualizer = false;
  let silentFrameCount = 0;
  const BAR_COUNT = 40;

  function ensureAudioContext() {
    if (audioCtx) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return;
    }
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      freqData = new Uint8Array(analyser.frequencyBinCount);
      sourceNode = audioCtx.createMediaElementSource(audioEl);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (err) {
      usePseudoVisualizer = true;
    }
  }

  function initVisualizer() {
    const dpr = window.devicePixelRatio || 1;
    const rect = visualizerCanvas.getBoundingClientRect();
    visualizerCanvas.width = Math.max(1, rect.width * dpr);
    visualizerCanvas.height = Math.max(1, rect.height * dpr);
  }

  function startVisualizerLoop() {
    if (rafId) return;
    silentFrameCount = 0;
    const ctx = visualizerCanvas.getContext('2d');

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      const { width, height } = visualizerCanvas;
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);

      const bars = getBarHeights();
      const gap = width / BAR_COUNT;
      const barWidth = gap * 0.55;
      const midY = height / 2;

      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(0.5, '#3b82f6');
      gradient.addColorStop(1, '#ec4899');

      ctx.shadowColor = 'rgba(139, 92, 246, 0.65)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = gradient;

      for (let i = 0; i < BAR_COUNT; i++) {
        const value = bars[i];
        const barHeight = Math.max(3, value * height * 0.9);
        const x = i * gap + (gap - barWidth) / 2;
        const y = midY - barHeight / 2;
        const r = Math.min(barWidth / 2, 4);
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, r);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    draw();
  }

  function stopVisualizerLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function getBarHeights() {
    if (!usePseudoVisualizer && analyser && freqData) {
      analyser.getByteFrequencyData(freqData);
      let sum = 0;
      const bars = new Array(BAR_COUNT);
      const step = Math.floor(freqData.length / BAR_COUNT) || 1;
      for (let i = 0; i < BAR_COUNT; i++) {
        const v = freqData[i * step] / 255;
        bars[i] = v;
        sum += v;
      }
      if (sum < 0.02) {
        silentFrameCount++;
        if (silentFrameCount > 90) usePseudoVisualizer = true; // ~1.5s of silence -> likely CORS-tainted
      } else {
        silentFrameCount = 0;
        return bars;
      }
    }

    // Pseudo fallback: smooth sine-based animation, still reacts to play position.
    const t = audioEl.currentTime || performance.now() / 1000;
    const bars = new Array(BAR_COUNT);
    for (let i = 0; i < BAR_COUNT; i++) {
      bars[i] = 0.35 + 0.35 * Math.abs(Math.sin(t * 2.4 + i * 0.5)) + 0.15 * Math.abs(Math.sin(t * 5 + i));
    }
    return bars;
  }

  window.addEventListener('resize', () => {
    if (playerView.classList.contains('is-open')) initVisualizer();
  });

  /* ---------------------------------------------------------------------
     PWA — service worker registration
  --------------------------------------------------------------------- */
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(() => {
          /* Non-fatal: app still works fully online without the SW. */
        });
      });
    }
  }

  /* ---------------------------------------------------------------------
     ANALYTICS — loaded only when explicitly enabled with a real ID.
  --------------------------------------------------------------------- */
  function loadAnalytics() {
    if (CONFIG.ENABLE_GA4 && CONFIG.GA4_ID && !CONFIG.GA4_ID.includes('XXXX')) {
      const s1 = document.createElement('script');
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA4_ID}`;
      document.head.appendChild(s1);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', CONFIG.GA4_ID);
    }

    if (CONFIG.ENABLE_GTM && CONFIG.GTM_ID && !CONFIG.GTM_ID.includes('XXXX')) {
      const s = document.createElement('script');
      s.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${CONFIG.GTM_ID}');`;
      document.head.appendChild(s);
    }

    if (CONFIG.ENABLE_CLARITY && CONFIG.CLARITY_ID && !CONFIG.CLARITY_ID.includes('XXXX')) {
      const s = document.createElement('script');
      s.textContent = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${CONFIG.CLARITY_ID}");`;
      document.head.appendChild(s);
    }

    if (CONFIG.ENABLE_ADSENSE && CONFIG.ADSENSE_CLIENT && !CONFIG.ADSENSE_CLIENT.includes('XXXX')) {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CONFIG.ADSENSE_CLIENT}`;
      s.crossOrigin = 'anonymous';
      document.head.appendChild(s);
    }
  }

  /* ---------------------------------------------------------------------
     INIT
  --------------------------------------------------------------------- */
  function init() {
    $('#year').textContent = new Date().getFullYear();
    recoverRedirectedPath();
    interceptInternalLinks();
    initCarouselInteractions();
    layoutCarousel(0);
    initRipples();
    initParticles();
    initNavMenu();
    initVolumeControls();
    initShare();
    initPrevNext();
    syncSoundIcons();
    handleLocation();
    requestAnimationFrame(() => { hasPainted = true; });
    registerServiceWorker();
    loadAnalytics();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
