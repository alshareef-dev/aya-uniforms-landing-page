/* ============================================================
   AYA UNIFORMS — script.js
   ============================================================ */
'use strict';

/* ── Nav ──────────────────────────────────────────────────── */
(function () {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const drawer = document.getElementById('navDrawer');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  function toggleDrawer(open) {
    drawer.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  burger.addEventListener('click', () => toggleDrawer(!drawer.classList.contains('is-open')));

  drawer.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => toggleDrawer(false))
  );
})();


/* ── Scroll reveal ────────────────────────────────────────── */
(function () {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay) || 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => io.observe(el));
})();


/* ── Animated stat counters ───────────────────────────────── */
(function () {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const dur    = 1600;
      const start  = performance.now();

      const tick = now => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);       /* ease-out cubic */
        const val   = Math.round(eased * target);
        el.textContent = val.toLocaleString('ar-SA') + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  els.forEach(el => io.observe(el));
})();


/* ── Gallery: drag-scroll + arrows + progress ─────────────── */
(function () {
  const track    = document.getElementById('galleryTrack');
  const fill     = document.getElementById('galleryFill');
  const btnPrev  = document.getElementById('galleryPrev');
  const btnNext  = document.getElementById('galleryNext');
  if (!track) return;

  /* Progress fill */
  function updateProgress() {
    const max  = track.scrollWidth - track.clientWidth;
    const pct  = max > 0 ? (Math.abs(track.scrollLeft) / max) * 100 : 0;
    if (fill) fill.style.width = pct + '%';
  }
  track.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* Step = one card width + gap */
  function cardStep() {
    const card = track.querySelector('.gallery__card');
    return card ? card.offsetWidth + 16 : 340;
  }

  /* RTL scroll direction: scrollLeft is negative in some browsers for RTL */
  function scrollBy(delta) {
    track.scrollBy({ left: delta, behavior: 'smooth' });
  }

  /* In an RTL document the scroll track is also mirrored.
     Prev (→ in RTL layout) means scrolling in the positive left direction. */
  if (btnPrev) btnPrev.addEventListener('click', () => scrollBy(cardStep()));
  if (btnNext) btnNext.addEventListener('click', () => scrollBy(-cardStep()));

  /* Drag-to-scroll (mouse) */
  let isDown = false, startX = 0, startScroll = 0;

  track.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.style.userSelect = 'none';
  });
  window.addEventListener('mouseup', () => {
    isDown = false;
    track.style.userSelect = '';
  });
  window.addEventListener('mousemove', e => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    track.scrollLeft = startScroll - dx;
  });
})();


/* ── Form ─────────────────────────────────────────────────── */
(function () {
  const form = document.getElementById('quoteForm');
  const btn  = document.getElementById('submitBtn');
  const note = document.getElementById('formNote');
  if (!form) return;

  const ICON_SEND = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>`;

  const ICON_OK = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5"/>
    </svg>`;

  form.addEventListener('submit', e => {
    e.preventDefault();

    btn.disabled = true;
    btn.innerHTML = '<span style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite"></span> جاري الإرسال…';

    /* Inject spinner keyframe once */
    if (!document.getElementById('_spin')) {
      const s = document.createElement('style');
      s.id = '_spin';
      s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }

    setTimeout(() => {
      btn.classList.add('is-success');
      btn.innerHTML = ICON_OK + ' تم الإرسال بنجاح!';
      if (note) note.textContent = 'سيتواصل معكم فريقنا قريبًا 🎉';

      setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('is-success');
        btn.innerHTML = ICON_SEND + ' إرسال الطلب';
        if (note) note.textContent = 'سيتواصل معكم فريقنا خلال 24 ساعة';
        form.reset();
      }, 4500);
    }, 1200);
  });
})();


/* ── Gallery lightbox ─────────────────────────────────────── */
(function () {
  const cards = document.querySelectorAll('.gallery__card');
  if (!cards.length) return;

  /* Build overlay */
  const overlay = Object.assign(document.createElement('div'), { role: 'dialog' });
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'عرض الصورة');
  Object.assign(overlay.style, {
    display: 'none',
    position: 'fixed',
    inset: '0',
    zIndex: '500',
    background: 'rgba(23,25,24,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    cursor: 'zoom-out',
  });

  const img = document.createElement('img');
  Object.assign(img.style, {
    maxWidth: 'min(820px, 90vw)',
    maxHeight: '90svh',
    objectFit: 'contain',
    borderRadius: '16px',
    boxShadow: '0 32px 96px rgba(0,0,0,0.6)',
    cursor: 'default',
  });
  img.addEventListener('click', e => e.stopPropagation());

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'إغلاق');
  Object.assign(closeBtn.style, {
    position: 'absolute',
    top: '20px', left: '20px',
    width: '44px', height: '44px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  overlay.append(img, closeBtn);
  document.body.appendChild(overlay);

  const open = (src, alt) => {
    img.src = src; img.alt = alt;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };
  const close = () => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  };

  overlay.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const el = card.querySelector('img');
      open(el.src, el.alt);
    });
  });
})();
