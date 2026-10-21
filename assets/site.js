/* Dublin Roof Leak Specialists — shared scripts */
(function () {
  'use strict';

  /* ===== EDIT YOUR CONTACT DETAILS HERE (updates every page) ===== */
  var CONFIG = {
    phone: '087 466 6010',            // display format
    phoneHref: 'tel:+353874666010',   // dial format
    whatsapp: 'https://wa.me/353874666010',
    email: 'sales.vantageroofing@gmail.com',
    hours: 'Mon – Fri 9am – 5pm · Sat 9am – 4pm · Emergency call-outs 24/7, 365 days',
    area: 'Dublin city & county, plus Kildare, Meath & Wicklow',
    address: '39 Northumberland Rd, Ballsbridge, Dublin 4, D04 H1F3',
    googleReview: 'https://maps.app.goo.gl/CdXup99Qys6fNFPCA',
    formEndpoint: ''                  // e.g. 'https://formspree.io/f/xxxxxxx' — leave blank to send via email app
  };
  /* ================================================================ */

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // ---- Config fill ----
  $$('[data-cfg]').forEach(function (el) {
    var k = el.getAttribute('data-cfg');
    if (k === 'phone') { el.textContent = CONFIG.phone; if (el.tagName === 'A') el.href = CONFIG.phoneHref; }
    else if (k === 'email') { el.textContent = CONFIG.email; if (el.tagName === 'A') el.href = 'mailto:' + CONFIG.email; }
    else if (k === 'whatsapp') { if (el.tagName === 'A') el.href = CONFIG.whatsapp; }
    else if (k === 'hours') { el.textContent = CONFIG.hours; }
    else if (k === 'area') { el.textContent = CONFIG.area; }
    else if (k === 'address') { el.textContent = CONFIG.address; }
    else if (k === 'year') { el.textContent = new Date().getFullYear(); }
  });
  $$('a[data-cfg-href="phone"]').forEach(function (a) { a.href = CONFIG.phoneHref; });
  $$('a[data-cfg-href="whatsapp"]').forEach(function (a) { a.href = CONFIG.whatsapp; });
  $$('a[data-cfg-href="google"]').forEach(function (a) { a.href = CONFIG.googleReview; });

  // ---- Header ----
  var hdr = $('.hdr'), prog = $('.progress');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (hdr) hdr.classList.toggle('scrolled', y > 40);
    if (prog) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Mobile menu ----
  var burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('.mnav a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu-open'); }); });
  }

  // ---- Active nav ----
  var page = document.body.getAttribute('data-page');
  if (page) $$('a[data-nav="' + page + '"]').forEach(function (a) { a.classList.add('active'); });

  // ---- Reveal on scroll ----
  var rv = $$('.rv, .rv-l, .rv-r, .rv-img, .stag');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  // ---- Hero headline word reveal ----
  $$('.hero h1[data-words]').forEach(function (h) {
    var text = h.textContent.trim().split(/\s+/);
    h.innerHTML = text.map(function (w, i) {
      var hl = /^\*/.test(w); w = w.replace(/^\*/, '');
      return '<span class="w"><i class="' + (hl ? 'hl' : '') + '" style="animation-delay:' + (0.35 + i * 0.08) + 's">' + w + '</i></span>';
    }).join(' ');
  });

  // ---- Rain canvas (hero) ----
  var rain = $('#rain');
  if (rain && !reduce) {
    var ctx = rain.getContext('2d'), drops = [], W, H, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      W = rain.clientWidth; H = rain.clientHeight; rain.width = W * dpr; rain.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drops = []; var n = Math.floor(W / 9);
      for (var i = 0; i < n; i++) drops.push(mk(true));
    }
    function mk(init) { var z = Math.random(); return { x: Math.random() * W, y: init ? Math.random() * H : -40, l: 10 + z * 22, v: 7 + z * 11, w: .6 + z * 1.1, a: .12 + z * .35, z: z }; }
    var last = 0;
    function tick(t) {
      requestAnimationFrame(tick);
      if (document.hidden || t - last < 16) return; last = t;
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round';
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        ctx.strokeStyle = 'rgba(170,205,255,' + d.a + ')'; ctx.lineWidth = d.w;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.l * .18, d.y + d.l); ctx.stroke();
        d.y += d.v; d.x -= d.v * .18;
        if (d.y > H + 40 || d.x < -40) drops[i] = mk(false);
      }
    }
    size(); window.addEventListener('resize', size); requestAnimationFrame(tick);
  }

  // ---- Floating particles (process section) ----
  $$('canvas.stars').forEach(function (c) {
    if (reduce) return;
    var ctx = c.getContext('2d'), ps = [], W, H, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() { W = c.clientWidth; H = c.clientHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ps = []; for (var i = 0; i < Math.floor(W * H / 14000); i++) ps.push({ x: Math.random() * W, y: Math.random() * H, r: .6 + Math.random() * 1.8, vx: (Math.random() - .5) * .15, vy: -.08 - Math.random() * .22, o: Math.random() * Math.PI * 2 }); }
    var t0 = 0;
    function tick(t) {
      requestAnimationFrame(tick); if (document.hidden) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i]; var a = .25 + .45 * (Math.sin(t / 900 + p.o) + 1) / 2;
        ctx.fillStyle = 'rgba(190,220,255,' + a + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        p.x += p.vx; p.y += p.vy; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; } if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5;
      }
    }
    size(); window.addEventListener('resize', size); requestAnimationFrame(tick);
  });

  // ---- Card hover glow + tilt ----
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (fine && !reduce) {
    $$('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mx', x + 'px'); card.style.setProperty('--my', y + 'px');
        var rx = ((y / r.height) - .5) * -5, ry = ((x / r.width) - .5) * 5;
        card.style.transform = 'translateY(-8px) perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
    $$('.btn').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect(); var x = (e.clientX - r.left - r.width / 2) * .18, y = (e.clientY - r.top - r.height / 2) * .3;
        b.style.transform = 'translate(' + x + 'px,' + (y - 2) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  // ---- Before / After ----
  $$('.ba').forEach(function (ba) {
    var drag = false;
    function set(cx) { var r = ba.getBoundingClientRect(); var p = Math.max(2, Math.min(98, (cx - r.left) / r.width * 100)); ba.style.setProperty('--pos', p + '%'); }
    ba.addEventListener('pointerdown', function (e) { drag = true; ba.setPointerCapture(e.pointerId); set(e.clientX); });
    ba.addEventListener('pointermove', function (e) { if (drag) set(e.clientX); });
    ba.addEventListener('pointerup', function () { drag = false; });
    ba.addEventListener('pointercancel', function () { drag = false; });
    // gentle intro sweep once visible
    if (!reduce && 'IntersectionObserver' in window) {
      var done = false;
      new IntersectionObserver(function (es, o) {
        es.forEach(function (e) {
          if (e.isIntersecting && !done) {
            done = true; o.disconnect(); var start = null;
            (function anim(ts) {
              if (!start) start = ts; var k = Math.min(1, (ts - start) / 1800); var ease = 1 - Math.pow(1 - k, 3);
              ba.style.setProperty('--pos', (8 + 42 * ease) + '%'); if (k < 1 && !drag) requestAnimationFrame(anim);
            })(performance.now());
          }
        });
      }, { threshold: .4 }).observe(ba);
    }
  });

  // ---- Gallery filters + lightbox ----
  var gal = $('.gal');
  if (gal) {
    var figs = $$('figure', gal);
    $$('.filters button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.filters button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on');
        var f = b.getAttribute('data-f');
        figs.forEach(function (fg, i) {
          var show = f === 'all' || (fg.getAttribute('data-cat') || '').indexOf(f) > -1;
          fg.classList.toggle('hide', !show);
          if (show) { fg.style.animation = 'none'; void fg.offsetWidth; fg.style.animation = 'fadeUp .6s ' + (i * .04) + 's both'; }
        });
      });
    });
    var lb = document.createElement('div'); lb.className = 'lb';
    lb.innerHTML = '<button class="x" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button><button class="p" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button><button class="n" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button><img alt=""><div class="cap"></div>';
    document.body.appendChild(lb);
    var img = $('img', lb), cap = $('.cap', lb), cur = 0;
    function visible() { return figs.filter(function (f) { return !f.classList.contains('hide'); }); }
    function show(i) { var v = visible(); cur = (i + v.length) % v.length; var f = v[cur]; img.src = f.getAttribute('data-full') || $('img', f).src; img.alt = $('img', f).alt; cap.textContent = $('figcaption', f) ? $('figcaption', f).textContent : ''; lb.classList.add('open'); }
    figs.forEach(function (f) { f.addEventListener('click', function () { show(visible().indexOf(f)); }); });
    $('.x', lb).addEventListener('click', function () { lb.classList.remove('open'); });
    $('.p', lb).addEventListener('click', function () { show(cur - 1); });
    $('.n', lb).addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('open'); });
    document.addEventListener('keydown', function (e) { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') lb.classList.remove('open'); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
  }

  // ---- Contact form ----
  var form = $('#quote-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if ($('.hp input', form) && $('.hp input', form).value) return;
      var data = {}; $$('input,select,textarea', form).forEach(function (i) { if (i.name) data[i.name] = i.value; });
      var btn = $('button[type=submit]', form); btn.disabled = true; btn.textContent = 'Sending…';
      function done() { form.closest('.form').classList.add('sent'); }
      if (CONFIG.formEndpoint) {
        fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (r.ok) done(); else throw 0; })
          .catch(function () { btn.disabled = false; btn.textContent = 'Try again'; alert('Sorry, that did not send. Please call us instead.'); });
      } else {
        var body = Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('\n');
        window.location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('Quote request from ' + (data.name || 'website')) + '&body=' + encodeURIComponent(body);
        setTimeout(done, 800);
      }
    });
  }
})();

/* ---- Hero slideshow ---- */
(function () {
  var box = document.querySelector('.hero .slides'); if (!box) return;
  var imgs = Array.prototype.slice.call(box.querySelectorAll('img')); if (imgs.length < 2) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dotsBox = document.querySelector('.hero .dots'), dots = [];
  if (dotsBox) imgs.forEach(function (_, i) { var b = document.createElement('button'); b.setAttribute('aria-label', 'Show photo ' + (i + 1)); b.addEventListener('click', function () { go(i, true); }); dotsBox.appendChild(b); dots.push(b); });
  var cur = 0, timer;
  function go(n, manual) {
    imgs[cur].classList.remove('on'); if (dots[cur]) dots[cur].classList.remove('on');
    cur = (n + imgs.length) % imgs.length;
    var im = imgs[cur]; im.className = 'kb' + (cur % 4); void im.offsetWidth; im.classList.add('on');
    if (dots[cur]) dots[cur].classList.add('on');
    // warm the next image
    var nx = imgs[(cur + 1) % imgs.length]; if (nx.getAttribute('data-src')) { nx.src = nx.getAttribute('data-src'); nx.removeAttribute('data-src'); }
    if (manual) { clearInterval(timer); start(); }
  }
  function start() { if (!reduce) timer = setInterval(function () { if (!document.hidden) go(cur + 1); }, 6500); }
  imgs[0].className = 'kb0'; void imgs[0].offsetWidth; imgs[0].classList.add('on'); if (dots[0]) dots[0].classList.add('on');
  var second = imgs[1]; if (second.getAttribute('data-src')) { second.src = second.getAttribute('data-src'); second.removeAttribute('data-src'); }
  start();
})();
