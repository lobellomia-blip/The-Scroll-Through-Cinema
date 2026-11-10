/* =====================================================================
   Stage utilities: fitting the painted environments to any screen,
   drag-to-look-around on narrow screens, camera moves, dialogue bubble.
   ===================================================================== */
(function () {
  const STC = (window.STC = window.STC || {});
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqTouch = window.matchMedia('(hover: none)');

  const util = {
    get reduced() { return mqReduce.matches; },
    get touch() { return mqTouch.matches; },
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    anim(el, frames, opts) {
      if (!el || !el.animate) return Promise.resolve();
      const a = el.animate(frames, Object.assign({ fill: 'forwards' }, opts));
      return a.finished.catch(() => {}).then(() => a);
    },
    $(sel, root) { return (root || document).querySelector(sel); },
    $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); },
    h(tag, attrs, html) {
      const el = document.createElement(tag);
      if (attrs) Object.entries(attrs).forEach(([k, v]) => {
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'style') el.style.cssText = v;
        else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      });
      if (html !== undefined) el.innerHTML = html;
      return el;
    },
    esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
    toast(msg, ms) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('is-shown');
      clearTimeout(util._toast);
      util._toast = setTimeout(() => t.classList.remove('is-shown'), ms || 2800);
    },
  };

  /* ---------------- Stage (one per painted environment) ---------------- */
  class Stage {
    constructor(section) {
      this.section = section;
      this.vp = section.querySelector('.viewport');
      this.stage = section.querySelector('.stage');
      this.camera = section.querySelector('.camera');
      this.W = +this.vp.dataset.w;
      this.H = +this.vp.dataset.h;
      this.focus = +(this.vp.dataset.focus || this.W / 2);
      this.s = 1; this.x = 0; this.y = 0; this.minX = 0;
      this.dragged = false;
      this._initPan();
    }
    fit() {
      const vw = window.innerWidth, vh = window.innerHeight;
      const portrait = vw / vh < 1.2;
      let s = Math.max(vw / this.W, vh / this.H);
      if (portrait) s = Math.min(vh / this.H, (2.3 * vw) / this.W);
      this.s = s;
      const sw = this.W * s, sh = this.H * s;
      this.minX = Math.min(0, vw - sw);
      // keep the chosen focal point centred, within bounds
      const keep = this._userPanned ? this.x : vw / 2 - this.focus * s;
      this.x = Math.max(this.minX, Math.min(0, keep));
      this.y = portrait ? Math.max(0, (vh - sh) * 0.36) : (vh - sh) / 2;
      this.section.classList.toggle('is-portrait', portrait && sw > vw + 40);
      this.apply();
    }
    apply() { this.stage.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) scale(${this.s})`; }
    panTo(designX, smooth) {
      const vw = window.innerWidth;
      const target = Math.max(this.minX, Math.min(0, vw / 2 - designX * this.s));
      if (!smooth || util.reduced) { this.x = target; this.apply(); return; }
      const from = this.x, t0 = performance.now(), dur = 700;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        this.x = from + (target - from) * e; this.apply();
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    /** screen position of a point in design coordinates */
    toScreen(x, y) { return { x: this.x + x * this.s, y: this.y + y * this.s }; }
    _initPan() {
      let startX = 0, startPan = 0, down = false;
      this.vp.addEventListener('pointerdown', (e) => {
        if (this.minX >= 0 || e.button) return;
        down = true; this.dragged = false; startX = e.clientX; startPan = this.x;
      });
      window.addEventListener('pointermove', (e) => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 7) { this.dragged = true; this.vp.classList.add('is-panning'); }
        if (this.dragged) {
          this.x = Math.max(this.minX, Math.min(0, startPan + dx));
          this._userPanned = true;
          this.apply();
          const hint = this.section.querySelector('.pan-hint');
          if (hint) hint.classList.add('is-faded');
        }
      });
      window.addEventListener('pointerup', () => {
        down = false;
        this.vp.classList.remove('is-panning');
        setTimeout(() => { this.dragged = false; }, 0);
      });
      // a drag shouldn't count as a click on whatever was under the finger
      this.vp.addEventListener('click', (e) => { if (this.dragged) { e.stopPropagation(); e.preventDefault(); } }, true);
    }
    resetPan() { this._userPanned = false; }
    /** cinematic push-in towards a point; resolves when finished */
    zoomInto(x, y, scale, dur) {
      this.camera.style.transformOrigin = `${x}px ${y}px`;
      if (util.reduced) return Promise.resolve();
      return util.anim(this.camera, [
        { transform: 'scale(1)', filter: 'blur(0) brightness(1)' },
        { transform: `scale(${scale * 0.55})`, filter: 'blur(0) brightness(1.05)', offset: 0.55 },
        { transform: `scale(${scale})`, filter: 'blur(3px) brightness(1.25)' },
      ], { duration: dur || 1500, easing: 'cubic-bezier(.6,0,.35,1)' });
    }
    settleFrom(scale, x, y) {
      this.camera.style.transformOrigin = x !== undefined ? `${x}px ${y}px` : '50% 50%';
      if (util.reduced) { this.camera.style.transform = ''; return Promise.resolve(); }
      return util.anim(this.camera, [
        { transform: `scale(${scale})`, filter: 'blur(2px)' },
        { transform: 'scale(1)', filter: 'blur(0)' },
      ], { duration: 1500, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    resetCamera() {
      this.camera.getAnimations().forEach((a) => a.cancel());
      this.camera.style.transform = '';
    }
  }

  /* ---------------- Dialogue bubble ---------------- */
  const Bubble = (() => {
    const el = document.getElementById('bubble');
    const who = document.getElementById('bubble-who');
    const title = document.getElementById('bubble-title');
    const text = document.getElementById('bubble-text');
    const actions = document.getElementById('bubble-actions');
    let typing = null, anchorFn = null, onClose = null;

    function position() {
      if (!anchorFn || !el.classList.contains('is-open')) return;
      const a = anchorFn();
      if (!a) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      let left = a.x - r.width / 2;
      if (a.side === 'right') left = a.x + 26;
      if (a.side === 'left') left = a.x - r.width - 26;
      left = Math.max(14, Math.min(vw - r.width - 14, left));
      let top = a.y - r.height - 24;
      el.classList.remove('tail-up', 'tail-none');
      if (a.side === 'right' || a.side === 'left') { top = Math.max(76, Math.min(vh - r.height - 90, a.y - r.height * 0.55)); el.classList.add('tail-none'); }
      else if (top < 70) { top = a.y + 30; el.classList.add('tail-up'); }
      top = Math.max(70, Math.min(vh - r.height - 14, top));
      el.style.left = left + 'px';
      el.style.top = top + 'px';
      el.style.setProperty('--tail-x', Math.max(24, Math.min(r.width - 24, a.x - left)) + 'px');
    }
    window.addEventListener('resize', position);

    function show(opts) {
      clearInterval(typing);
      who.textContent = opts.who || 'The Usher';
      title.hidden = !opts.title;
      title.textContent = opts.title || '';
      actions.innerHTML = '';
      (opts.actions || []).forEach((a) => {
        const b = util.h('button', { class: 'btn ' + (a.style || ''), type: 'button' }, util.esc(a.label));
        b.addEventListener('click', () => { STC.Audio.play('click'); a.onClick(); });
        actions.appendChild(b);
      });
      anchorFn = opts.anchor || null;
      onClose = opts.onClose || null;
      // full text is always available to assistive tech; the typing is visual only
      const full = opts.text;
      text.innerHTML = `<span class="sr-only">${util.esc(full)}</span><span aria-hidden="true" class="typed"></span>`;
      const typed = text.querySelector('.typed');
      el.classList.add('is-open');
      position();
      const fmt = (s) => util.esc(s).replace(/(Fun [Ff]act:)/, '<span class="ff">$1').concat(/Fun [Ff]act:/.test(s) ? '</span>' : '');
      if (util.reduced) { typed.innerHTML = fmt(full); position(); return; }
      let i = 0;
      const speed = full.length > 160 ? 2 : 1;
      typing = setInterval(() => {
        i = Math.min(full.length, i + speed);
        typed.innerHTML = fmt(full.slice(0, i));
        if (i >= full.length) { clearInterval(typing); position(); }
      }, 16);
      // finish instantly if they click the text
      text.onclick = () => { clearInterval(typing); typed.innerHTML = fmt(full); position(); };
      requestAnimationFrame(position);
      return Math.min(9000, full.length * 16 / speed + 300);
    }
    function hide() {
      clearInterval(typing);
      el.classList.remove('is-open');
      if (onClose) { const f = onClose; onClose = null; f(); }
    }
    document.getElementById('bubble-close').addEventListener('click', hide);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el.classList.contains('is-open')) { e.stopImmediatePropagation(); hide(); } }, true);
    return { show, hide, position, get open() { return el.classList.contains('is-open'); } };
  })();

  STC.util = util;
  STC.Stage = Stage;
  STC.Bubble = Bubble;
})();
