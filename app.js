/* =====================================================================
   App: routing between environments, cinematic transitions, intro, HUD.
   Routes (in the address bar after #):
     entrance · booth · concession · posters · poster-<id> · feature-<id> · director
   ===================================================================== */
(function () {
  const STC = window.STC;
  const { util, Audio, Scenes } = STC;
  const { $, $$ } = util;
  const PROJECTS = window.STC_PROJECTS;

  const SECTION = {
    entrance: '#scene-entrance', booth: '#scene-booth', concession: '#scene-concession',
    posters: '#scene-posters', closeup: '#scene-closeup', feature: '#scene-feature', director: '#scene-director',
  };
  const STAGED = ['entrance', 'booth', 'concession'];
  const veil = $('#veil');

  function parse(route) {
    route = (route || '').replace(/^#/, '');
    if (!route || route === 'entrance') return { scene: 'entrance', route: 'entrance' };
    if (['booth', 'concession', 'posters', 'director'].includes(route)) return { scene: route, route };
    let m = route.match(/^poster-(.+)$/);
    if (m && PROJECTS.some((p) => p.id === m[1])) return { scene: 'closeup', id: m[1], route };
    m = route.match(/^feature-(.+)$/);
    if (m) {
      const p = PROJECTS.find((x) => x.id === m[1]);
      if (p && p.kind === 'project' && p.status !== 'coming-soon') return { scene: 'feature', id: m[1], route };
      if (p) return { scene: 'closeup', id: p.id, route: 'poster-' + p.id };
    }
    return { scene: 'entrance', route: 'entrance' };
  }

  const App = {
    current: null,
    busy: false,
    _suppressHash: false,

    show(name, opts) {
      const target = parse(name);
      const scene = Scenes[target.scene];
      if (target.scene === 'closeup' && !scene.render(target.id)) return;
      if (target.scene === 'feature' && !scene.render(target.id)) return;
      if (target.scene === 'director') scene.render(opts);
      Object.entries(SECTION).forEach(([k, sel]) => {
        const el = $(sel);
        const on = k === target.scene;
        el.classList.toggle('is-active', on);
        el.setAttribute('aria-hidden', on ? 'false' : 'true');
        el.inert = !on;
        el.style.opacity = '';
      });
      if (this.current && this.current !== target.scene && Scenes[this.current].leave) Scenes[this.current].leave();
      this.current = target.scene;
      document.body.dataset.scene = target.scene;
      $('#hud').classList.toggle('in-feature', target.scene === 'feature');
      if (STAGED.includes(target.scene)) { scene.stage.resetCamera(); scene.stage.resetPan(); scene.stage.fit(); }
      if (target.scene === 'posters' && opts && opts.id) scene.enter({ id: opts.id });
      else scene.enter(opts);
      Audio.setScene(target.scene);
      this.route = target.route;
      this._setHash(target.route);
      return target;
    },

    _setHash(route) {
      const want = '#' + route;
      if (location.hash === want) return;
      this._suppressHash = true;
      try { history.pushState(null, '', want); } catch (e) { location.hash = want; }
      setTimeout(() => (this._suppressHash = false), 0);
    },

    async go(route, opts) {
      opts = opts || {};
      if (this.busy) return;
      this.busy = true;
      veil.classList.add('is-blocking');
      const from = this.current;
      const fromScene = Scenes[from];
      const target = parse(route);
      const reduced = util.reduced;
      try {
        STC.Bubble.hide();
        const via = reduced && opts.via !== 'countdown' ? 'fade' : opts.via || 'fade';

        if (via === 'zoom' && STAGED.includes(from)) {
          const [x, y, s] = opts.from;
          const z = fromScene.stage.zoomInto(x, y, s, 1600);
          await util.sleep(850);
          await util.anim(veil, [{ opacity: 0 }, { opacity: 1 }], { duration: 750, easing: 'ease-in' });
          await z;
          this.show(target.route, opts);
          const sc = Scenes[target.scene];
          if (sc.stage) sc.stage.settleFrom(1.14);
          else util.anim($(SECTION[target.scene]), [{ transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 1600, easing: 'cubic-bezier(.16,1,.3,1)' });
          await util.anim(veil, [{ opacity: 1 }, { opacity: 0 }], { duration: 1000, easing: 'ease-out' });
          if (fromScene.stage) fromScene.stage.resetCamera();
        } else if (via === 'flip' && opts.img) {
          await this._flip(opts.img, target);
        } else if (via === 'countdown') {
          Audio.stopMusic(false);
          Audio.play('projectorStart');
          await util.anim(veil, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: 'ease-in' });
          await STC.Countdown.run();
          this.show(target.route, opts);
          await util.anim(veil, [{ opacity: 1 }, { opacity: 0 }], { duration: 1100, easing: 'ease-out' });
        } else if (via === 'iris' && opts.origin && !reduced) {
          const iris = $('#iris');
          iris.style.setProperty('--ix', opts.origin[0] + 'px');
          iris.style.setProperty('--iy', opts.origin[1] + 'px');
          Audio.play('whoosh');
          await util.anim(iris, [{ clipPath: `circle(0px at ${opts.origin[0]}px ${opts.origin[1]}px)` }, { clipPath: `circle(150vmax at ${opts.origin[0]}px ${opts.origin[1]}px)` }], { duration: 1000, easing: 'cubic-bezier(.7,0,.3,1)' });
          veil.style.opacity = 1;
          iris.getAnimations().forEach((a) => a.cancel());
          this.show(target.route, opts);
          await util.anim(veil, [{ opacity: 1 }, { opacity: 0 }], { duration: 1200, easing: 'ease-out' });
        } else {
          await util.anim(veil, [{ opacity: 0 }, { opacity: 1 }], { duration: reduced ? 250 : 550, easing: 'ease-in' });
          this.show(target.route, opts);
          await util.anim(veil, [{ opacity: 1 }, { opacity: 0 }], { duration: reduced ? 300 : 750, easing: 'ease-out' });
        }
      } finally {
        veil.getAnimations().forEach((a) => a.cancel());
        veil.style.opacity = 0;
        veil.classList.remove('is-blocking');
        this.busy = false;
      }
    },

    /* poster on the wall → large poster in the close-up, in one continuous move */
    async _flip(img, target) {
      const start = img.getBoundingClientRect();
      const wall = $(SECTION.posters);
      const clone = img.cloneNode();
      clone.className = 'flip-clone';
      Object.assign(clone.style, { left: start.left + 'px', top: start.top + 'px', width: start.width + 'px', height: start.height + 'px' });
      document.body.appendChild(clone);
      img.style.visibility = 'hidden';

      // lay out the close-up underneath to find where the poster lands
      const cu = $(SECTION.closeup);
      Scenes.closeup.render(target.id);
      cu.style.opacity = 0;
      cu.classList.add('is-active');
      const big = $('#big-poster');
      big.style.visibility = 'hidden';
      const end = big.getBoundingClientRect();
      const full = new Image();
      full.src = big.src;

      const dur = 1250;
      const moving = util.anim(clone, [
        { left: start.left + 'px', top: start.top + 'px', width: start.width + 'px', height: start.height + 'px' },
        { left: end.left + 'px', top: end.top + 'px', width: end.width + 'px', height: end.height + 'px' },
      ], { duration: dur, easing: 'cubic-bezier(.65,0,.25,1)' });
      util.anim(wall, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.12)' }], { duration: dur * 0.9, easing: 'cubic-bezier(.6,0,.3,1)' });
      util.anim(cu, [{ opacity: 0 }, { opacity: 1 }], { duration: dur * 0.7, delay: dur * 0.35, easing: 'ease-out' });
      await moving;
      if (full.complete) clone.src = full.src;
      this.show(target.route);
      big.style.visibility = '';
      wall.getAnimations().forEach((a) => a.cancel());
      cu.getAnimations().forEach((a) => a.cancel());
      cu.style.opacity = '';
      img.style.visibility = '';
      await util.anim(clone, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 });
      clone.remove();
    },
  };
  STC.App = App;

  /* --------------------------------- init --------------------------------- */
  Object.values(Scenes).forEach((s) => s.init && s.init());

  window.addEventListener('resize', () => {
    if (STAGED.includes(App.current)) Scenes[App.current].stage.fit();
    STC.Bubble.position();
  });
  window.addEventListener('popstate', () => { if (!App._suppressHash && '#' + App.route !== location.hash) App.go(location.hash, { via: 'fade' }); });
  window.addEventListener('hashchange', () => { if (!App._suppressHash && '#' + App.route !== location.hash) App.go(location.hash, { via: 'fade' }); });

  /* ---------------- HUD & sound panel ---------------- */
  const hud = $('#hud');
  const panel = $('#sound-panel');
  const soundBtn = $('#sound-btn');
  const toggle = $('#sound-toggle');
  const va = $('#vol-ambience'), vm = $('#vol-music');
  function syncSound() {
    const on = Audio.enabled;
    toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    soundBtn.setAttribute('aria-label', on ? 'Sound settings (sound is on)' : 'Sound settings (sound is off)');
    $('#sound-icon .x').style.display = on ? 'none' : '';
    $$('#sound-icon .w1, #sound-icon .w2').forEach((p) => (p.style.display = on ? '' : 'none'));
    va.value = Audio.levels.ambience; vm.value = Audio.levels.music;
    va.disabled = vm.disabled = !on;
    if (!Audio.supported) $('#sound-note').textContent = 'Sound isn’t supported in this browser — everything else works as normal.';
  }
  Audio.onChange(syncSound);
  soundBtn.addEventListener('click', () => {
    const open = !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', open);
    soundBtn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !soundBtn.contains(e.target)) { panel.classList.remove('is-open'); soundBtn.setAttribute('aria-expanded', 'false'); }
  });
  toggle.addEventListener('click', () => Audio.setEnabled(!Audio.enabled));
  va.addEventListener('input', () => Audio.setLevel('ambience', +va.value));
  vm.addEventListener('input', () => Audio.setLevel('music', +vm.value));
  $('#hud-home').addEventListener('click', () => { if (App.current !== 'posters') App.go('posters', { via: 'fade' }); });
  try { if (sessionStorage.getItem('stc-ticket')) $('#hud-ticket').classList.add('is-shown'); } catch (e) {}
  syncSound();

  // gentle click feedback for every button
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.btn, .hud__btn, .arrow, .dots button');
    if (b) Audio.play('click');
  });

  /* ---------------- intro / preloader ---------------- */
  const intro = $('#intro');
  const assets = ['assets/env/entrance.jpg', 'assets/env/booth.jpg', 'assets/env/concession.jpg', ...PROJECTS.map((p) => p.poster.thumb)];
  let loaded = 0;
  const bar = $('#intro-bar');
  const status = $('#intro-status');
  const lines = ['Threading the projector…', 'Warming up the marquee…', 'Popping the popcorn…', 'Dimming the house lights…'];
  const tick = () => {
    loaded++;
    bar.style.width = Math.round((loaded / assets.length) * 100) + '%';
    status.textContent = lines[Math.min(lines.length - 1, Math.floor((loaded / assets.length) * lines.length))];
    if (loaded === assets.length) ready();
  };
  assets.forEach((src) => { const i = new Image(); i.onload = i.onerror = tick; i.src = src; });
  let isReady = false;
  function ready() {
    if (isReady) return;
    isReady = true;
    status.textContent = 'The show is about to begin';
    intro.classList.add('is-ready');
    const first = Audio.enabled ? $('#enter-sound') : $('#enter-quiet');
    setTimeout(() => first.focus({ preventScroll: true }), 100);
  }
  setTimeout(ready, 9000); // never hold visitors hostage to a slow image

  // show the requested room underneath the curtain while it loads
  $$('.scene').forEach((s) => (s.inert = true));
  const first = parse(location.hash);
  App.show(first.route);

  function begin(withSound, viaKeyboard) {
    if (withSound) Audio.setEnabled(true); else Audio.setEnabled(false);
    intro.classList.add('is-gone');
    hud.classList.remove('is-hidden');
    Audio.setScene(App.current);
    setTimeout(() => { intro.remove(); }, 1200);
    const sec = $(SECTION[App.current]);
    const firstBtn = sec.querySelector('.dock .btn') || sec.querySelector('.btn, button');
    if (firstBtn && viaKeyboard) setTimeout(() => firstBtn.focus({ preventScroll: true }), 1100);
  }
  $('#enter-sound').addEventListener('click', (e) => begin(true, e.detail === 0));
  $('#enter-quiet').addEventListener('click', (e) => begin(false, e.detail === 0));
})();
