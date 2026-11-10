/* =====================================================================
   SOUND — everything is synthesized live with the Web Audio API, so there
   are no audio files to load. Nothing plays until the visitor turns sound on.

   Buses: ambience (lobby atmosphere), music (poster-wall jazz), sfx.
   STC.Audio.setScene(name) chooses which beds play for each environment.
   ===================================================================== */
(function () {
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };

  let ctx = null;
  let master, buses = {}, verb, verbSend;
  let enabled = store.get('stc-sound') === 'on';
  const levels = {
    ambience: parseFloat(store.get('stc-vol-ambience') || '0.7'),
    music: parseFloat(store.get('stc-vol-music') || '0.6'),
    sfx: 0.9,
  };
  let scene = null;
  const beds = {}; // running ambience layers
  const listeners = new Set();

  /* ---------------- setup ---------------- */
  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    // gentle vintage tone: soft top end + light compression
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 9000;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    master.connect(tone).connect(comp).connect(ctx.destination);

    verb = ctx.createConvolver();
    verb.buffer = impulse(2.4, 2.6);
    verbSend = ctx.createGain();
    verbSend.gain.value = 0.32;
    verbSend.connect(verb).connect(master);

    ['ambience', 'music', 'sfx'].forEach((name) => {
      const g = ctx.createGain();
      g.gain.value = levels[name];
      g.connect(master);
      buses[name] = g;
    });
    return ctx;
  }

  function impulse(seconds, decay) {
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  let noiseBuf = null, brownBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    const len = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  function brown() {
    if (brownBuf) return brownBuf;
    const len = ctx.sampleRate * 4;
    brownBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = brownBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.2;
    }
    return brownBuf;
  }
  function src(buf, loop) {
    const s = ctx.createBufferSource();
    s.buffer = buf;
    s.loop = !!loop;
    return s;
  }
  function filt(type, freq, q) {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    if (q) f.Q.value = q;
    return f;
  }
  function gain(v) {
    const g = ctx.createGain();
    g.gain.value = v;
    return g;
  }

  /* ---------------- ambience beds ---------------- */
  function startBed(name, build) {
    if (beds[name]) return;
    const out = gain(0);
    out.connect(buses.ambience);
    const stop = build(out);
    out.gain.setTargetAtTime(1, ctx.currentTime, 0.9);
    beds[name] = { out, stop };
  }
  function stopBed(name) {
    const b = beds[name];
    if (!b) return;
    delete beds[name];
    b.out.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
    setTimeout(() => { try { b.stop(); b.out.disconnect(); } catch (e) {} }, 2600);
  }

  const BEDS = {
    // warm room tone + distant murmur of a lobby
    lobby(out) {
      const a = src(brown(), true);
      const lp = filt('lowpass', 420);
      const g = gain(0.22);
      a.connect(lp).connect(g).connect(out);
      const b = src(noise(), true);
      const bp = filt('bandpass', 520, 0.9);
      const mg = gain(0.0);
      b.connect(bp).connect(mg).connect(out);
      // murmur swells
      let t = ctx.currentTime;
      const timer = setInterval(() => {
        const now = ctx.currentTime;
        mg.gain.setTargetAtTime(0.012 + Math.random() * 0.03, now, 0.8);
      }, 1400);
      a.start(); b.start();
      return () => { clearInterval(timer); a.stop(); b.stop(); };
    },
    // the mechanical chatter of a film projector in the booth upstairs
    projector(out) {
      const n = src(noise(), true);
      const bp = filt('bandpass', 2600, 2.5);
      const am = gain(0);
      const lvl = gain(0.05);
      n.connect(bp).connect(am).connect(lvl).connect(out);
      const lfo = ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 24;
      const depth = gain(0.5);
      lfo.connect(depth).connect(am.gain);
      const motor = ctx.createOscillator();
      motor.type = 'sawtooth';
      motor.frequency.value = 48;
      const ml = filt('lowpass', 160);
      const mg = gain(0.018);
      motor.connect(ml).connect(mg).connect(out);
      n.start(); lfo.start(); motor.start();
      return () => { n.stop(); lfo.stop(); motor.stop(); };
    },
    // a popcorn kettle: low hum + irregular pops
    popcorn(out) {
      const hum = src(brown(), true);
      const hl = filt('lowpass', 200);
      const hg = gain(0.12);
      hum.connect(hl).connect(hg).connect(out);
      hum.start();
      let alive = true;
      const tick = () => {
        if (!alive) return;
        const burst = Math.random() < 0.3 ? 3 + Math.floor(Math.random() * 4) : 1;
        for (let i = 0; i < burst; i++) pop(out, 0.12 + Math.random() * 0.1, ctx.currentTime + i * (0.04 + Math.random() * 0.12));
        setTimeout(tick, 180 + Math.random() * 900);
      };
      tick();
      return () => { alive = false; hum.stop(); };
    },
  };

  function pop(dest, vol, when) {
    if (!ctx) return;
    const t = when || ctx.currentTime;
    const s = src(noise());
    const bp = filt('bandpass', 900 + Math.random() * 1600, 4);
    const g = gain(0);
    s.connect(bp).connect(g).connect(dest || buses.sfx);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol || 0.5, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 0.05);
    s.start(t, Math.random());
    s.stop(t + 0.07);
  }

  /* ---------------- jazz trio (poster wall) ---------------- */
  const Jazz = (() => {
    const BPM = 88;
    const beat = 60 / BPM;
    // ii–V–I in F with a turnaround, as MIDI voicings (rootless piano + bass roots)
    const BARS = [
      { root: 41, chord: [57, 60, 64, 69] }, // Fmaj9
      { root: 50, chord: [57, 60, 65, 69] }, // Dm9
      { root: 43, chord: [58, 62, 65, 69] }, // Gm9
      { root: 48, chord: [58, 62, 64, 69] }, // C13
      { root: 45, chord: [55, 60, 64, 67] }, // Am7
      { root: 50, chord: [54, 60, 63, 66] }, // D7b9
      { root: 43, chord: [58, 62, 65, 69] }, // Gm9
      { root: 48, chord: [58, 62, 64, 70] }, // C7
    ];
    const SCALE = [65, 67, 69, 70, 72, 74, 76, 77, 79, 81];
    let out = null, timer = null, nextTime = 0, step = 0, running = false;
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

    function keys(notes, t, len, vel) {
      notes.forEach((m) => {
        const o = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        o.type = 'sine'; o2.type = 'sine';
        o.frequency.value = hz(m);
        o2.frequency.value = hz(m) * 2.001;
        const g = gain(0), g2 = gain(0.18);
        o2.connect(g2).connect(g);
        o.connect(g);
        g.connect(out); g.connect(verbSend);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.05 * vel, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.022 * vel, t + 0.35);
        g.gain.exponentialRampToValueAtTime(0.0005, t + len);
        o.start(t); o2.start(t); o.stop(t + len + 0.05); o2.stop(t + len + 0.05);
      });
    }
    function bass(m, t) {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = hz(m);
      const lp = filt('lowpass', 520);
      const g = gain(0);
      o.connect(lp).connect(g).connect(out);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.32, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.25);
      g.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.95);
      o.start(t); o.stop(t + beat);
    }
    function ride(t, v) {
      const s = src(noise());
      const hp = filt('highpass', 7000);
      const bp = filt('bandpass', 9500, 1.2);
      const g = gain(0);
      s.connect(hp).connect(bp).connect(g).connect(out);
      g.gain.setValueAtTime(0.05 * v, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      s.start(t, Math.random()); s.stop(t + 0.25);
    }
    function brush(t) {
      const s = src(noise());
      const bp = filt('bandpass', 2400, 0.7);
      const g = gain(0);
      s.connect(bp).connect(g).connect(out);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.03, t + 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      s.start(t, Math.random()); s.stop(t + 0.32);
    }
    function vibes(m, t) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = hz(m + 12);
      const trem = ctx.createOscillator();
      trem.frequency.value = 5.5;
      const td = gain(0.3);
      const g = gain(0);
      trem.connect(td).connect(g.gain);
      o.connect(g); g.connect(out); g.connect(verbSend);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.045, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
      o.start(t); trem.start(t); o.stop(t + 1.2); trem.stop(t + 1.2);
    }

    let lastBass = 41, melodyIdx = 4;
    function schedule() {
      while (nextTime < ctx.currentTime + 0.25) {
        const bar = BARS[Math.floor(step / 8) % BARS.length];
        const nextBar = BARS[(Math.floor(step / 8) + 1) % BARS.length];
        const e = step % 8; // eighth notes in the bar
        const swing = e % 2 === 1 ? beat * 0.16 : 0;
        const t = nextTime + swing;
        // walking bass on quarters
        if (e % 2 === 0) {
          const q = e / 2;
          let m;
          if (q === 0) m = bar.root;
          else if (q === 3) m = nextBar.root + (Math.random() < 0.5 ? -1 : 1); // chromatic approach
          else m = bar.root + [0, 3, 7, 10, 12][Math.floor(Math.random() * 5)] - (Math.random() < 0.3 ? 12 : 0);
          while (m < 36) m += 12;
          while (m > 55) m -= 12;
          bass(m, t);
          lastBass = m;
        }
        // ride: ding, ding-da, ding, ding-da
        if (e % 2 === 0) ride(t, e % 4 === 0 ? 1 : 0.8);
        if (e === 3 || e === 7) ride(t, 0.55);
        if (e === 2 || e === 6) brush(t);
        // Charleston comp
        if (e === 0) keys(bar.chord, t, beat * 1.4, 0.9);
        if (e === 3 && Math.random() < 0.75) keys(bar.chord, t, beat * 1.6, 0.7);
        // sparse vibraphone line
        if (Math.random() < (e % 2 === 0 ? 0.32 : 0.16)) {
          melodyIdx = Math.max(0, Math.min(SCALE.length - 1, melodyIdx + [-2, -1, 1, 2, 0][Math.floor(Math.random() * 5)]));
          vibes(SCALE[melodyIdx] - 12, t);
        }
        nextTime += beat / 2;
        step++;
      }
    }
    return {
      start() {
        if (running || !ctx) return;
        running = true;
        out = gain(0);
        out.connect(buses.music);
        out.gain.setTargetAtTime(1, ctx.currentTime, 1.2);
        nextTime = ctx.currentTime + 0.1;
        step = 0;
        timer = setInterval(schedule, 40);
      },
      stop(fast) {
        if (!running) return;
        running = false;
        const o = out;
        o.gain.setTargetAtTime(0, ctx.currentTime, fast ? 0.15 : 0.7);
        setTimeout(() => { clearInterval(timer); try { o.disconnect(); } catch (e) {} }, fast ? 700 : 2800);
      },
      get running() { return running; },
    };
  })();

  /* ---------------- scene mapping ---------------- */
  const SCENE_BEDS = {
    entrance: ['lobby', 'projector'],
    booth: ['lobby', 'projector'],
    concession: ['lobby', 'popcorn'],
    posters: ['lobby'],
    closeup: ['lobby'],
    feature: [],
    director: [],
  };
  const SCENE_MUSIC = { posters: true, closeup: true };

  function applyScene() {
    if (!ctx || !enabled) return;
    const want = SCENE_BEDS[scene] || [];
    Object.keys(beds).forEach((b) => { if (!want.includes(b)) stopBed(b); });
    want.forEach((b) => startBed(b, BEDS[b]));
    // the lobby bed sits lower under the music
    if (beds.lobby) beds.lobby.out.gain.setTargetAtTime(SCENE_MUSIC[scene] ? 0.45 : 1, ctx.currentTime, 0.8);
    if (SCENE_MUSIC[scene]) Jazz.start(); else Jazz.stop();
  }

  /* ---------------- one-shot effects ---------------- */
  const FX = {
    click() {
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(1500, t);
      o.frequency.exponentialRampToValueAtTime(600, t + 0.04);
      const g = gain(0);
      o.connect(g).connect(buses.sfx);
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      o.start(t); o.stop(t + 0.07);
    },
    curtain() {
      const t = ctx.currentTime;
      const s = src(noise());
      const bp = filt('bandpass', 700, 0.6);
      const g = gain(0);
      s.connect(bp).connect(g).connect(buses.sfx);
      bp.frequency.setValueAtTime(500, t);
      bp.frequency.linearRampToValueAtTime(1400, t + 0.7);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.16, t + 0.25);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
      s.start(t, Math.random()); s.stop(t + 1.2);
    },
    whoosh() {
      const t = ctx.currentTime;
      const s = src(noise());
      const bp = filt('bandpass', 300, 0.8);
      const g = gain(0);
      s.connect(bp).connect(g).connect(buses.sfx);
      g.connect(verbSend);
      bp.frequency.setValueAtTime(250, t);
      bp.frequency.exponentialRampToValueAtTime(2200, t + 1.1);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.6);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      s.start(t, Math.random()); s.stop(t + 1.6);
    },
    bell() {
      const t = ctx.currentTime;
      [1, 2.76, 5.4].forEach((mult, i) => {
        const o = ctx.createOscillator();
        o.frequency.value = 1320 * mult;
        const g = gain(0);
        o.connect(g).connect(buses.sfx);
        g.connect(verbSend);
        g.gain.setValueAtTime(0.12 / (i + 1), t);
        g.gain.exponentialRampToValueAtTime(0.0005, t + 1.4 / (i + 1));
        o.start(t); o.stop(t + 1.5);
      });
    },
    ticket() {
      // motor + rapid dot-matrix clatter + a final tear
      const t = ctx.currentTime;
      const m = ctx.createOscillator();
      m.type = 'sawtooth';
      m.frequency.value = 95;
      const ml = filt('lowpass', 400);
      const mg = gain(0);
      m.connect(ml).connect(mg).connect(buses.sfx);
      mg.gain.setValueAtTime(0, t);
      mg.gain.linearRampToValueAtTime(0.07, t + 0.05);
      mg.gain.setValueAtTime(0.07, t + 1.45);
      mg.gain.linearRampToValueAtTime(0, t + 1.55);
      m.start(t); m.stop(t + 1.6);
      for (let i = 0; i < 34; i++) {
        const tt = t + 0.05 + i * 0.042 + Math.random() * 0.008;
        const s = src(noise());
        const bp = filt('bandpass', 3200 + Math.random() * 800, 6);
        const g = gain(0);
        s.connect(bp).connect(g).connect(buses.sfx);
        g.gain.setValueAtTime(0.32, tt);
        g.gain.exponentialRampToValueAtTime(0.001, tt + 0.02);
        s.start(tt, Math.random()); s.stop(tt + 0.03);
      }
      const tear = src(noise());
      const hp = filt('highpass', 2500);
      const tg = gain(0);
      tear.connect(hp).connect(tg).connect(buses.sfx);
      tg.gain.setValueAtTime(0, t + 1.6);
      tg.gain.linearRampToValueAtTime(0.18, t + 1.63);
      tg.gain.exponentialRampToValueAtTime(0.001, t + 1.82);
      tear.start(t + 1.6, Math.random()); tear.stop(t + 1.9);
    },
    pop() { pop(buses.sfx, 0.5); },
    popBurst() { for (let i = 0; i < 6; i++) pop(buses.sfx, 0.35, ctx.currentTime + i * (0.05 + Math.random() * 0.09)); },
    fizz() {
      const t = ctx.currentTime;
      const s = src(noise());
      const hp = filt('highpass', 5000);
      const g = gain(0);
      s.connect(hp).connect(g).connect(buses.sfx);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.09, t + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      s.start(t, Math.random()); s.stop(t + 1);
      for (let i = 0; i < 10; i++) pop(buses.sfx, 0.06, t + Math.random() * 0.8);
    },
    rattle() {
      const t = ctx.currentTime;
      for (let i = 0; i < 14; i++) {
        const tt = t + i * 0.03 + Math.random() * 0.02;
        const o = ctx.createOscillator();
        o.type = 'square';
        o.frequency.value = 1800 + Math.random() * 1400;
        const g = gain(0);
        o.connect(g).connect(buses.sfx);
        g.gain.setValueAtTime(0.03, tt);
        g.gain.exponentialRampToValueAtTime(0.0005, tt + 0.025);
        o.start(tt); o.stop(tt + 0.03);
      }
    },
    beep() {
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.frequency.value = 1000;
      const g = gain(0);
      o.connect(g).connect(buses.sfx);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.22, t + 0.005);
      g.gain.setValueAtTime(0.22, t + 0.16);
      g.gain.linearRampToValueAtTime(0, t + 0.18);
      o.start(t); o.stop(t + 0.2);
    },
    projectorStart() {
      const t = ctx.currentTime;
      const n = src(noise());
      const bp = filt('bandpass', 2400, 2.5);
      const am = gain(0);
      const lvl = gain(0);
      n.connect(bp).connect(am).connect(lvl).connect(buses.sfx);
      const lfo = ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.setValueAtTime(4, t);
      lfo.frequency.exponentialRampToValueAtTime(24, t + 1.6);
      const d = gain(0.5);
      lfo.connect(d).connect(am.gain);
      lvl.gain.setValueAtTime(0, t);
      lvl.gain.linearRampToValueAtTime(0.12, t + 0.4);
      lvl.gain.setValueAtTime(0.12, t + 4.2);
      lvl.gain.linearRampToValueAtTime(0, t + 5);
      n.start(t); lfo.start(t); n.stop(t + 5.1); lfo.stop(t + 5.1);
    },
    reel() {
      // ratchet tick while the reel spins
      const t = ctx.currentTime;
      const s = src(noise());
      const bp = filt('bandpass', 4200, 8);
      const g = gain(0);
      s.connect(bp).connect(g).connect(buses.sfx);
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
      s.start(t, Math.random()); s.stop(t + 0.02);
    },
  };

  /* ---------------- public API ---------------- */
  const Audio = {
    get enabled() { return enabled; },
    get supported() { return !!(window.AudioContext || window.webkitAudioContext); },
    levels,
    setEnabled(on) {
      enabled = !!on;
      store.set('stc-sound', enabled ? 'on' : 'off');
      if (enabled) {
        if (!ensure()) return;
        ctx.resume && ctx.resume();
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(1, ctx.currentTime, 0.4);
        applyScene();
      } else if (ctx) {
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
        setTimeout(() => {
          if (enabled) return;
          Object.keys(beds).forEach(stopBed);
          Jazz.stop(true);
        }, 600);
      }
      listeners.forEach((fn) => fn());
    },
    setLevel(bus, v) {
      levels[bus] = v;
      store.set('stc-vol-' + bus, String(v));
      if (buses[bus]) buses[bus].gain.setTargetAtTime(v, ctx.currentTime, 0.1);
      listeners.forEach((fn) => fn());
    },
    setScene(name) {
      scene = name;
      applyScene();
    },
    stopMusic(fast) { if (ctx) Jazz.stop(fast); },
    play(name) {
      if (!enabled || !ctx || !FX[name]) return;
      try { FX[name](); } catch (e) {}
    },
    onChange(fn) { listeners.add(fn); },
  };

  window.STC = window.STC || {};
  window.STC.Audio = Audio;
})();
