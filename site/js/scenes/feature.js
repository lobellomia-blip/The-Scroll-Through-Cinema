/* =====================================================================
   06 Countdown + Feature presentations · 07 Get to know the director
   ===================================================================== */
(function () {
  const STC = window.STC;
  const { util, Audio } = STC;
  const { $, h, esc } = util;
  const PROJECTS = window.STC_PROJECTS;
  const SITE = window.STC_SITE;
  const go = (...a) => STC.App.go(...a);

  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.2l2.6 6.6 7 .5-5.4 4.5 1.7 6.9L12 16.9l-5.9 3.8 1.7-6.9L2.4 9.3l7-.5z"/></svg>';

  /* ------------------------------ countdown ------------------------------ */
  const Countdown = {
    run() {
      const wrap = $('#countdown');
      const cv = $('#countdown-canvas');
      const ctx = cv.getContext('2d');
      wrap.classList.add('is-on');
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const fit = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
      fit();
      window.addEventListener('resize', fit);
      // pre-baked grain tile
      const grain = document.createElement('canvas');
      grain.width = grain.height = 160;
      const g = grain.getContext('2d');
      const id = g.createImageData(160, 160);
      for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 34; }
      g.putImageData(id, 0, 0);

      const NUMS = [3, 2, 1];
      const per = 1000;
      let t0 = null, beeped = -1, raf, done;
      const finished = new Promise((r) => (done = r));
      let stopped = false;
      const stop = () => {
        if (stopped) return;
        stopped = true;
        cancelAnimationFrame(raf);
        clearTimeout(raf);
        window.removeEventListener('resize', fit);
        wrap.classList.remove('is-on');
        $('#countdown-skip').onclick = null;
        done();
      };
      $('#countdown-skip').onclick = stop;
      setTimeout(() => $('#countdown-skip').focus({ preventScroll: true }), 50);

      const draw = (t) => {
        if (t0 === null) t0 = t;
        const el = t - t0 - 250;
        const W = cv.width, H = cv.height, m = Math.min(W, H);
        const idx = Math.floor(el / per);
        if (el > NUMS.length * per + 150) { stop(); return; }
        if (idx >= 0 && idx < NUMS.length && idx !== beeped) { beeped = idx; Audio.play('beep'); }
        const p = el < 0 ? 0 : (el % per) / per;
        // flash on the final frame
        if (idx >= NUMS.length) { ctx.fillStyle = '#fff8e6'; ctx.fillRect(0, 0, W, H); raf = requestAnimationFrame(draw); return; }
        const flick = 0.92 + Math.random() * 0.08;
        const bg = ctx.createRadialGradient(W / 2, H / 2, m * 0.05, W / 2, H / 2, Math.max(W, H) * 0.7);
        bg.addColorStop(0, `rgba(${200 * flick | 0},${182 * flick | 0},${150 * flick | 0},1)`);
        bg.addColorStop(1, `rgba(${70 * flick | 0},${55 * flick | 0},${40 * flick | 0},1)`);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        const cx = W / 2 + (Math.random() - 0.5) * 3 * dpr, cy = H / 2 + (Math.random() - 0.5) * 3 * dpr;
        // sweep
        if (el >= 0) {
          ctx.fillStyle = 'rgba(40,28,18,.32)';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, Math.max(W, H), -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
          ctx.closePath();
          ctx.fill();
        }
        // rings & crosshair
        ctx.strokeStyle = 'rgba(250,240,220,.85)';
        ctx.lineWidth = 3 * dpr;
        [0.3, 0.36].forEach((r) => { ctx.beginPath(); ctx.arc(cx, cy, m * r, 0, Math.PI * 2); ctx.stroke(); });
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
        // number
        if (el >= 0) {
          ctx.fillStyle = 'rgba(20,12,8,.92)';
          ctx.font = `600 ${m * 0.4}px "Cormorant Garamond", Georgia, serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(NUMS[idx]), cx, cy + m * 0.02);
        }
        // grain, dust & scratches
        ctx.globalCompositeOperation = 'overlay';
        const pat = ctx.createPattern(grain, 'repeat');
        ctx.save();
        ctx.translate(Math.random() * 160, Math.random() * 160);
        ctx.fillStyle = pat;
        ctx.fillRect(-160, -160, W + 320, H + 320);
        ctx.restore();
        ctx.globalCompositeOperation = 'source-over';
        if (Math.random() < 0.5) {
          ctx.strokeStyle = 'rgba(255,250,235,.35)';
          ctx.lineWidth = dpr;
          const sx = Math.random() * W;
          ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + (Math.random() - 0.5) * 20, H); ctx.stroke();
        }
        for (let i = 0; i < 6; i++) { ctx.fillStyle = Math.random() < 0.5 ? 'rgba(20,12,8,.5)' : 'rgba(255,250,235,.4)'; ctx.beginPath(); ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 3 * dpr, 0, Math.PI * 2); ctx.fill(); }
        const vg = ctx.createRadialGradient(W / 2, H / 2, m * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(0,0,0,.7)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, H);
        raf = requestAnimationFrame(draw);
      };
      if (util.reduced) {
        // a still, readable version: three numbered beats without flicker
        let n = 0;
        const still = () => {
          if (stopped) return;
          const W = cv.width, H = cv.height, m = Math.min(W, H);
          ctx.fillStyle = '#b8a283'; ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = '#20140c'; ctx.font = `600 ${m * 0.4}px "Cormorant Garamond", Georgia, serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(NUMS[n]), W / 2, H / 2);
          Audio.play('beep');
          n++;
          if (n < 3) raf = setTimeout(still, 800); else raf = setTimeout(stop, 800);
        };
        still();
      } else raf = requestAnimationFrame(draw);
      return finished;
    },
  };

  /* --------------------------- feature presentation --------------------------- */
  function imgTag(im, eager) {
    return `<img src="${im.src}" alt="${esc(im.alt || '')}" width="${im.w}" height="${im.h}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
  }
  function shot(im, cls, caption) {
    return `<figure class="shot reveal ${cls || ''}">${im.paper ? `<div class="paper">${imgTag(im)}</div>` : imgTag(im)}${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
  }
  function bullets(list) { return `<ul class="bullets">${list.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`; }
  const RENDER = {
    chapter: (s) => `<div class="chapter reveal"><p class="chapter__label">${esc(s.label)}</p><h2 class="chapter__title">${esc(s.title)}</h2><div class="deco-rule" aria-hidden="true">&#10022;</div></div>`,
    text: (s) => `<section class="block"><div class="prose reveal">${s.heading ? `<h3>${esc(s.heading)}</h3>` : ''}${(s.body || []).map((p) => `<p>${esc(p)}</p>`).join('')}${s.list ? bullets(s.list) : ''}${s.columns ? `<div class="columns">${s.columns.map((c) => `<div><h4>${esc(c.heading)}</h4>${bullets(c.list)}</div>`).join('')}</div>` : ''}</div></section>`,
    list: (s) => `<section class="block"><div class="listing reveal">${s.heading ? `<h3>${esc(s.heading)}</h3>` : ''}<dl>${s.items.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div></section>`,
    image: (s) => shot(s, 'shot--' + (s.layout || 'wide'), s.caption),
    pair: (s) => `<div class="pair">${s.images.map((im) => shot(im)).join('')}</div>${s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ''}`,
    gallery: (s) => `<div class="gallery-grid">${s.images.map((im) => shot(Object.assign({ paper: s.paper }, im))).join('')}</div>${s.caption ? `<figcaption style="padding:6vh 7vw 0;text-align:center" class="shot"><span>${esc(s.caption)}</span></figcaption>` : ''}`,
    split: (s) => `<section class="split ${s.side === 'right' ? 'split--right' : ''}"><div class="split__media">${shot(s.image)}</div><div class="split__text reveal">${s.heading ? `<h3>${esc(s.heading)}</h3>` : ''}${(s.body || []).map((p) => `<p>${esc(p)}</p>`).join('')}${s.listHeading ? `<h3 style="margin-top:26px">${esc(s.listHeading)}</h3>` : ''}${s.list ? bullets(s.list) : ''}${s.caption ? `<p class="caption">${esc(s.caption)}</p>` : ''}</div></section>`,
    placeholder: (s) => `<div class="placeholder-slot reveal">${esc(s.label)}<br>— to be added —</div>`,
  };

  const Feature = {
    init() {
      this.root = $('#feature');
      this.section = $('#scene-feature');
      this.root.addEventListener('scroll', () => {
        const bar = this.root.querySelector('.filmstrip i');
        if (!bar) return;
        const max = this.root.scrollHeight - this.root.clientHeight;
        bar.style.height = (max > 0 ? (this.root.scrollTop / max) * 100 : 0) + '%';
      }, { passive: true });
      document.addEventListener('keydown', (e) => {
        if (STC.App.current !== 'feature') return;
        if (e.key === 'Escape') go('posters', { via: 'fade', id: this.p && this.p.id });
      });
    },
    render(id) {
      const p = PROJECTS.find((x) => x.id === id && x.kind === 'project');
      if (!p) return false;
      this.p = p;
      const hero = p.hero;
      const meta = (p.meta || []).map(([k, v]) => `<li><span>${esc(k)}</span>${esc(v)}</li>`).join('');
      this.root.innerHTML = `
        <div class="feature__bar">
          <button class="btn btn--ghost" type="button" data-act="exit">&larr;&nbsp; Poster wall</button>
          <div class="feature__now">Now showing &middot; <b>${esc(p.title)}</b></div>
          <div class="feature__bar-spacer"></div>
        </div>
        <div class="filmstrip" aria-hidden="true"><i></i></div>
        <header class="opening">
          ${hero ? `<img class="opening__img" src="${hero.src}" alt="${esc(hero.alt)}" width="${hero.w}" height="${hero.h}" fetchpriority="high">` : '<div class="opening__img" style="background:radial-gradient(ellipse at 50% 40%,#3a1a14,#0a0706)"></div>'}
          <div class="letterbox letterbox--t"></div><div class="letterbox letterbox--b"></div>
          <div class="opening__text">
            <p class="opening__presents">Mia Lobello presents &middot; Feature No. ${esc(p.number)}</p>
            <h1 class="opening__title">${esc(p.title)}</h1>
            <p class="opening__sub">${esc(p.subtitle || '')}</p>
            ${meta ? `<ul class="opening__meta">${meta}</ul>` : ''}
          </div>
          <div class="opening__cue" aria-hidden="true">Scroll &darr;</div>
        </header>
        <div class="reel-body">${p.sections.map((s) => (RENDER[s.type] ? RENDER[s.type](s) : '')).join('')}</div>
        <footer class="the-end">
          <p class="the-end__fin">The End</p>
          <p class="the-end__by">${esc(p.title)} &middot; designed by Mia Lobello</p>
          <div class="the-end__actions">
            <button class="btn btn--velvet" type="button" data-act="credits">Roll Credits</button>
            <button class="star-btn" type="button" data-act="director" aria-label="Get to know the director">${STAR}</button>
            <span class="star-label" aria-hidden="true">Meet the director</span>
          </div>
        </footer>
        <button class="star-btn star-btn--float" type="button" data-act="director" aria-label="Get to know the director" title="Get to know the director">${STAR}</button>`;
      this.root.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', (e) => {
        const act = b.dataset.act;
        Audio.play('click');
        if (act === 'exit') go('posters', { via: 'fade', id: p.id });
        if (act === 'credits') this.credits();
        if (act === 'director') {
          const r = b.getBoundingClientRect();
          go('director', { via: 'iris', origin: [r.left + r.width / 2, r.top + r.height / 2], from: p.id });
        }
      }));
      this.root.scrollTop = 0;
      // reveal-on-scroll
      if (this.io) this.io.disconnect();
      this.io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); this.io.unobserve(en.target); }
      }), { root: this.root, rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
      this.root.querySelectorAll('.reveal').forEach((el) => this.io.observe(el));
      return true;
    },
    enter() {
      const op = this.root.querySelector('.opening');
      requestAnimationFrame(() => requestAnimationFrame(() => op && op.classList.add('is-in')));
      this.root.focus({ preventScroll: true });
    },
    leave() {},
    credits() {
      const p = this.p;
      const wrap = $('#end-credits');
      const roll = $('#credits-roll');
      const lines = [['A Scroll-Through Cinemas Feature', p.title], ['Interior Design', 'Mia Lobello']];
      (p.meta || []).forEach(([k, v]) => lines.push([k, v]));
      lines.push(['Thank you for watching', '✦']);
      roll.innerHTML = lines.map(([a, b]) => `<p>${esc(a)}</p><h3>${esc(b)}</h3>`).join('');
      wrap.classList.add('is-on');
      let finished = false;
      const end = () => {
        if (finished) return;
        finished = true;
        wrap.onclick = null;
        go('posters', { via: 'fade', id: p.id }).then(() => { wrap.classList.remove('is-on'); if (anim) anim.cancel(); });
      };
      wrap.onclick = end;
      const hgt = roll.offsetHeight + innerHeight;
      let anim = null;
      if (util.reduced) { roll.style.top = '20%'; setTimeout(end, 3500); return; }
      anim = roll.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-hgt}px)` }], { duration: Math.max(6000, hgt * 7), easing: 'linear', fill: 'forwards' });
      anim.finished.then(end).catch(() => {});
    },
  };

  /* -------------------------------- director -------------------------------- */
  const Director = {
    init() {
      this.root = $('#director');
      document.addEventListener('keydown', (e) => {
        if (STC.App.current === 'director' && e.key === 'Escape') go('posters', { via: 'fade' });
      });
    },
    render(opts) {
      const d = SITE.director;
      const rows = [];
      if (d.email) rows.push(`<div class="credit-row"><span class="k">Correspondence</span><span class="dot">&#10022;</span><span class="v"><a href="mailto:${esc(d.email)}">${esc(d.email)}</a> <button class="copy-chip" type="button" data-copy="${esc(d.email)}">Copy</button></span></div>`);
      if (d.linkedin) rows.push(`<a class="credit-row" href="${esc(d.linkedin)}" target="_blank" rel="noopener"><span class="k">LinkedIn</span><span class="dot">&#10022;</span><span class="v">${esc(d.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</span></a>`);
      if (d.instagram) rows.push(`<a class="credit-row" href="${esc(d.instagram)}" target="_blank" rel="noopener"><span class="k">Instagram</span><span class="dot">&#10022;</span><span class="v">${esc(d.instagramHandle || d.instagram)}</span></a>`);
      if (d.resume) rows.push(`<a class="credit-row" href="${esc(d.resume)}" target="_blank" rel="noopener"><span class="k">R&eacute;sum&eacute;</span><span class="dot">&#10022;</span><span class="v">View / download (PDF)</span></a>`);
      const backTo = opts && opts.from ? PROJECTS.find((p) => p.id === opts.from) : null;
      this.root.innerHTML = `
        <div class="spot" aria-hidden="true"></div>
        <div class="director__inner">
          <p class="director__eyebrow">The Final Credits</p>
          <h1 class="director__heading" id="dir-h">Like what you saw?<span>Get to know the director.</span></h1>
          <div class="director__name-block reveal-d">
            <div class="director__credit">Directed by</div>
            <div class="director__name">${esc(d.name)}</div>
            <div class="director__role">${esc(d.role)} &middot; ${esc(d.city)}</div>
            <ul class="director__identity" aria-label="Design identity">${d.identity.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
          </div>
          <div class="deco-rule" aria-hidden="true">&#10022;</div>
          <div class="director__cols">
            <div><h3>The director</h3><p>${esc(d.intro)}</p></div>
            <div><h3>Design philosophy</h3>${d.philosophy.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
          </div>
          ${rows.length ? `<div class="director__links" aria-label="Contact">${rows.join('')}</div>` : ''}
          <div class="director__back">
            <button class="btn" type="button" data-act="wall">&larr;&nbsp; Return to the poster wall</button>
            ${backTo ? `<button class="btn btn--ghost" type="button" data-act="feature">Back to ${esc(backTo.title)}</button>` : ''}
          </div>
          <p class="director__thanks">Thank you for visiting Scroll-Through Cinemas.</p>
        </div>`;
      this.root.querySelector('[data-act="wall"]').addEventListener('click', () => go('posters', { via: 'fade', id: backTo && backTo.id }));
      const fb = this.root.querySelector('[data-act="feature"]');
      if (fb) fb.addEventListener('click', () => go('feature-' + backTo.id, { via: 'fade' }));
      this.root.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => {
        const v = b.dataset.copy;
        try {
          navigator.clipboard.writeText(v).then(() => util.toast('Email address copied'), () => util.toast(v));
        } catch (e) { util.toast(v); }
      }));
      this.root.scrollTop = 0;
      return true;
    },
    enter() { const h1 = $('#dir-h'); if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); } },
    leave() {},
  };

  STC.Countdown = Countdown;
  STC.Scenes = Object.assign(STC.Scenes || {}, { feature: Feature, director: Director });
})();
