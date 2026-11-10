/* =====================================================================
   04 Poster wall (a walkable hallway) · 05 Close-up poster + synopsis
   ===================================================================== */
(function () {
  const STC = window.STC;
  const { util, Audio } = STC;
  const { $, $$, h, esc } = util;
  const PROJECTS = window.STC_PROJECTS;
  const go = (...a) => STC.App.go(...a);

  const projects = PROJECTS.filter((p) => p.kind === 'project');
  const favourites = PROJECTS.filter((p) => p.kind === 'favourite');
  const posters = [...projects, ...favourites];

  const Gallery = {
    index: 0,
    x: 0,
    init() {
      this.section = $('#scene-posters');
      this.track = $('#track');
      this.fg = $('#foreground');
      this.exhibits = [];

      // a little breathing room at the start of the hallway
      this.track.appendChild(this._blank(0.6));
      projects.forEach((p) => this.track.appendChild(this._exhibit(p)));
      const div = h('div', { class: 'exhibit exhibit--divider' }, `
        <div class="wall-seg"></div><div class="pilaster"></div>
        <div class="divider-plaque" role="note"><p>Staff Picks</p><h3>The Director&#8217;s Favourites</h3><em>Personal favourites &mdash; not portfolio projects</em></div>`);
      this.track.appendChild(div);
      favourites.forEach((p) => this.track.appendChild(this._exhibit(p)));
      this.track.appendChild(this._blank(1.2));

      for (let i = 0; i < posters.length + 8; i++) {
        this.fg.appendChild(h('div', { class: 'stanchion-seg' }, '<div class="rope"></div><div class="stanchion"><i></i></div>'));
      }

      const dots = $('#dots');
      posters.forEach((p, i) => {
        if (i === projects.length) dots.appendChild(h('span', { class: 'gap', 'aria-hidden': 'true' }));
        const d = h('button', { type: 'button', 'aria-label': `${p.title}${p.kind === 'favourite' ? ' (staff pick)' : ''}` });
        d.addEventListener('click', () => this.goTo(i));
        dots.appendChild(d);
      });

      $('#arrow-l').addEventListener('click', () => this.step(-1));
      $('#arrow-r').addEventListener('click', () => this.step(1));
      document.addEventListener('keydown', (e) => {
        if (STC.App.current !== 'posters' || e.altKey || e.metaKey || e.ctrlKey) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); this.step(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); this.step(-1); }
        if (e.key === 'Enter' && document.activeElement === document.body) { this.open(this.index); }
      });
      // swipe & wheel to walk
      let sx = null, sy = 0;
      this.section.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; });
      this.section.addEventListener('pointerup', (e) => {
        if (sx === null) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        sx = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { this._swiped = true; this.step(dx < 0 ? 1 : -1); setTimeout(() => (this._swiped = false), 50); }
      });
      let wheelLock = 0;
      this.section.addEventListener('wheel', (e) => {
        const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(d) < 18 || performance.now() < wheelLock) return;
        wheelLock = performance.now() + 750;
        this.step(d > 0 ? 1 : -1);
      }, { passive: true });

      window.addEventListener('resize', () => this.place(false));
    },
    _blank(f) { return h('div', { class: 'exhibit', style: `width:calc(var(--slot) * ${f})` }, '<div class="wall-seg"></div>'); },
    _exhibit(p) {
      const isFav = p.kind === 'favourite';
      const soon = p.status === 'coming-soon';
      const label = isFav ? 'Staff Pick' : `Feature No. ${p.number}`;
      const ratio = (p.poster.w / p.poster.h).toFixed(4);
      const ex = h('div', { class: 'exhibit', 'data-id': p.id, style: `--pw:calc(var(--ph) * ${ratio})` }, `
        <div class="wall-seg"></div>
        <div class="pilaster"></div>
        <button class="lamp" type="button" tabindex="-1" aria-hidden="true"></button>
        <div class="lamp-cone"></div>
        <button class="poster-btn" type="button" aria-label="${esc(p.title)}${p.subtitle ? ' — ' + esc(p.subtitle) : ''}. ${isFav ? 'Staff pick, a personal favourite.' : soon ? 'Coming soon.' : 'Now showing.'} Open poster."></button>
        <div class="frame"><img src="${p.poster.thumb}" alt="${esc(p.poster.alt)}" width="${Math.round(760 * ratio)}" height="760" loading="${posters.indexOf(p) < 3 ? 'eager' : 'lazy'}" decoding="async"></div>
        <div class="plaque"><small>${label}</small><strong>${esc(p.title)}</strong>${soon ? '<small class="soon">Coming Soon</small>' : ''}</div>`);
      const btn = ex.querySelector('.poster-btn');
      // the clickable area matches the framed poster
      btn.style.cssText = 'inset:auto;left:50%;top:calc(9vh + 5vh + 26px);width:calc(var(--pw) + var(--ph) * .064);height:calc(var(--ph) * 1.064);transform:translateX(-50%);'
      btn.addEventListener('mouseenter', () => ex.classList.add('is-hover'));
      btn.addEventListener('mouseleave', () => ex.classList.remove('is-hover'));
      btn.addEventListener('focus', () => { ex.classList.add('is-hover'); const i = posters.indexOf(p); if (i !== this.index) this.goTo(i); });
      btn.addEventListener('blur', () => ex.classList.remove('is-hover'));
      btn.addEventListener('click', () => { if (!this._swiped) this.open(posters.indexOf(p)); });
      const lamp = ex.querySelector('.lamp');
      lamp.addEventListener('mouseenter', () => Audio.play('click'));
      lamp.addEventListener('click', () => { lamp.classList.remove('flick'); void lamp.offsetWidth; lamp.classList.add('flick'); });
      this.exhibits.push(ex);
      return ex;
    },
    targetX(i) {
      const ex = this.exhibits[i];
      return window.innerWidth / 2 - (ex.offsetLeft + ex.offsetWidth / 2);
    },
    render() {
      this.track.style.transform = `translate3d(${this.x}px,0,0)`;
      this.fg.style.transform = `translate3d(${this.x * 1.3 - window.innerWidth * 0.1}px,0,0)`;
    },
    place(animate) {
      const target = this.targetX(this.index);
      cancelAnimationFrame(this._raf);
      $$('.dots button', this.section).forEach((d, i) => d.classList.toggle('is-current', i === this.index));
      $('#arrow-l').disabled = this.index === 0;
      $('#arrow-r').disabled = this.index === posters.length - 1;
      const p = posters[this.index];
      $('#gallery-counter').textContent = p.kind === 'favourite' ? 'Staff Pick' : `Feature ${p.number} of 0${projects.length}`;
      if (!animate || util.reduced) { this.x = target; this.render(); return; }
      const from = this.x, dist = Math.abs(target - from);
      const dur = Math.min(2600, 900 + dist * 0.9);
      const t0 = performance.now();
      const bob = $('#walk-bob');
      bob.classList.add('is-walking');
      const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        this.x = from + (target - from) * ease(k);
        this.render();
        if (k < 1) this._raf = requestAnimationFrame(step);
        else bob.classList.remove('is-walking');
      };
      this._raf = requestAnimationFrame(step);
    },
    step(d) { this.goTo(Math.max(0, Math.min(posters.length - 1, this.index + d))); },
    goTo(i) {
      if (i === this.index && this.x === this.targetX(i)) return;
      this.index = i;
      Audio.play('click');
      this.place(true);
    },
    open(i) {
      const p = posters[i];
      const img = this.exhibits[i].querySelector('.frame img');
      Audio.play('whoosh');
      go('poster-' + p.id, { via: 'flip', img });
    },
    enter(opts) {
      if (opts && opts.id) {
        const i = posters.findIndex((p) => p.id === opts.id);
        if (i >= 0) this.index = i;
      }
      requestAnimationFrame(() => this.place(false));
    },
    leave() {},
    posterEl(id) {
      const ex = this.exhibits.find((e) => e.dataset.id === id);
      return ex && ex.querySelector('.frame img');
    },
  };

  /* ------------------------------ close-up ------------------------------ */
  const Closeup = {
    init() {
      this.section = $('#scene-closeup');
    },
    render(id) {
      const p = PROJECTS.find((x) => x.id === id);
      if (!p) return false;
      this.p = p;
      const isFav = p.kind === 'favourite';
      const soon = p.status === 'coming-soon';
      const img = $('#big-poster');
      img.src = p.poster.src;
      img.alt = p.poster.alt;
      $('#syn-kicker').textContent = isFav ? 'Staff Pick · A Personal Favourite' : `Feature Presentation No. ${p.number}`;
      $('#syn-title').textContent = p.title;
      const sub = $('#syn-sub');
      sub.textContent = p.subtitle || '';
      sub.hidden = !p.subtitle;
      $('#syn-body').innerHTML = soon
        ? `<p class="synopsis__soon">Coming Soon.</p>`
        : `<p class="synopsis__text">${esc(p.synopsis)}</p>`;
      const actions = $('#syn-actions');
      actions.innerHTML = '';
      const back = h('button', { class: 'btn btn--ghost', type: 'button' }, '&larr;&nbsp; Back');
      back.addEventListener('click', () => this.back());
      actions.appendChild(back);
      if (!isFav && !soon) {
        const play = h('button', { class: 'btn btn--velvet', type: 'button' }, '&#9654;&nbsp; Play Feature Presentation');
        play.addEventListener('click', () => go('feature-' + p.id, { via: 'countdown' }));
        actions.appendChild(play);
      }
      this.section.querySelector('.closeup__scroll').scrollTop = 0;
      return true;
    },
    back() { go('posters', { via: 'fade', id: this.p && this.p.id }); },
    enter() {
      setTimeout(() => {
        const btn = $('#syn-actions .btn--velvet') || $('#syn-actions .btn');
        if (btn) btn.focus({ preventScroll: true });
      }, 900);
    },
    leave() {},
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && STC.App && STC.App.current === 'closeup') Closeup.back();
  });

  STC.Scenes = Object.assign(STC.Scenes || {}, { posters: Gallery, closeup: Closeup });
  STC.posterList = posters;
})();
