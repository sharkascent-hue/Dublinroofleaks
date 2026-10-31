/* Vantage Roof Repairs — shared behaviour.
   Degrades gracefully: without GSAP or Lenis the content is still visible. */
(function () {
  /* ===== EDIT CONTACT DETAILS HERE (updates every page) ===== */
  var CONFIG = {
    phone: '087 466 6010', phoneHref: 'tel:+353874666010',
    whatsapp: 'https://wa.me/353874666010',
    email: 'vantageroofingdublin@gmail.com',
    hours: 'Mon – Fri 9am – 5pm · Sat 9am – 4pm · Emergency call-outs 24/7',
    address: 'Long Mile Road, Dublin 12',
    googleReview: '',
    formEndpoint: 'https://api.web3forms.com/submit',
    formKey: '4c5cc943-64d4-4b19-9a7c-8ee552e02b35', // Web3Forms access key; blank endpoint sends via the visitor's email app
    gaId: 'G-ZHNLRT6769' // Google Analytics 4 in Consent Mode v2: cookies only after Accept
  };
  /* ============================================================ */
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const touch = !fine;
  const G = typeof gsap !== 'undefined';
  const ST = G && typeof ScrollTrigger !== 'undefined';
  if (ST) gsap.registerPlugin(ScrollTrigger);
  if (touch) html.classList.add('touch');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  /* config fill */
  $$('[data-cfg]').forEach(el => {
    const k = el.dataset.cfg;
    if (k === 'phone') { el.textContent = CONFIG.phone; if (el.tagName === 'A') el.href = CONFIG.phoneHref; }
    else if (k === 'email') { el.textContent = CONFIG.email; if (el.tagName === 'A') el.href = 'mailto:' + CONFIG.email; }
    else if (k in CONFIG) el.textContent = CONFIG[k];
    else if (k === 'year') el.textContent = new Date().getFullYear();
  });
  $$('a[data-href="phone"]').forEach(a => a.href = CONFIG.phoneHref);
  $$('a[data-href="whatsapp"]').forEach(a => a.href = CONFIG.whatsapp);
  $$('a[data-href="google"]').forEach(a => a.href = CONFIG.googleReview);

  /* smooth scroll (desktop only) */
  let lenis = null;
  if (!reduce && fine && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (G) { lenis.on('scroll', () => ST && ScrollTrigger.update()); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  const scrollTo = (el, off) => lenis ? lenis.scrollTo(el, { offset: off == null ? -90 : off }) : el.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* split headings into words */
  function splitWords(el) {
    if (el.dataset.splitDone) return $$('.w > span', el);
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w'; w.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.08em;margin-bottom:-.08em';
            const i = document.createElement('span'); i.style.display = 'inline-block'; i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
      });
    };
    walk(el); el.dataset.splitDone = '1';
    return $$('.w > span', el);
  }

  /* intro */
  const loader = $('#loader');
  function finishIntro() { if (loader) loader.remove(); html.classList.remove('intro', 'intro-out'); heroIn(); }
  function runIntro() {
    try { sessionStorage.setItem('vr_intro', '1'); } catch (e) {}
    if (!loader || !html.classList.contains('intro') || reduce) { finishIntro(); return; }
    rainOn(loader, { always: true, density: 6, speed: 1.4, alpha: 1.6, color: 'rgba(20,121,224,' });
    setTimeout(() => { html.classList.add('intro-out'); heroIn(); setTimeout(finishIntro, 700); }, 2000);
  }

  /* hero entrance */
  let heroDone = false;
  function heroIn() {
    if (heroDone) return; heroDone = true;
    const hero = $('.hero, .phero'); if (!hero) return;
    $$('video', hero).forEach(v => v.play().catch(() => {}));
    if (!G || reduce || innerWidth <= 760) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const h = $('h1', hero);
    if (h) { if (touch) tl.from(h, { opacity: 0, y: 26, duration: 0.9, clearProps: 'all' }, 0.1); else tl.from(splitWords(h), { yPercent: 110, duration: 1, stagger: 0.045, clearProps: 'all' }, 0); }
    const gb = $('.gbadge', hero); if (gb) tl.from(gb, { opacity: 0, y: -12, scale: 0.96, duration: 0.7, clearProps: 'all' }, 0);
    const eb = $('.eyebrow, .crumb', hero); if (eb) tl.from(eb, { opacity: 0, x: -20, duration: 0.8, clearProps: 'all' }, 0.1);
    const lead = $('.lead', hero); if (lead) tl.from(lead, { opacity: 0, y: 20, duration: 0.9, clearProps: 'all' }, 0.45);
    const btns = $$('.btn-row .btn', hero); if (btns.length) tl.from(btns, { opacity: 0, y: 16, duration: 0.7, stagger: 0.1, clearProps: 'all' }, 0.6);
    const trust = $('.trust', hero); if (trust) tl.from(trust, { opacity: 0, y: 14, duration: 0.8, clearProps: 'all' }, 0.85);
    if (!touch) {
      const vc = $('.vcard', hero); if (vc) tl.from(vc, { clipPath: 'inset(45% 0 45% 0 round 24px)', scale: 0.97, duration: 1.2, ease: 'power4.inOut', clearProps: 'all' }, 0.15);
      const fr = $('.vwrap .frame', hero); if (fr) tl.from(fr, { opacity: 0, scale: 1.05, duration: 1, clearProps: 'all' }, 0.9);
      const pill = $('.vwrap .pill', hero); if (pill) tl.from(pill, { opacity: 0, y: 20, scale: 0.92, duration: 0.7, ease: 'back.out(1.6)', clearProps: 'all' }, 1.2);
      const tag = $('.vwrap .tag', hero); if (tag) tl.from(tag, { opacity: 0, x: -14, duration: 0.6, clearProps: 'all' }, 1.1);
      const bg = $('img.bg', hero); if (bg) tl.from(bg, { scale: 1.12, duration: 1.8, ease: 'power2.out', clearProps: 'all' }, 0);
      const sc = $('.scroll', hero); if (sc) tl.from(sc, { opacity: 0, duration: 0.8 }, 1.3);
    }
  }

  /* scroll animations */
  function touchFx() {
    const els = $$('[data-reveal],[data-split],[data-clip]').filter(el => !el.closest('.hero, .phero'));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; const el = e.target;
      if (el.dataset.reveal === 'group') [...el.children].forEach((c, i) => { c.style.transitionDelay = (i * 60) + 'ms'; });
      el.classList.add('in'); io.unobserve(el);
    }), { rootMargin: '0px 0px -5% 0px', threshold: 0.01 });
    els.forEach(el => io.observe(el));
    setTimeout(() => els.forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('in'); }), 300);
    const rp = $('.rp i'), art = $('.article');
    if (rp && art) addEventListener('scroll', () => { const r = art.getBoundingClientRect(); rp.style.transform = 'scaleX(' + clamp(-r.top / (r.height - innerHeight + 80), 0, 1) + ')'; }, { passive: true });
  }
  function scrollFx() {
    if (reduce) return;
    if (touch || !ST) { touchFx(); return; }
    gsap.defaults({ ease: 'power3.out' });
    $$('[data-reveal]').forEach(el => {
      if (el.dataset.reveal === 'group') gsap.from(el.children, { y: 40, opacity: 0, duration: 1, stagger: 0.1, clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 88%' } });
      else gsap.from(el, { y: 40, opacity: 0, duration: 1, clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    $$('[data-split]').forEach(el => { if (el.closest('.hero, .phero')) return; gsap.from(splitWords(el), { yPercent: 110, duration: 0.9, stagger: 0.03, clearProps: 'all', scrollTrigger: { trigger: el, start: 'top 85%' } }); });
    $$('[data-clip]').forEach(el => {
      const img = $('img', el);
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } });
      tl.from(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power4.inOut', clearProps: 'clipPath' }, 0);
      if (img && !el.hasAttribute('data-parallax')) tl.from(img, { scale: 1.2, duration: 1.6, ease: 'power3.out', clearProps: 'transform' }, 0);
    });
    $$('[data-parallax]').forEach(el => { const img = $('img', el); if (!img) return; gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }); });
    const rp = $('.rp i'), art = $('.article');
    if (rp && art) gsap.to(rp, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: art, start: 'top 80px', end: 'bottom bottom', scrub: true } });
    $$('.ghost').forEach(el => gsap.to(el, { xPercent: -12, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top top', end: 'bottom top', scrub: true } }));
    const hs = $('.hs'), track = $('#hsTrack');
    if (hs && track) ScrollTrigger.matchMedia({ '(min-width: 761px)': () => {
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: hs, start: 'top top', end: () => '+=' + dist(), pin: $('.pin', hs), scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: s => { const p = $('.prog i', hs); if (p) p.style.transform = 'scaleX(' + s.progress + ')'; } } });
      return () => tween.scrollTrigger && tween.scrollTrigger.kill();
    } });
  }

  /* nav */
  const nav = $('.nav'); let lastY = 0;
  const burger = $('.burger'), menu = $('.menu');
  function onScroll() { const y = scrollY; if (nav) { nav.classList.toggle('solid', y > 40); nav.classList.toggle('hide', y > lastY && y > 300 && !(menu && menu.classList.contains('open'))); } lastY = y; }
  if (burger && menu) burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open'); burger.classList.toggle('x', open); burger.setAttribute('aria-expanded', open);
    if (lenis) open ? lenis.stop() : lenis.start(); else document.body.style.overflow = open ? 'hidden' : '';
  });
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const page = document.body.dataset.page;
  $$('.links a, .menu a').forEach(a => { if (a.dataset.nav === page) a.classList.add('on'); });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); scrollTo(t); } }));

  /* quote dropdown */
  const qd = $('#qdrop');
  function openQuote(scroll) {
    if (!qd) return false;
    const open = !qd.classList.contains('open');
    qd.classList.toggle('open', open);
    $$('[data-qtoggle]').forEach(b => { b.classList.toggle('open', open); b.setAttribute('aria-expanded', open); });
    if (open) setTimeout(() => { const f = $('input', qd); if (f && fine) f.focus({ preventScroll: true }); if (scroll) scrollTo(qd, -110); }, 350);
    return true;
  }
  $$('[data-qtoggle]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openQuote(b.closest('.nav') || b.closest('.menu')); if (menu && menu.classList.contains('open')) burger.click(); }));

  /* magnetic buttons (desktop) */
  if (fine && G && !reduce) {
    $$('.btn-blue, .btn-navy, .btn-white').forEach(b => {
      const xt = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3' }), yt = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3' });
      b.addEventListener('mousemove', e => { const rc = b.getBoundingClientRect(); xt((e.clientX - rc.left - rc.width / 2) * 0.25); yt((e.clientY - rc.top - rc.height / 2) * 0.35); });
      b.addEventListener('mouseleave', () => { xt(0); yt(0); });
    });
  }

  /* lightbox for gallery figures and showcase items */
  const lb = $('#lb');
  const items = () => $$('.gal figure:not(.hide), .hs .item[data-full]');
  let idx = 0, lastFocus = null;
  function show(n) { const list = items(); if (!list.length) return; idx = (n + list.length) % list.length; const f = list[idx]; const im = $('#lbImg'); im.src = f.dataset.full; im.alt = f.dataset.cap || ''; $('#lbTitle').textContent = f.dataset.cap || ''; const nx = list[(idx + 1) % list.length]; if (nx) { const p = new Image(); p.src = nx.dataset.full; } if (G && !reduce) gsap.fromTo(im, { opacity: 0 }, { opacity: 1, duration: 0.35, clearProps: 'opacity' }); }
  function openLb(f) { if (!lb) return; lastFocus = document.activeElement; show(items().indexOf(f)); lb.classList.add('open'); html.classList.add('lb-open'); if (lenis) lenis.stop(); $('#lbClose').focus(); }
  function closeLb() { lb.classList.remove('open'); html.classList.remove('lb-open'); if (lenis) lenis.start(); if (lastFocus) lastFocus.focus(); }
  if (lb) {
    document.addEventListener('click', e => { const f = e.target.closest('.gal figure, .hs .item[data-full]'); if (f) { e.preventDefault(); openLb(f); } });
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', () => show(idx - 1));
    $('#lbNext').addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-stage')) closeLb(); });
    document.addEventListener('keydown', e => { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
    let tx = null;
    lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); tx = null; });
  }
  $$('.filters button').forEach(btn => btn.addEventListener('click', () => {
    $$('.filters button').forEach(b => b.classList.remove('on')); btn.classList.add('on');
    const f = btn.dataset.f; const figs = $$('.gal figure');
    figs.forEach(el => el.classList.toggle('hide', f !== 'all' && !(el.dataset.cat || '').split(' ').includes(f)));
    if (G && !reduce) gsap.from(figs.filter(el => !el.classList.contains('hide')), { opacity: 0, y: 18, duration: 0.5, stagger: 0.04, clearProps: 'all' });
    if (ST) ScrollTrigger.refresh();
  }));

  /* before / after */
  $$('.compare').forEach(cmp => {
    const rng = $('input[type=range]', cmp);
    const set = x => { cmp.style.setProperty('--x', x + '%'); if (rng) rng.value = x; };
    if (rng) rng.addEventListener('input', () => set(rng.value));
    const fromPointer = e => { const r = cmp.getBoundingClientRect(); set(clamp((e.clientX - r.left) / r.width, 0, 1) * 100); };
    let drag = false;
    cmp.addEventListener('pointerdown', e => { drag = true; fromPointer(e); });
    addEventListener('pointermove', e => { if (drag) fromPointer(e); });
    addEventListener('pointerup', () => { drag = false; });
    const sweep = () => { if (!G) return; const o = { v: 50 }; gsap.fromTo(o, { v: 92 }, { v: 45, duration: 1.5, ease: 'power3.inOut', onUpdate: () => set(o.v) }); };
    if (ST && !reduce) ScrollTrigger.create({ trigger: cmp, start: 'top 75%', once: true, onEnter: sweep });
    else if (!reduce) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); sweep(); } }, { threshold: 0.4 }).observe(cmp);
  });

  /* quote forms (hero dropdown + contact page) */
  $$('form.qf [required]').forEach(i => i.addEventListener('input', () => { const f = i.closest('.field'); if (f && i.value.trim()) f.classList.remove('err'); }));
  $$('form.qf').forEach(form => form.addEventListener('submit', async e => {
    e.preventDefault();
    if ($('.hp input', form) && $('.hp input', form).value) return;
    const badEmail = i => i.type === 'email' && i.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim());
    const missing = $$('input,select,textarea', form).filter(i => i.name !== 'website' && ((i.required && !i.value.trim()) || badEmail(i) || (i.type === 'tel' && i.value.replace(/\D/g, '').length < 7)));
    $$('.field', form).forEach(f => f.classList.remove('err'));
    missing.forEach(i => i.closest('.field') && i.closest('.field').classList.add('err'));
    const fe = $('.ferr', form); if (fe) fe.style.display = missing.length ? 'block' : 'none';
    if (missing.length) { missing[0].focus(); return; }
    const btn = $('button[type=submit]', form); const orig = btn.innerHTML; btn.disabled = true; btn.textContent = 'Sending…';
    const data = {}; $$('input,select,textarea', form).forEach(i => { if (i.name && i.name !== 'website' && i.value.trim()) data[i.name] = i.value; });
    const ok = () => { track('generate_lead', { form_location: form.closest('.hero') ? 'hero' : 'contact_page', service: data.service || '' }); const m = $('.ok', form); if (m) m.style.display = 'block'; try { m.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} form.reset(); $$('.field', form).forEach(f => f.classList.remove('err')); };
    try {
      if (CONFIG.formEndpoint) { const payload = Object.assign({ access_key: CONFIG.formKey, subject: 'New quote request from ' + (data.name || 'website') + (data.service ? ' — ' + data.service : ''), from_name: 'Vantage Roof Repairs website', botcheck: '' }, data); const r = await fetch(CONFIG.formEndpoint, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const j = await r.json().catch(() => ({})); if (!r.ok || j.success === false) throw new Error((j && j.message) || ('HTTP ' + r.status)); ok(); }
      else { location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('Quote request from ' + (data.name || 'website')) + '&body=' + encodeURIComponent(Object.keys(data).map(k => k + ': ' + data[k]).join('\n')); ok(); }
    } catch (err) { console.error('Form send failed:', err); alert('Sorry, that did not send' + (err && err.message ? ' (' + err.message + ')' : '') + '. Please call or WhatsApp us on ' + CONFIG.phone + '.'); }
    finally { btn.disabled = false; btn.innerHTML = orig; }
  }));

  /* rain on dark sections */
  function rainOn(sec, opts) {
    opts = opts || {};
    if (reduce || (innerWidth <= 760 && !opts.always) || $('.bgfx', sec)) return;
    const fx = document.createElement('div'); fx.className = 'bgfx'; fx.setAttribute('aria-hidden', 'true');
    const cv = document.createElement('canvas'); fx.appendChild(cv);
    if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
    sec.insertBefore(fx, sec.firstChild);
    const ctx = cv.getContext('2d'); let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), drops = [], run = !!opts.always, raf = null;
    const dens = opts.density || (touch ? 16 : 11);
    const mk = init => { const z = Math.random(); return { x: Math.random() * (W + 60), y: init ? Math.random() * H : -40, l: 10 + z * 22, v: (6 + z * 10) * (opts.speed || 1), w: .6 + z * 1.1, a: (.08 + z * .3) * (opts.alpha || 1), z }; };
    const size = () => { const r = sec.getBoundingClientRect(); if (W && Math.abs(r.width - W) < 2 && Math.abs(r.height - H) < 160) return; W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); drops = Array.from({ length: Math.floor(W / dens) }, () => mk(true)); };
    const tick = () => {
      if (!run) { raf = null; return; }
      ctx.clearRect(0, 0, W, H); ctx.lineCap = 'round';
      for (let i = 0; i < drops.length; i++) { const d = drops[i]; ctx.strokeStyle = (opts.color || 'rgba(170,205,255,') + d.a + ')'; ctx.lineWidth = d.w; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.l * .18, d.y + d.l); ctx.stroke(); d.y += d.v; d.x -= d.v * .18; if (d.y > H + 40 || d.x < -40) drops[i] = mk(false); }
      raf = requestAnimationFrame(tick);
    };
    size();
    if (opts.always) raf = requestAnimationFrame(tick);
    else new IntersectionObserver(es => { run = es[0].isIntersecting; if (run && !raf) raf = requestAnimationFrame(tick); }).observe(sec);
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 250); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) run = false; else if (!opts.always) { run = true; if (!raf) raf = requestAnimationFrame(tick); } });
  }
  $$('.hero, .phero, .cta, section.dark, footer, .hs').forEach(sec => rainOn(sec));

  /* ---------- analytics in Google Consent Mode v2: cookies only after Accept; anonymous cookieless pings otherwise ---------- */
  const CK = 'vr_consent';
  let gaOn = false;
  function track(name, params) { if (window.gtag) window.gtag('event', name, params || {}); }
  function initGA() {
    if (gaOn || !CONFIG.gaId) return; gaOn = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: getConsent() === 'yes' ? 'granted' : 'denied' });
    gtag('js', new Date()); gtag('config', CONFIG.gaId, { anonymize_ip: true });
    const add = () => { const sc = document.createElement('script'); sc.async = true; sc.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.gaId; document.head.appendChild(sc); };
    if (document.readyState === 'complete') setTimeout(add, 800); else addEventListener('load', () => setTimeout(add, 800));
  }
  function getConsent() { try { return localStorage.getItem(CK); } catch (e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(CK, v); } catch (e) {} }
  function banner() {
    let b = $('#cookiebar'); if (b) { b.classList.add('show'); html.classList.add('cb-open'); return; }
    b = document.createElement('div'); b.id = 'cookiebar'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Cookie choices');
    b.innerHTML = '<p>We use Google Analytics cookies to see how people use this site<span class="cb-l">. If you decline, only anonymous, cookie-free visit counts are sent</span>. <a href="/privacy-policy/">Privacy policy</a></p><div class="cb-btns"><button type="button" class="btn btn-outline" data-c="no">Decline</button><button type="button" class="btn btn-blue" data-c="yes">Accept</button></div>';
    document.body.appendChild(b);
    b.addEventListener('click', e => {
      const c = e.target.closest('[data-c]'); if (!c) return;
      const yes = c.dataset.c === 'yes'; setConsent(yes ? 'yes' : 'no');
      b.classList.remove('show'); html.classList.remove('cb-open');
      if (window.gtag) window.gtag('consent', 'update', { analytics_storage: yes ? 'granted' : 'denied' });
      if (!yes) document.cookie.split(';').forEach(k => { const n = k.split('=')[0].trim(); if (/^_ga/.test(n)) { document.cookie = n + '=; Max-Age=0; path=/; domain=.' + location.hostname.replace(/^www\./, ''); document.cookie = n + '=; Max-Age=0; path=/'; } });
    });
    requestAnimationFrame(() => { b.classList.add('show'); html.classList.add('cb-open'); });
  }
  const consent = getConsent();
  initGA();
  if (consent !== 'yes' && consent !== 'no' && CONFIG.gaId) setTimeout(banner, html.classList.contains('intro') ? 3000 : 600);
  $$('[data-cookie-settings]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); banner(); }));
  /* conversions: phone, WhatsApp, email taps */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a) return;
    const h = a.getAttribute('href') || '';
    if (h.startsWith('tel:')) track('phone_call_click', { link_location: a.closest('.hero') ? 'hero' : a.closest('.nav') ? 'header' : a.closest('footer') ? 'footer' : a.classList.contains('fcall') ? 'floating_button' : 'page' });
    else if (h.includes('wa.me')) track('whatsapp_click');
    else if (h.includes('maps.app.goo.gl')) track('google_profile_click');
    else if (h.includes('facebook.com')) track('facebook_click');
    else if (h.startsWith('mailto:')) track('email_click');
  }, true);

  /* press feedback */
  document.addEventListener('pointerdown', e => { const el = e.target.closest('.card, .step, .post, .val, .towns span, .rev'); if (!el) return; el.classList.add('pressed'); clearTimeout(el._pt); el._pt = setTimeout(() => el.classList.remove('pressed'), 900); }, { passive: true });

  scrollFx();
  runIntro();
  addEventListener('load', () => { ST && ScrollTrigger.refresh(); });
})();
