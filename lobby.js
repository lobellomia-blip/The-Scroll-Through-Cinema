/* =====================================================================
   The lobby environments: 01 Entrance · 02 Ticket booth · 03 Concessions
   ===================================================================== */
(function () {
  const STC = window.STC;
  const { util, Audio, Bubble } = STC;
  const { $, $$, h } = util;
  const SITE = window.STC_SITE;
  const go = (...a) => STC.App.go(...a);

  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };

  /* shared: hover/tap curtains -------------------------------------- */
  function bindCurtains(hot, curtains, onEnter) {
    let open = false;
    const set = (v) => {
      if (v === open) return;
      open = v;
      curtains.classList.toggle('is-open', v);
      if (v) Audio.play('curtain');
    };
    hot.addEventListener('mouseenter', () => set(true));
    hot.addEventListener('mouseleave', () => set(false));
    hot.addEventListener('focus', () => set(true));
    hot.addEventListener('blur', () => set(false));
    hot.addEventListener('click', () => {
      if (util.touch && !open) { set(true); return; } // first tap opens on touch screens
      onEnter();
    });
    return { close: () => set(false), open: () => set(true) };
  }

  /* ================================ 01 ENTRANCE ================================ */
  const Entrance = {
    init() {
      this.section = $('#scene-entrance');
      this.stage = new STC.Stage(this.section);

      // marquee bulbs: real incandescent-style flicker, each bulb on its own rhythm
      const mb = $('#marquee-bulbs');
      const cx = 838;
      window.STC_BULBS.marquee.forEach(([x, y]) => {
        const b = h('i', { class: 'bulb', style: `left:${x}px;top:${y}px;--delay:${(-Math.random() * 2).toFixed(2)}s;--d:${(1.2 + Math.random() * 1.6).toFixed(2)}s;transition-delay:${(Math.abs(x - cx) / 900).toFixed(2)}s` });
        mb.appendChild(b);
      });
      const fb = $('#frame-bulbs');
      window.STC_BULBS.frame.forEach(([x, y], i) => {
        fb.appendChild(h('i', { class: 'bulb', style: `left:${x}px;top:${y}px;width:16px;height:16px;margin:-8px 0 0 -8px;--delay:${(i * 0.05).toFixed(2)}s` }));
      });

      const marquee = $('#hot-marquee');
      const flickerOn = () => { mb.classList.add('flicker'); $('#marquee-glow').classList.add('is-on'); };
      const flickerOff = () => { mb.classList.remove('flicker'); $('#marquee-glow').classList.remove('is-on'); };
      marquee.addEventListener('mouseenter', flickerOn);
      marquee.addEventListener('mouseleave', flickerOff);
      marquee.addEventListener('focus', flickerOn);
      marquee.addEventListener('blur', flickerOff);
      marquee.addEventListener('click', () => { flickerOn(); clearTimeout(this._mq); this._mq = setTimeout(flickerOff, 2600); });

      this._buildReel();
      const reelHot = $('#hot-reel');
      reelHot.addEventListener('mouseenter', () => this._spin(true));
      reelHot.addEventListener('mouseleave', () => this._spin(false));
      reelHot.addEventListener('focus', () => this._spin(true));
      reelHot.addEventListener('blur', () => this._spin(false));
      reelHot.addEventListener('click', () => {
        if (!util.touch) return;
        this._spin(!this._spinning);
      });

      $('#hot-booth').addEventListener('click', () => this.toBooth());
      this.section.querySelector('[data-action="to-booth"]').addEventListener('click', () => this.toBooth());
      this.section.querySelector('[data-action="skip-lobby"]').addEventListener('click', () => go('posters', { via: 'fade' }));

      bindCurtains($('#hot-entrance-door'), $('#entrance-curtains'), () => {
        util.toast('The doors open once you have a ticket — visit the ticket booth first.');
        $('#hot-booth').classList.add('show-tag');
        setTimeout(() => $('#hot-booth').classList.remove('show-tag'), 2600);
      });
    },
    _buildReel() {
      const holes = [0, 60, 120, 180, 240, 300].map((a) => {
        const r = (a * Math.PI) / 180, x = Math.cos(r) * 52, y = Math.sin(r) * 52;
        return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="21" ry="27" transform="rotate(${a + 90} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#000"/>`;
      }).join('');
      const hubHoles = [30, 90, 150, 210, 270, 330].map((a) => {
        const r = (a * Math.PI) / 180;
        return `<circle cx="${(Math.cos(r) * 13).toFixed(1)}" cy="${(Math.sin(r) * 13).toFixed(1)}" r="4" fill="#1a110c"/>`;
      }).join('');
      $('#reel').innerHTML = `
        <svg viewBox="-100 -100 200 200" aria-hidden="true">
          <defs>
            <radialGradient id="reelMetal" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#f1dcc2"/><stop offset=".45" stop-color="#bba082"/><stop offset=".8" stop-color="#7c6450"/><stop offset="1" stop-color="#4a382b"/></radialGradient>
            <radialGradient id="reelFilm" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5a3a26"/><stop offset=".7" stop-color="#3b2517"/><stop offset="1" stop-color="#24160d"/></radialGradient>
            <filter id="reelBevel"><feDropShadow dx="0" dy="0" stdDeviation="1.4" flood-color="#000" flood-opacity=".7"/></filter>
            <mask id="reelMask"><rect x="-100" y="-100" width="200" height="200" fill="#fff"/>${holes}<circle r="5" fill="#000"/></mask>
          </defs>
          <circle r="94" fill="url(#reelFilm)"/>
          ${[86, 78, 70, 62, 54, 46, 38].map((r) => `<circle r="${r}" fill="none" stroke="#7a5236" stroke-width="1" opacity=".55"/>`).join('')}
          <g mask="url(#reelMask)" filter="url(#reelBevel)">
            <circle r="96" fill="url(#reelMetal)"/>
            <circle r="90" fill="none" stroke="#5e4837" stroke-width="2"/>
            <circle r="24" fill="#cdb497" stroke="#6d5644" stroke-width="2"/>
          </g>
          <circle r="96" fill="none" stroke="#3a2a1e" stroke-width="2.5"/>
          ${hubHoles}
          <circle r="5" fill="#0d0805"/>
          <path d="M-60 -70 A92 92 0 0 1 40 -86" fill="none" stroke="#fff6e4" stroke-width="3" opacity=".5" stroke-linecap="round"/>
        </svg>`;
      this._angle = 0; this._vel = 0; this._spinning = false;
    },
    _spin(on) {
      this._spinning = on;
      if (this._raf) return;
      const svg = $('#reel svg');
      let last = performance.now(), acc = 0;
      const tick = (t) => {
        const dt = Math.min(0.05, (t - last) / 1000); last = t;
        const target = this._spinning ? (util.reduced ? 90 : 260) : 0;
        this._vel += (target - this._vel) * Math.min(1, dt * (this._spinning ? 1.6 : 0.9));
        this._angle = (this._angle + this._vel * dt) % 360;
        svg.style.setProperty('--spin', this._angle.toFixed(2) + 'deg');
        acc += this._vel * dt;
        if (acc > 30) { acc = 0; Audio.play('reel'); }
        $('#frame-bulbs').classList.toggle('chase', this._vel > 40);
        if (this._spinning || this._vel > 1) this._raf = requestAnimationFrame(tick);
        else { this._raf = null; this._vel = 0; }
      };
      this._raf = requestAnimationFrame(tick);
    },
    enter() {
      // bulbs come up on first arrival, like a marquee being switched on
      const mb = $('#marquee-bulbs');
      requestAnimationFrame(() => requestAnimationFrame(() => { mb.classList.add('is-lit'); $('#frame-bulbs').classList.add('is-lit'); }));
    },
    leave() { this._spin(false); },
    toBooth() {
      Audio.play('whoosh');
      go('booth', { via: 'zoom', from: [840, 560, 2.7] });
    },
  };

  /* ================================ 02 TICKET BOOTH ================================ */
  const Booth = {
    init() {
      this.section = $('#scene-booth');
      this.stage = new STC.Stage(this.section);
      this.att = STC.Attendant.create('ticket');
      $('#booth-att').appendChild(this.att.el);
      this.ticketNo = store.get('stc-ticket');

      $('#hot-attendant').addEventListener('click', () => this.greet());
      $('#hot-speaker').addEventListener('click', () => this.printTicket());
      $('#ticket').addEventListener('click', () => this.collect());
      $('#ticket-keep').addEventListener('click', () => this.keep());
      this.section.querySelector('[data-action="greet"]').addEventListener('click', () => this.greet());
      this.section.querySelector('[data-action="print-ticket"]').addEventListener('click', () => {
        if (this.state === 'printed') this.collect(); else this.printTicket();
      });
      this.section.querySelector('[data-action="enter-cinema"]').addEventListener('click', () => this.enterCinema());
      this.curtains = bindCurtains($('#hot-booth-door'), $('#booth-curtains'), () => this.enterCinema());
      if (this.ticketNo) this._unlock(true);
    },
    anchor() {
      const p = this.stage.toScreen(724, 340);
      return { x: p.x, y: p.y, side: window.innerWidth > 900 ? 'right' : undefined };
    },
    say(text, extra) {
      const ms = Bubble.show(Object.assign({ who: 'The Usher', text, anchor: () => this.anchor() }, extra));
      this.att.talk(ms);
    },
    greet() {
      Audio.play('bell');
      const actions = this.ticketNo
        ? [{ label: 'Enter the cinema', onClick: () => { Bubble.hide(); this.enterCinema(); } }]
        : [{ label: 'Get my ticket', onClick: () => { Bubble.hide(); this.printTicket(); } }];
      this.say(SITE.attendant.greeting, { actions });
    },
    printTicket() {
      if (this.ticketNo) {
        this.say('You already have your ticket! Head on through the curtains whenever you’re ready.', {
          actions: [{ label: 'Enter the cinema', onClick: () => { Bubble.hide(); this.enterCinema(); } }],
        });
        return;
      }
      if (this.state === 'printing' || this.state === 'printed') return;
      this.state = 'printing';
      Bubble.hide();
      $('#speaker-ring').classList.remove('is-on');
      const no = String(Math.floor(100000 + Math.random() * 899999));
      this.pendingNo = no;
      $('#ticket-no-small').textContent = 'No. ' + no;
      $('#speaker').classList.add('is-pulsing');
      setTimeout(() => $('#speaker').classList.remove('is-pulsing'), 1600);
      Audio.play('ticket');
      this.att.talk(900);
      const t = $('#ticket');
      t.classList.remove('is-printed');
      t.classList.add('is-printing');
      // on narrow screens make sure the slot is in view
      this.stage.panTo(700, true);
      setTimeout(() => {
        t.classList.remove('is-printing');
        t.classList.add('is-printed');
        $('#ticket-chute').classList.add('is-ready');
        t.tabIndex = 0;
        this.state = 'printed';
        $('#dock-ticket').textContent = 'Take my ticket';
        this.say('Here’s your ticket — go ahead and take it from the slot!', {
          actions: [{ label: 'Take my ticket', onClick: () => { Bubble.hide(); this.collect(); } }],
        });
        t.focus({ preventScroll: true });
      }, util.reduced ? 200 : 1650);
    },
    collect() {
      if (this.state !== 'printed') return;
      Bubble.hide();
      Audio.play('click');
      $('#bt-no').textContent = 'No. ' + this.pendingNo;
      $('#ticket-modal').classList.add('is-open');
      $('#ticket').style.visibility = 'hidden';
      setTimeout(() => $('#ticket-keep').focus(), 300);
    },
    keep() {
      const modal = $('#ticket-modal');
      const big = modal.querySelector('.big-ticket');
      const stub = $('#hud-ticket');
      this.ticketNo = this.pendingNo;
      store.set('stc-ticket', this.ticketNo);
      stub.classList.add('is-shown');
      const a = big.getBoundingClientRect(), b = stub.getBoundingClientRect();
      const fly = util.reduced ? Promise.resolve() : util.anim(big, [
        { transform: 'rotate(-3deg) scale(1)', opacity: 1 },
        { transform: `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) rotate(8deg) scale(.08)`, opacity: 0.2 },
      ], { duration: 900, easing: 'cubic-bezier(.6,0,.3,1)' });
      Audio.play('whoosh');
      fly.then((anim) => {
        modal.classList.remove('is-open');
        setTimeout(() => { if (anim && anim.cancel) anim.cancel(); }, 500);
        this._unlock();
        this.say(SITE.attendant.ticketIssued, {
          actions: [{ label: 'Enter the cinema', onClick: () => { Bubble.hide(); this.enterCinema(); } }],
        });
      });
    },
    _unlock(silent) {
      this.state = 'done';
      $('#enter-sign').classList.add('is-on');
      $('#lock-chip').classList.add('is-off');
      $('#dock-enter').setAttribute('aria-disabled', 'false');
      $('#dock-ticket').textContent = 'My ticket';
      $('#ticket-chute').classList.remove('is-ready');
      $('#ticket').tabIndex = -1;
      $('#hud-ticket').classList.add('is-shown');
      if (!silent) Audio.play('bell');
    },
    enterCinema() {
      if (!this.ticketNo) {
        this.curtains.close();
        $('#speaker-ring').classList.add('is-on');
        this.stage.panTo(700, true);
        this.say(SITE.attendant.needTicket, { actions: [{ label: 'Get my ticket', onClick: () => { Bubble.hide(); this.printTicket(); } }] });
        return;
      }
      Bubble.hide();
      this.curtains.open();
      Audio.play('curtain');
      setTimeout(() => go('concession', { via: 'zoom', from: [1310, 470, 3.2], curtain: true }), 380);
    },
    enter() {
      if (!this.ticketNo) {
        $('#speaker-ring').classList.add('is-on');
        const tag = $('#hot-attendant');
        setTimeout(() => tag.classList.add('show-tag'), 1200);
        setTimeout(() => tag.classList.remove('show-tag'), 4800);
      }
    },
    leave() { Bubble.hide(); this.att.hush(); this.curtains.close(); },
  };

  /* ================================ 03 CONCESSIONS ================================ */
  const SNACK_GEOM = {
    popcorn: { x: 973, y: 356, w: 72, h: 104, fx: 'popBurst' },
    candy: { x: 1064, y: 395, w: 100, h: 67, fx: 'rattle' },
    soda: { x: 1198, y: 348, w: 54, h: 114, fx: 'fizz' },
    combo: { x: 976, y: 508, w: 222, h: 86, fx: 'popBurst' },
  };
  const Concession = {
    init() {
      this.section = $('#scene-concession');
      this.stage = new STC.Stage(this.section);
      this.att = STC.Attendant.create('concession');
      $('#conc-att').appendChild(this.att.el);
      this.seen = new Set();

      const list = $('#menu-list');
      const wrap = $('#snacks');
      SITE.snacks.forEach((s, i) => {
        const li = h('li');
        const b = h('button', { class: 'menu-item', type: 'button', 'data-snack': s.id },
          `<span class="num">0${i + 1}</span><span>${util.esc(s.name)}</span><span class="dots"></span><span class="seen" aria-label="tasted">&#10022;</span>`);
        b.addEventListener('click', () => this.snack(s.id));
        li.appendChild(b);
        list.appendChild(li);

        const g = SNACK_GEOM[s.id];
        const sx = g.x - 600;
        const btn = h('button', { class: 'hot snack', type: 'button', id: 'snack-' + s.id, 'aria-label': `Select the ${s.name}`, style: `left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px;border-radius:6px` },
          `<span class="shadow"></span><span class="sprite" style="background-image:url(assets/env/concession.jpg);background-size:956px 941px;background-position:-${sx}px -${g.y}px"></span><span class="sparkle"></span><span class="tag">${util.esc(s.name)}</span>`);
        btn.addEventListener('click', () => this.snack(s.id));
        wrap.appendChild(btn);
        wrap.appendChild(h('i', { class: 'snack-hint', id: 'hint-' + s.id, style: `left:${g.x + g.w - 6}px;top:${g.y + 6}px;animation-delay:${i * 0.6}s` }));
      });

      // popcorn machine
      const k = $('#kernels');
      for (let i = 0; i < 16; i++) {
        k.appendChild(h('i', { class: 'kernel', style: `left:${10 + Math.random() * 120}px;top:${30 + Math.random() * 50}px;--x:${(Math.random() * 40 - 20).toFixed(0)}px;--d:${(-Math.random() * 1.1).toFixed(2)}s` }));
      }
      const machine = $('#hot-machine');
      let popTimer = null;
      const popOn = () => {
        k.classList.add('is-popping');
        clearInterval(popTimer);
        popTimer = setInterval(() => Audio.play('pop'), 140 + Math.random() * 120);
      };
      const popOff = () => { k.classList.remove('is-popping'); clearInterval(popTimer); };
      machine.addEventListener('mouseenter', popOn);
      machine.addEventListener('mouseleave', popOff);
      machine.addEventListener('focus', popOn);
      machine.addEventListener('blur', popOff);
      machine.addEventListener('click', () => { popOn(); clearTimeout(this._pm); this._pm = setTimeout(popOff, 2600); });

      $('#hot-conc-att').addEventListener('click', () => this.intro());
      $('#hot-exit').addEventListener('click', () => this.toTheatre());
      this.section.querySelector('[data-action="to-theatre"]').addEventListener('click', () => this.toTheatre());
      this.section.querySelector('[data-action="skip-to-features"]').addEventListener('click', () => this.toTheatre(true));
      this.section.querySelector('[data-action="snack-menu"]').addEventListener('click', () => this.menu());
    },
    anchor() {
      const p = this.stage.toScreen(500, 420);
      return { x: p.x, y: p.y, side: window.innerWidth > 900 ? 'right' : undefined };
    },
    say(text, extra) {
      const ms = Bubble.show(Object.assign({ who: 'Concessions', text, anchor: () => this.anchor() }, extra));
      this.att.talk(ms);
    },
    exitActions() {
      return [
        { label: 'Another snack', style: 'btn--ghost', onClick: () => this.menu() },
        { label: 'Continue to the theatre', onClick: () => { Bubble.hide(); this.toTheatre(); } },
      ];
    },
    intro() {
      this.att.wave();
      Audio.play('bell');
      this.say(SITE.attendant.concessionIntro, {
        actions: [
          { label: 'Pick a snack', style: 'btn--ghost', onClick: () => this.menu() },
          { label: 'Skip the line', onClick: () => { Bubble.hide(); this.toTheatre(true); } },
        ],
      });
    },
    menu() {
      Bubble.show({
        who: 'Concessions', title: 'Tonight’s Menu', text: 'What can I get you?', anchor: () => this.anchor(),
        actions: SITE.snacks.map((s) => ({ label: s.name, style: this.seen.has(s.id) ? 'btn--ghost' : '', onClick: () => this.snack(s.id) })),
      });
    },
    snack(id) {
      const s = SITE.snacks.find((x) => x.id === id);
      if (!s) return;
      $$('.snack', this.section).forEach((el) => el.classList.toggle('is-active', el.id === 'snack-' + id));
      clearTimeout(this._act);
      this._act = setTimeout(() => $$('.snack', this.section).forEach((el) => el.classList.remove('is-active')), 5200);
      this.seen.add(id);
      $('#hint-' + id).classList.add('is-seen');
      $(`.menu-item[data-snack="${id}"]`).classList.add('is-seen');
      Audio.play(SNACK_GEOM[id].fx);
      if (id === 'combo') setTimeout(() => Audio.play('rattle'), 250);
      this.say(s.text, { title: s.name, actions: this.exitActions() });
    },
    toTheatre(skip) {
      Bubble.hide();
      Audio.play('whoosh');
      go('posters', { via: 'zoom', from: [1550, 470, skip ? 2.2 : 2.8] });
    },
    enter() {
      setTimeout(() => {
        if (STC.App.current !== 'concession') return;
        this.att.wave();
        const tag = $('#hot-conc-att');
        tag.classList.add('show-tag');
        setTimeout(() => tag.classList.remove('show-tag'), 4200);
      }, util.reduced ? 100 : 900);
    },
    leave() { Bubble.hide(); this.att.hush(); },
  };

  STC.Scenes = Object.assign(STC.Scenes || {}, { entrance: Entrance, booth: Booth, concession: Concession });
})();
