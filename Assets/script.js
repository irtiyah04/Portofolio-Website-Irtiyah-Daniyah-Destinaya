/* ═══════════════════════════════════════════════════════════════════
   IRTIYAH DANIYAH DESTINAYA — Portfolio Script
   ─────────────────────────────────────────────────────────────────
   01. Navbar         : scroll shadow · active link · hamburger
   02. Scroll Reveal  : IntersectionObserver with stagger
   03. Scrollspy      : active nav highlight
   04. Scroll Progress: top bar fill
   05. Stat Counter   : animated numbers
   06. Custom Cursor  : dot + ring with hover states
   07. Particles      : floating hero background
   08. Typing Effect  : cycling tagline
   09. Magnetic Btns  : subtle follow-cursor
   10. Ripple Effect  : click splash on buttons
   11. Card Tilt 3D   : perspective tilt on hover
   12. Skill Stagger  : tags reveal in sequence
   13. Timeline Fade  : items slide in on scroll
   14. Section Title  : animated underline on enter
   15. PDF Carousel   : mixed-media slider (img/video/pdf)
   16. PDF.js Thumb   : render first page as thumbnail
   17. PDF Viewer     : modal iframe viewer
   18. Image Lightbox : zoom + pan + keyboard nav
   19. Project Filter : filter grid with animation
   20. Cert Filter    : certificate category filter
   21. Back to Top    : floating scroll-to-top button
   22. Copy Contact   : click-to-copy email/phone with toast
═══════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function onReady(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

/* ─────────────────────────────────────────────
   01. NAVBAR
───────────────────────────────────────────── */
function initNavbar() {
  const navbar    = $('#navbar');
  const navLinks  = $('#navLinks');
  const hamburger = $('#hamburger');
  if (!navbar) return;

  // Scroll shadow
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  // Hamburger toggle
  hamburger?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    const [s0, s1, s2] = hamburger.querySelectorAll('span');
    if (s0) s0.style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)'   : '';
    if (s1) s1.style.opacity   = isOpen ? '0' : '1';
    if (s2) s2.style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
  });

  // Close on link click
  $$('a', navLinks).forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger?.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity   = '1';
      });
    });
  });
}

/* ─────────────────────────────────────────────
   02. SCROLL REVEAL
───────────────────────────────────────────── */
function initScrollReveal() {
  const els = $$('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = $$('.reveal, .reveal-left, .reveal-right', entry.target.parentElement);
      const i = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${i * 90}ms`;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────────
   03. SCROLLSPY — active nav link
───────────────────────────────────────────── */
function initScrollspy() {
  const sections  = $$('section[id]');
  const anchors   = $$('.nav-links a');
  if (!sections.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      anchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    });
  }, { threshold: 0.35 });

  sections.forEach(s => obs.observe(s));
}

/* ─────────────────────────────────────────────
   04. SCROLL PROGRESS BAR
───────────────────────────────────────────── */
function initScrollProgress() {
  const bar = $('#scrollProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    const pct = (window.scrollY / (doc.scrollHeight - doc.clientHeight)) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   05. STAT COUNTER ANIMATION
───────────────────────────────────────────── */
function initStatCounters() {
  const cards = [...document.querySelectorAll('#aboutStats .stat-card')];
  if (!cards.length) return;

  // Parse each card's config
  const configs = cards.map((card, i) => ({
    card,
    el:      document.getElementById(`statNum${i}`),
    final:   parseFloat(card.dataset.final),
    dec:     parseInt(card.dataset.decimal ?? '0'),
    suffix:  card.dataset.suffix ?? '',
    min:     parseFloat(card.dataset.min   ?? '0'),
    max:     parseFloat(card.dataset.max   ?? '100'),
    settled: false,
  }));

  // ── Shuffle: show random values while page is being scrolled ──
  let shuffleRaf = null;
  let isAboutVisible = false;

  function randomVal(cfg) {
    const r = cfg.min + Math.random() * (cfg.max - cfg.min);
    return r.toFixed(cfg.dec) + cfg.suffix;
  }

  function startShuffle() {
    if (shuffleRaf) return;

    function frame() {
      configs.forEach(cfg => {
        if (cfg.settled) return;
        cfg.el.textContent = randomVal(cfg);
        cfg.card.classList.add('is-counting');
        cfg.card.classList.remove('is-settled');
      });
      shuffleRaf = requestAnimationFrame(frame);
    }
    shuffleRaf = requestAnimationFrame(frame);
  }

  function stopShuffle() {
    if (shuffleRaf) { cancelAnimationFrame(shuffleRaf); shuffleRaf = null; }
  }

  // ── Settle: animate from current displayed value to final ──
  function settle(cfg) {
    if (cfg.settled) return;
    cfg.settled = true;
    cfg.card.classList.remove('is-counting');
    cfg.card.classList.add('is-settled');

    const start   = parseFloat(cfg.el.textContent) || 0;
    const target  = cfg.final;
    const dur     = 1400;
    let   t0      = null;

    function step(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const e = 1 - (1 - p) ** 4;   // ease-out-quart — snappy then smooth land
      cfg.el.textContent = (start + (target - start) * e).toFixed(cfg.dec) + cfg.suffix;
      if (p < 1) requestAnimationFrame(step);
      else cfg.el.textContent = target.toFixed(cfg.dec) + cfg.suffix;
    }
    requestAnimationFrame(step);
  }

  // ── Observe the About section ──
  const aboutSection = document.getElementById('about');
  if (!aboutSection) return;

  const sectionObs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      // About is visible — stop shuffle, settle all cards with stagger
      isAboutVisible = true;
      stopShuffle();
      configs.forEach((cfg, i) => {
        setTimeout(() => settle(cfg), i * 180);
      });
    } else {
      // Scrolled away — reset unsettled cards, restart shuffle
      isAboutVisible = false;
      if (!configs.every(c => c.settled)) startShuffle();
    }
  }, { threshold: 0.3 });

  sectionObs.observe(aboutSection);

  // ── Start shuffle immediately on any scroll (before About is reached) ──
  let scrolling = false;
  let scrollTimer = null;

  window.addEventListener('scroll', () => {
    if (isAboutVisible || configs.every(c => c.settled)) return;
    scrolling = true;
    startShuffle();
    clearTimeout(scrollTimer);
    // Pause shuffle briefly when user stops scrolling
    scrollTimer = setTimeout(() => { stopShuffle(); }, 320);
  }, { passive: true });

  // Initial state: show zeroes, wait for scroll / viewport
  configs.forEach(cfg => {
    cfg.el.textContent = cfg.final.toFixed(cfg.dec) + cfg.suffix;
    cfg.el.textContent = (0).toFixed(cfg.dec) + cfg.suffix;
  });
}

/* ─────────────────────────────────────────────
   06. CUSTOM CURSOR
───────────────────────────────────────────── */
function initCursor() {
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;

  // Disable on touch devices
  if (window.matchMedia('(pointer:coarse)').matches) {
    dot.style.display = ring.style.display = 'none';
    return;
  }

  let mx = -200, my = -200, rx = -200, ry = -200;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
  }, { passive: true });

  (function loop() {
    dot.style.transform  = `translate(${mx}px,${my}px)`;
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  })();

  const HOVER_SEL = 'a, button, .proj-card, .cert-card, .stat-card, .timeline-card, .vol-card, .edu-card, .tag, .btn-primary, .btn-outline, [role="button"]';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(HOVER_SEL)) {
      ring.classList.add('cursor-hover');
      dot.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(HOVER_SEL)) {
      ring.classList.remove('cursor-hover');
      dot.classList.remove('cursor-hover');
    }
  });
  document.addEventListener('mousedown', () => ring.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => ring.classList.remove('cursor-click'));
}

/* ─────────────────────────────────────────────
   07. HERO FLOATING PARTICLES
───────────────────────────────────────────── */
function initParticles() {
  const canvas = $('#heroParticles');
  if (!canvas) return;

  // Skip on low-power devices
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let W, H, pts = [];
  let running = true;
  let rafId = null;

  function resize() {
    const hero = $('#hero');
    if (!hero) return;
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  function mkPt() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  Math.random() * 2.2 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: -(Math.random() * 0.55 + 0.15),
      a:  Math.random() * 0.45 + 0.1,
    };
  }

  resize();
  for (let i = 0; i < 65; i++) pts.push(mkPt());
  window.addEventListener('resize', resize, { passive: true });

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(124,111,205,${p.a})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.y < -8 || p.x < -8 || p.x > W + 8) {
        Object.assign(p, mkPt());
        p.y = H + 5;
      }
    });
    rafId = requestAnimationFrame(draw);
  }
  rafId = requestAnimationFrame(draw);

  // Pause the redraw loop entirely once Hero leaves the viewport —
  // it was previously running forever in the background, wasting
  // CPU/battery on every scroll position.
  const hero = $('#hero');
  if (hero) {
    const heroObs = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running && !rafId) rafId = requestAnimationFrame(draw);
    }, { threshold: 0 });
    heroObs.observe(hero);
  }
}

/* ─────────────────────────────────────────────
   08. TYPING EFFECT
───────────────────────────────────────────── */
function initTyping() {
  const el = $('#typingText');
  if (!el) return;

  const lines = [
    'Information Systems Graduate',
    'Business Operations',
    'Digital Solutions',
    'Project Coordination',
    'Technology Enthusiast',
  ];

  let li = 0, ci = 0, deleting = false;
  const T_TYPE = 62, T_DEL = 32, T_PAUSE = 2200;

  function tick() {
    const cur = lines[li];
    if (!deleting) {
      ci++;
      el.textContent = cur.slice(0, ci);
      if (ci === cur.length) { deleting = true; setTimeout(tick, T_PAUSE); return; }
    } else {
      ci--;
      el.textContent = cur.slice(0, ci);
      if (ci === 0) { deleting = false; li = (li + 1) % lines.length; }
    }
    setTimeout(tick, deleting ? T_DEL : T_TYPE);
  }
  setTimeout(tick, 1000);
}

/* ─────────────────────────────────────────────
   09. MAGNETIC BUTTONS
───────────────────────────────────────────── */
function initMagnetic() {
  $$('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.28;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.28;
      btn.style.transform = `translate(${dx}px,${dy}px) scale(1.04)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ─────────────────────────────────────────────
   10. RIPPLE EFFECT
───────────────────────────────────────────── */
function initRipple() {
  const SEL = '.btn-primary, .btn-outline, .btn-ghost, .cert-filter, .proj-filter, .nav-links a';
  document.addEventListener('click', e => {
    const el = e.target.closest(SEL);
    if (!el) return;

    el.querySelector('.ripple')?.remove();
    const r    = el.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-r.left-size/2}px;top:${e.clientY-r.top-size/2}px;`;
    el.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  });
}

/* ─────────────────────────────────────────────
   11. CARD 3D TILT
───────────────────────────────────────────── */
function initTilt() {
  const TILT = 7;
  $$('.stat-card, .edu-card, .cert-card, .vol-card, .proj-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${-y*TILT}deg) rotateY(${x*TILT}deg) translateY(-5px) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ─────────────────────────────────────────────
   12. SKILL TAGS STAGGER REVEAL
───────────────────────────────────────────── */
function initSkillStagger() {
  $$('.skill-tags').forEach(group => {
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      $$('.tag', group).forEach((tag, i) => {
        tag.style.transitionDelay = `${i * 55}ms`;
        tag.classList.add('tag-revealed');
      });
    }, { threshold: 0.2 });
    obs.observe(group);
  });
}

/* ─────────────────────────────────────────────
   13. TIMELINE STAGGER
───────────────────────────────────────────── */
function initTimelineReveal() {
  $$('.timeline-item').forEach((item, i) => {
    item.style.transitionDelay = `${i * 110}ms`;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      item.classList.add('tl-visible');
    }, { threshold: 0.12 });
    obs.observe(item);
  });
}

/* ─────────────────────────────────────────────
   14. SECTION TITLE UNDERLINE
───────────────────────────────────────────── */
function initTitleUnderline() {
  $$('.section-title').forEach(title => {
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      title.classList.add('title-visible');
    }, { threshold: 0.5 });
    obs.observe(title);
  });
}

/* ─────────────────────────────────────────────
   13b. TIMELINE PROGRESS LINE (Professional Journey)
───────────────────────────────────────────── */
function initTimelineProgress() {
  const track = $('#timelineFill');
  const timeline = $('.timeline');
  const items = $$('.timeline-item');
  if (!track || !timeline || !items.length) return;

  function updateFill() {
    const rect = timeline.getBoundingClientRect();
    const vh   = window.innerHeight;
    // Progress from when timeline top enters bottom of viewport
    // to when timeline bottom reaches the middle of viewport
    const total  = rect.height + vh * 0.5;
    const passed = Math.min(Math.max(vh * 0.85 - rect.top, 0), total);
    const pct    = Math.min((passed / total) * 100, 100);
    track.style.height = pct + '%';
  }

  window.addEventListener('scroll', updateFill, { passive: true });
  window.addEventListener('resize', updateFill);
  updateFill();

  // Highlight each node dot as its row enters view
  items.forEach(item => {
    const obs = new IntersectionObserver(([entry]) => {
      item.classList.toggle('tl-active', entry.isIntersecting);
    }, { threshold: 0.4 });
    obs.observe(item);
  });
}

/* ─────────────────────────────────────────────
   13c. EDUCATION CARD CHECKLIST REVEAL (Academic Background)
───────────────────────────────────────────── */
function initEduBulletStagger() {
  $$('.edu-card').forEach(card => {
    const bullets = $$('.timeline-bullets li', card);
    if (!bullets.length) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      bullets.forEach((li, i) => {
        setTimeout(() => li.classList.add('bullet-in'), i * 130);
      });
    }, { threshold: 0.3 });
    obs.observe(card);
  });
}

/* ─────────────────────────────────────────────
   13d. SKILLS COUNT BADGES (Skills)
───────────────────────────────────────────── */
function initSkillsCounter() {
  const els = $$('.skills-count');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10) || 0;
      const dur    = 900;
      let   start  = null;

      function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round(p * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });

  els.forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────────
   15. MIXED-MEDIA CAROUSEL (img / video / pdf)
───────────────────────────────────────────── */
function initCarousels() {
  $$('.proj-thumb').forEach(thumb => {
    const slider  = $('.proj-slider', thumb);
    const track   = $('.proj-slides', thumb);
    const slides  = $$('.proj-slide', thumb);
    const dotsWrap = $('.proj-dots', thumb);
    const prev    = $('.proj-arrow.prev', thumb);
    const next    = $('.proj-arrow.next', thumb);
    if (!track || !slides.length) return;

    let idx = 0;
    const total = slides.length;

    // Build dots
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'proj-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Slide ${i + 1}`);
      d.addEventListener('click', e => { e.stopPropagation(); goTo(i); });
      dotsWrap?.appendChild(d);
    });

    if (total <= 1) {
      prev && (prev.style.display = 'none');
      next && (next.style.display = 'none');
    }

    function pauseVideos() {
      slides.forEach(s => s.querySelector('video')?.pause());
    }

    function goTo(i) {
      pauseVideos();
      idx = (i + total) % total;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dotsWrap && $$('.proj-dot', dotsWrap).forEach((d, j) =>
        d.classList.toggle('active', j === idx));
      // Render PDF thumbnail if first time
      const slide = slides[idx];
      if (slide?.dataset.type === 'pdf') {
        const canvas = slide.querySelector('.pdf-canvas');
        if (canvas && !canvas.dataset.rendered) {
          canvas.dataset.rendered = '1';
          renderPdfThumbnail(slide, canvas, slide.dataset.src);
        }
      }
    }

    prev?.addEventListener('click', e => { e.stopPropagation(); goTo(idx - 1); });
    next?.addEventListener('click', e => { e.stopPropagation(); goTo(idx + 1); });

    // Touch swipe
    let tx = 0;
    thumb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    thumb.addEventListener('touchend',   e => {
      const diff = e.changedTouches[0].clientX - tx;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? idx - 1 : idx + 1);
    });

    // Click opens viewer
    track.addEventListener('click', e => {
      if (e.target.closest('.proj-arrow, .proj-dot')) return;
      const slide = slides[idx];
      const type  = slide?.dataset.type;
      const src   = slide?.dataset.src;
      const title = $('.proj-title, .cert-title', thumb.closest('.proj-card, .cert-card'))?.textContent || '';
      if (type === 'pdf')   openPdfViewer(src, title);
      else if (type === 'video') openVideoViewer(src, title);
      else if (type === 'img')   openImgLightbox(thumb.closest('.proj-card, .cert-card'), idx);
    });

    // Render first slide PDF if applicable
    goTo(0);
  });
}

/* ─────────────────────────────────────────────
   16. PDF.js THUMBNAIL RENDERER
───────────────────────────────────────────── */
const PDFJS_CDN    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
let pdfjsLib       = null;
const pdfJsQueue   = [];
let pdfJsLoading   = false;

function loadPdfJs(cb) {
  if (pdfjsLib) { cb(); return; }
  pdfJsQueue.push(cb);
  if (pdfJsLoading) return;
  pdfJsLoading = true;
  const s = document.createElement('script');
  s.src = PDFJS_CDN;
  s.onload = () => {
    pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    pdfJsQueue.splice(0).forEach(fn => fn());
  };
  document.head.appendChild(s);
}

function renderPdfThumbnail(slide, canvas, url) {
  if (!url) return;

  // If a pre-made thumbnail image exists, prefer it
  const thumbUrl = slide.dataset.thumb;
  if (thumbUrl) {
    const img = document.createElement('img');
    img.alt = 'PDF preview';
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;z-index:1;background:#fff;';
    img.onerror = () => { img.remove(); renderViaPdfJs(slide, canvas, url); };
    img.src = thumbUrl;
    slide.insertBefore(img, canvas);
    canvas.style.display = 'none';
    return;
  }
  renderViaPdfJs(slide, canvas, url);
}

function renderViaPdfJs(slide, canvas, url) {
  slide.classList.add('pdf-loading');

  loadPdfJs(() => {
    pdfjsLib.getDocument({
      url,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
    }).promise
      .then(doc => doc.getPage(1))
      .then(page => {
        function doRender() {
          const thumb = slide.closest('.proj-thumb') || slide;
          const cW = thumb.clientWidth  || 360;
          const cH = thumb.clientHeight || 240;
          const vp0   = page.getViewport({ scale: 1 });
          const scale = Math.min(cW / vp0.width, cH / vp0.height) * 0.96;
          const vp    = page.getViewport({ scale });
          const dpr   = Math.min(window.devicePixelRatio || 1, 2);

          canvas.width  = Math.round(vp.width  * dpr);
          canvas.height = Math.round(vp.height * dpr);
          canvas.style.width  = Math.round(vp.width)  + 'px';
          canvas.style.height = Math.round(vp.height) + 'px';
          canvas.style.display = 'block';

          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.scale(dpr, dpr);

          page.render({ canvasContext: ctx, viewport: vp, intent: 'display' })
            .promise.then(() => slide.classList.remove('pdf-loading'))
            .catch(() => {});
        }

        const containerWidth = (slide.closest('.proj-thumb') || slide).clientWidth;
        if (containerWidth === 0) requestAnimationFrame(() => requestAnimationFrame(doRender));
        else doRender();
      })
      .catch(() => {
        slide.classList.remove('pdf-loading');
        slide.classList.add('pdf-error');
      });
  });
}

/* ─────────────────────────────────────────────
   17. PDF VIEWER MODAL
───────────────────────────────────────────── */
function openPdfViewer(src, title) {
  if (!src) return;
  const overlay = buildViewerModal('pdf', title, src);
  const body    = $('.viewer-body', overlay);
  const iframe  = document.createElement('iframe');
  iframe.src    = src;
  iframe.title  = title;
  iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
  body.appendChild(iframe);
  const tabLink = $('.viewer-newtab', overlay);
  if (tabLink) tabLink.href = src;
}

/* ─────────────────────────────────────────────
   17b. VIDEO VIEWER MODAL
───────────────────────────────────────────── */
function openVideoViewer(src, title) {
  if (!src) return;
  const overlay = buildViewerModal('video', title, src);
  const body    = $('.viewer-body', overlay);
  const video   = document.createElement('video');
  video.src     = src;
  video.controls = video.autoplay = true;
  video.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000;';
  body.appendChild(video);
  $('.viewer-close', overlay)?.addEventListener('click', () => video.pause(), { once: true });
}

/* ─────────────────────────────────────────────
   SHARED VIEWER MODAL BUILDER
───────────────────────────────────────────── */
function buildViewerModal(type, title, src) {
  const overlay = document.createElement('div');
  overlay.className = 'viewer-overlay';
  overlay.innerHTML = `
    <div class="viewer-backdrop"></div>
    <div class="viewer-panel viewer-${type}">
      <div class="viewer-header">
        <div class="viewer-header-left">
          <span class="viewer-type-chip ${type}">${type.toUpperCase()}</span>
          <span class="viewer-title">${title || ''}</span>
        </div>
        <div class="viewer-header-right">
          ${type === 'pdf'
            ? `<a class="viewer-newtab" href="${src}" target="_blank" rel="noopener" title="Open in new tab">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
               </a>` : ''}
          <button class="viewer-close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      <div class="viewer-body"></div>
    </div>`;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => overlay.classList.add('open'));

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => overlay.remove(), 320);
  }

  $('.viewer-close', overlay)?.addEventListener('click', close);
  $('.viewer-backdrop', overlay)?.addEventListener('click', close);
  const escFn = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escFn); } };
  document.addEventListener('keydown', escFn);

  return overlay;
}

/* ─────────────────────────────────────────────
   18. IMAGE LIGHTBOX
───────────────────────────────────────────── */
function openImgLightbox(card, startIdx = 0, titleOverride = null) {
  const allSlides = $$('.proj-slide', card);
  let imgSlides = $$('.proj-slide[data-type="img"]', card);

  // Fallback: plain <img> gallery (e.g. timeline documentation photos)
  // that isn't built from the .proj-slide carousel structure.
  if (!imgSlides.length) imgSlides = $$('img', card);
  if (!imgSlides.length) return;

  // Map startIdx (all slides) to img-only index
  const clickedSlide = allSlides[startIdx];
  let imgPos = clickedSlide ? imgSlides.indexOf(clickedSlide) : startIdx;
  if (imgPos < 0 || imgPos >= imgSlides.length) imgPos = 0;

  const title = titleOverride || $('.proj-title, .cert-title', card)?.textContent || '';
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <div class="lightbox-meta">
      <span class="lightbox-title">${title}</span>
      <span class="lightbox-counter"></span>
    </div>
    <button class="lightbox-close" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
    <button class="lightbox-nav prev" aria-label="Previous">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <div class="lightbox-stage" id="lightboxStage">
      <img class="lightbox-img" src="" alt="" draggable="false">
    </div>
    <button class="lightbox-nav next" aria-label="Next">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
    <div class="lightbox-zoom-controls">
      <button class="lightbox-zoom-btn" id="lbZoomOut" aria-label="Zoom out">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6"/></svg>
      </button>
      <span class="lightbox-zoom-level">100%</span>
      <button class="lightbox-zoom-btn" id="lbZoomIn" aria-label="Zoom in">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg>
      </button>
    </div>`;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const imgEl    = $('.lightbox-img', overlay);
  const counter  = $('.lightbox-counter', overlay);
  const lvlEl    = $('.lightbox-zoom-level', overlay);
  const stage    = $('#lightboxStage', overlay) || $('.lightbox-stage', overlay);
  let scale = 1, panX = 0, panY = 0, dragging = false, dx = 0, dy = 0;
  const MIN = 1, MAX = 3, STEP = 0.5;

  function applyT() {
    imgEl.style.transform = `scale(${scale}) translate(${panX}px,${panY}px)`;
    stage.classList.toggle('zoomed', scale > 1);
    lvlEl.textContent = Math.round(scale * 100) + '%';
  }
  function reset() { scale = 1; panX = 0; panY = 0; applyT(); }
  const zoomIn  = () => { scale = Math.min(MAX, scale + STEP); applyT(); };
  const zoomOut = () => { scale = Math.max(MIN, scale - STEP); if (scale === MIN) { panX = 0; panY = 0; } applyT(); };

  function show(i) {
    imgPos = (i + imgSlides.length) % imgSlides.length;
    const s = imgSlides[imgPos];
    imgEl.src = s.dataset?.src || s.querySelector?.('img')?.src || s.src || '';
    imgEl.alt = s.querySelector?.('img')?.alt || s.alt || '';
    reset();
    counter.textContent = imgSlides.length > 1 ? `${imgPos + 1} / ${imgSlides.length}` : '';
    overlay.classList.toggle('single-image', imgSlides.length <= 1);
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => overlay.remove(), 320);
  }

  // Wire controls
  $('.lightbox-close',    overlay)?.addEventListener('click', close);
  $('.lightbox-nav.prev', overlay)?.addEventListener('click', () => show(imgPos - 1));
  $('.lightbox-nav.next', overlay)?.addEventListener('click', () => show(imgPos + 1));
  $('#lbZoomIn',  overlay)?.addEventListener('click', zoomIn);
  $('#lbZoomOut', overlay)?.addEventListener('click', zoomOut);

  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  imgEl.addEventListener('click', e => { e.stopPropagation(); scale === MIN ? (scale = 2, applyT()) : reset(); });
  stage?.addEventListener('wheel', e => { e.preventDefault(); e.deltaY < 0 ? zoomIn() : zoomOut(); }, { passive: false });

  imgEl.addEventListener('mousedown', e => {
    if (scale === MIN) return;
    dragging = true; stage?.classList.add('dragging');
    dx = e.clientX - panX; dy = e.clientY - panY;
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    panX = e.clientX - dx; panY = e.clientY - dy; applyT();
  });
  window.addEventListener('mouseup', () => { dragging = false; stage?.classList.remove('dragging'); });

  const kbFn = e => {
    if (!overlay.isConnected) { document.removeEventListener('keydown', kbFn); return; }
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowRight')  show(imgPos + 1);
    if (e.key === 'ArrowLeft')   show(imgPos - 1);
    if (e.key === '+' || e.key === '=') zoomIn();
    if (e.key === '-')           zoomOut();
    if (e.key === '0')           reset();
  };
  document.addEventListener('keydown', kbFn);

  requestAnimationFrame(() => { overlay.classList.add('open'); show(imgPos); });
}

// Expose for inline usage in HTML
window.openImgLightbox = openImgLightbox;

/* ─────────────────────────────────────────────
   19. PROJECT FILTER
───────────────────────────────────────────── */
function initProjectFilter() {
  const filters = $$('.proj-filter');
  const cards   = $$('.proj-card');
  if (!filters.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach((card, i) => {
        const show = f === 'all' || card.dataset.cat === f;
        if (show) {
          card.style.display = '';
          card.style.transitionDelay = `${(i % 6) * 60}ms`;
          requestAnimationFrame(() => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0) scale(1)';
          });
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'translateY(12px) scale(0.95)';
          setTimeout(() => { if (card.dataset.cat !== btn.dataset.filter) card.style.display = 'none'; }, 260);
        }
      });
    });
  });
}

/* ─────────────────────────────────────────────
   20. CERTIFICATE FILTER
───────────────────────────────────────────── */
function initCertFilter() {
  const filters = $$('.cert-filter');
  const cards   = $$('.cert-card');
  if (!filters.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach((card, i) => {
        const show = f === 'all' || card.dataset.cert === f;
        if (show) {
          card.style.display = '';
          card.style.transitionDelay = `${i * 80}ms`;
          requestAnimationFrame(() => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0) scale(1)';
          });
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'translateY(14px) scale(0.96)';
          setTimeout(() => { if (card.dataset.cert !== btn.dataset.filter) card.style.display = 'none'; }, 270);
        }
      });
    });
  });
}

/* ─────────────────────────────────────────────
   21. BACK TO TOP
───────────────────────────────────────────── */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────────
   21b. STICKY MINI CTA
───────────────────────────────────────────── */
function initStickyCta() {
  const cta = $('#stickyCta');
  const hero = $('#hero');
  const contact = $('#contact');
  if (!cta || !hero) return;

  let pastHero = false;
  let inContact = false;

  function update() {
    cta.classList.toggle('show', pastHero && !inContact);
  }

  const heroObs = new IntersectionObserver(([entry]) => {
    pastHero = !entry.isIntersecting;
    update();
  }, { threshold: 0 });
  heroObs.observe(hero);

  if (contact) {
    const contactObs = new IntersectionObserver(([entry]) => {
      inContact = entry.isIntersecting;
      update();
    }, { threshold: 0.2 });
    contactObs.observe(contact);
  }
}

/* ─────────────────────────────────────────────
   22. COPY CONTACT INFO TO CLIPBOARD
───────────────────────────────────────────── */
function initCopyContact() {
  const links = $$('.contact-link[href^="mailto:"], .contact-link[href^="tel:"]');
  if (!links.length) return;

  links.forEach(link => {
    link.addEventListener('click', async (e) => {
      const value = link.href.replace(/^mailto:|^tel:/, '');
      try {
        await navigator.clipboard.writeText(decodeURIComponent(value));
      } catch (err) {
        return; // clipboard unavailable — let the mailto/tel link behave normally
      }

      let toast = link.querySelector('.copy-toast');
      if (!toast) {
        toast = document.createElement('span');
        toast.className = 'copy-toast';
        toast.textContent = 'Copied!';
        link.appendChild(toast);
      }
      toast.classList.add('show');
      clearTimeout(link._copyTimeout);
      link._copyTimeout = setTimeout(() => toast.classList.remove('show'), 1400);
    });
  });
}

/* ─────────────────────────────────────────────
   23. TIMELINE GALLERY → LIGHTBOX
   Makes the small work-documentation photos in
   Professional Journey clickable/zoomable, same
   as project images, instead of hover-only.
───────────────────────────────────────────── */
function initTimelineGalleryLightbox() {
  $$('.timeline-gallery').forEach(gallery => {
    const imgs = $$('img', gallery);
    if (!imgs.length) return;

    const role = gallery.closest('.timeline-item')?.querySelector('.timeline-role')?.textContent
              || gallery.closest('.timeline-item')?.querySelector('.company')?.textContent
              || '';

    imgs.forEach((img, i) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => openImgLightbox(gallery, i, role));
    });
  });
}

/* ─────────────────────────────────────────────
   BOOT — run everything when DOM ready
───────────────────────────────────────────── */
onReady(() => {
  initNavbar();
  initScrollReveal();
  initScrollspy();
  initScrollProgress();
  initStatCounters();
  initCursor();
  initParticles();
  initTyping();
  initMagnetic();
  initRipple();
  initTilt();
  initSkillStagger();
  initTimelineReveal();
  initTimelineProgress();
  initEduBulletStagger();
  initSkillsCounter();
  initTitleUnderline();
  initCarousels();
  initProjectFilter();
  initCertFilter();
  initBackToTop();
  initStickyCta();
  initCopyContact();
  initTimelineGalleryLightbox();
});

/* ═══════════════════════════════════════════════════════════
   SECTION FLOW EFFECTS
   Parallax orbs + aurora stagger + geo shape mouse tracking
═══════════════════════════════════════════════════════════ */

/* ── 1. Parallax orbs: mesh-blob & geo-shape bergerak saat scroll ── */
function initParallaxOrbs() {
  const orbs  = document.querySelectorAll('.mesh-blob, .hero-orb-warm');
  const geos  = document.querySelectorAll('.geo-shape');
  if (!orbs.length && !geos.length) return;

  let ticking = false;
  const speeds = {
    'mesh-blob':     0.06,
    'hero-orb-warm': 0.04,
    'geo-shape':     0.035,
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;

      orbs.forEach((el, i) => {
        const cls    = el.classList.contains('hero-orb-warm') ? 'hero-orb-warm' : 'mesh-blob';
        const speed  = speeds[cls];
        const dir    = i % 2 === 0 ? 1 : -1;
        const offset = scrollY * speed * dir;
        el.style.transform = `translateY(${offset}px)`;
      });

      geos.forEach((el, i) => {
        const speed  = speeds['geo-shape'];
        const dir    = i % 2 === 0 ? -1 : 1;
        const offset = scrollY * speed * dir;
        // Preserve existing animation — stack via CSS variable trick
        el.style.setProperty('--scroll-y', `${offset}px`);
      });

      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}

/* ── 2. Aurora line stagger on section enter ── */
function initAuroraReveal() {
  const lines = document.querySelectorAll('.aurora-line');
  if (!lines.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  lines.forEach(line => {
    // Start paused, play on enter
    line.style.animationPlayState = 'paused';
    obs.observe(line);
  });
}

/* ── 3. Subtle mouse-tracking on geo shapes (desktop only) ── */
function initGeoMouseTrack() {
  if (window.innerWidth < 1024) return;
  const geos = document.querySelectorAll('.geo-shape');
  if (!geos.length) return;

  let mouseX = 0, mouseY = 0;
  let animFrame;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;  // -1 to 1
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function updateGeos() {
    geos.forEach((el, i) => {
      const depth  = 0.5 + (i % 3) * 0.3;   // 0.5 / 0.8 / 1.1
      const dir    = i % 2 === 0 ? 1 : -1;
      const tx = mouseX * 8 * depth * dir;
      const ty = mouseY * 8 * depth * dir;
      el.style.transform = `translate(${tx}px, ${ty}px)`;
    });
    animFrame = requestAnimationFrame(updateGeos);
  }

  updateGeos();
}

/* ── 4. Section entrance: fade + scale geo shapes on first view ── */
function initGeoEntrance() {
  const geos = document.querySelectorAll('.geo-shape, .mesh-blob');
  if (!geos.length) return;

  geos.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'scale(0.7)';
    el.style.transition = 'opacity 1.2s ease, transform 1.2s ease';
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        setTimeout(() => {
          el.style.opacity   = '';
          el.style.transform = '';
        }, i * 120);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -60px 0px' });

  geos.forEach(el => obs.observe(el));
}

// Boot new effects after existing ones
onReady(() => {
  initParallaxOrbs();
  initAuroraReveal();
  initGeoMouseTrack();
  initGeoEntrance();
});