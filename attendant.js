/* =====================================================================
   The cinema attendant — an original vintage-intermission style character.
   Drawn as inline SVG so she stays crisp at any size and can be animated.
   STC.Attendant.create(outfit)  → outfit: 'ticket' | 'concession'
   ===================================================================== */
(function () {
  const INK = '#2a140d';

  function curls(list, fill, stroke) {
    return list
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>`)
      .join('');
  }
  function curlSwirls(list) {
    // little spiral highlights that give the curls a hand-drawn, printed feel
    return list
      .map(([x, y, r]) => `<path d="M${(x + r * 0.15).toFixed(1)} ${(y + r * 0.05).toFixed(1)} a${(r * 0.32).toFixed(1)} ${(r * 0.32).toFixed(1)} 0 1 1 ${(-r * 0.5).toFixed(1)} ${(-r * 0.25).toFixed(1)} a${(r * 0.55).toFixed(1)} ${(r * 0.55).toFixed(1)} 0 0 1 ${(r * 0.95).toFixed(1)} ${(-r * 0.1).toFixed(1)}" fill="none" stroke="#8a5634" stroke-width="1.3" stroke-linecap="round" opacity=".8"/>`)
      .join('');
  }

  // deterministic pseudo-random so she looks the same every visit
  function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }
  function buildHair() {
    const r = rng(7);
    const back = [];
    // crown and sides: curls around a soft oval silhouette
    for (let i = 0; i <= 26; i++) {
      const a = Math.PI * (1.02 + (i / 26) * 0.96);
      back.push([150 + Math.cos(a) * (66 + r() * 6), 104 + Math.sin(a) * (62 + r() * 6), 11 + r() * 5]);
    }
    // shoulder-length cascade on both sides
    for (let k = 0; k < 2; k++) {
      const side = k ? 1 : -1;
      for (let i = 0; i < 9; i++) {
        back.push([150 + side * (60 + r() * 14 - i * 1.2), 112 + i * 10 + r() * 4, 11 + r() * 4]);
        if (i > 1) back.push([150 + side * (44 + r() * 8), 128 + i * 9 + r() * 4, 10 + r() * 3]);
      }
    }
    // inner fill curls so there are no gaps
    for (let i = 0; i < 16; i++) back.push([96 + r() * 108, 52 + r() * 40, 12 + r() * 5]);
    const front = [];
    for (let i = 0; i < 9; i++) front.push([108 + i * 10.5 + r() * 3, 70 + Math.abs(i - 4) * 2.4 + r() * 4, 8.5 + r() * 3]);
    front.push([101, 92, 9], [199, 92, 9], [97, 110, 8], [203, 110, 8]);
    return { back, front };
  }
  const HAIR = buildHair();
  const HAIR_BACK = HAIR.back;
  const HAIR_FRONT = HAIR.front;

  function face() {
    return `
    <g class="att-head">
      <g class="att-hairback"><path d="M86 120 Q80 50 150 40 Q220 50 214 120 L216 196 Q186 206 170 190 L130 190 Q114 206 84 196Z" fill="#3a1f14"/>${curls(HAIR_BACK, 'url(#attHair)', INK)}${curlSwirls(HAIR_BACK)}</g>
      <!-- neck -->
      <path d="M136 156 L136 190 Q150 198 164 190 L164 156 Z" fill="url(#attSkin)" stroke="${INK}" stroke-width="2"/>
      <path d="M136 172 Q150 182 164 172 L164 162 L136 162Z" fill="#c98d6a" opacity=".55"/>
      <!-- earrings -->
      <circle cx="104" cy="134" r="4.2" fill="#f4e6c4" stroke="${INK}" stroke-width="1.2"/>
      <circle cx="196" cy="134" r="4.2" fill="#f4e6c4" stroke="${INK}" stroke-width="1.2"/>
      <!-- face -->
      <ellipse cx="150" cy="118" rx="44" ry="51" fill="url(#attSkin)" stroke="${INK}" stroke-width="2.2"/>
      <ellipse cx="150" cy="150" rx="30" ry="14" fill="#d79a75" opacity=".22"/>
      <!-- cheeks -->
      <ellipse class="att-cheek" cx="122" cy="134" rx="10" ry="7" fill="#e67d72" opacity=".42"/>
      <ellipse class="att-cheek" cx="178" cy="134" rx="10" ry="7" fill="#e67d72" opacity=".42"/>
      <!-- brows -->
      <g class="att-brows">
        <path d="M118 97 Q130 88 142 95" fill="none" stroke="#3a2015" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M158 95 Q170 88 182 97" fill="none" stroke="#3a2015" stroke-width="3.2" stroke-linecap="round"/>
      </g>
      <!-- eyes -->
      <g class="att-eyes">
        <g>
          <path d="M119 114 Q130 104 141 114 Q130 121 119 114Z" fill="#fffaf0" stroke="${INK}" stroke-width="1.6"/>
          <circle class="att-iris" cx="130" cy="113.5" r="5.6" fill="#3b2216"/>
          <circle cx="131.8" cy="111.6" r="1.7" fill="#fff"/>
          <path d="M117.5 113.5 Q130 101 142.5 112.5" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
          <path d="M119 111 l-4 -3 M122 107.5 l-3 -4" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
        </g>
        <g>
          <path d="M159 114 Q170 104 181 114 Q170 121 159 114Z" fill="#fffaf0" stroke="${INK}" stroke-width="1.6"/>
          <circle class="att-iris" cx="170" cy="113.5" r="5.6" fill="#3b2216"/>
          <circle cx="171.8" cy="111.6" r="1.7" fill="#fff"/>
          <path d="M157.5 112.5 Q170 101 182.5 113.5" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
          <path d="M181 111 l4 -3 M178 107.5 l3 -4" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
        </g>
      </g>
      <!-- nose -->
      <path d="M150 118 Q146 131 151 134 Q154 135 156 133" fill="none" stroke="#a8603f" stroke-width="2" stroke-linecap="round"/>
      <!-- beauty mark -->
      <circle cx="171" cy="146" r="1.4" fill="#4a2618"/>
      <!-- mouth -->
      <g class="att-mouth att-mouth-closed">
        <path d="M134 145 Q150 159 166 145 Q150 153 134 145Z" fill="#b1323e" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M131 144 q3 -1 4 1 M169 144 q-3 -1 -4 1" stroke="${INK}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      </g>
      <g class="att-mouth att-mouth-open">
        <path d="M135 144 Q150 141 165 144 Q162 164 150 165 Q138 164 135 144Z" fill="#5a1418" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M138 145 Q150 143 162 145 L161 149 Q150 147.5 139 149Z" fill="#fff8ee"/>
        <ellipse cx="150" cy="159" rx="7" ry="3.5" fill="#d0565e"/>
        <path d="M135 144 Q150 139 165 144" fill="none" stroke="#b1323e" stroke-width="3" stroke-linecap="round"/>
      </g>
      <g class="att-hairfront">${curls(HAIR_FRONT, 'url(#attHair)', INK)}${curlSwirls(HAIR_FRONT)}</g>
    </g>`;
  }

  function hat(outfit) {
    if (outfit === 'concession') {
      // folded paper soda-fountain cap
      return `
      <g class="att-hat" transform="rotate(-6 150 52)">
        <path d="M96 64 L110 34 Q150 22 190 34 L204 64 Q150 54 96 64Z" fill="#fbf3e2" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M100 56 Q150 46 200 56 L202 61 Q150 51 98 61Z" fill="#7a1a28"/>
        <path d="M110 34 Q150 22 190 34 L184 40 Q150 30 116 40Z" fill="#e9dcc0"/>
        <text x="150" y="49" text-anchor="middle" font-family="Limelight, Georgia, serif" font-size="10" fill="#7a1a28" letter-spacing="1">STC</text>
      </g>`;
    }
    // ticket-booth pillbox hat with a brass band and star
    return `
    <g class="att-hat" transform="rotate(10 176 50)">
      <path d="M142 48 Q142 32 176 30 Q210 32 210 48 L210 62 Q176 68 142 62Z" fill="url(#attWine)" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="176" cy="32" rx="33" ry="7" fill="#8e2235" stroke="${INK}" stroke-width="1.8"/>
      <path d="M142 54 Q176 60 210 54 L210 60 Q176 66 142 60Z" fill="url(#attBrass)"/>
      <path d="M176 38 l2.6 5.4 5.9 .8 -4.3 4.1 1 5.8 -5.2 -2.8 -5.2 2.8 1 -5.8 -4.3 -4.1 5.9 -.8z" fill="url(#attBrass)" stroke="${INK}" stroke-width=".8"/>
    </g>`;
  }

  function body(outfit) {
    if (outfit === 'concession') {
      return `
      <g class="att-body">
        <path d="M28 400 Q30 248 86 218 Q122 200 138 190 L162 190 Q178 200 214 218 Q270 248 272 400Z" fill="url(#attStripe)" stroke="${INK}" stroke-width="2.2"/>
        <!-- apron bib -->
        <path d="M112 236 L188 236 L194 400 L106 400Z" fill="#fbf3e2" stroke="${INK}" stroke-width="2"/>
        <path d="M112 236 L120 206 M188 236 L180 206" stroke="#fbf3e2" stroke-width="7" stroke-linecap="round"/>
        <path d="M112 236 L120 206 M188 236 L180 206" stroke="${INK}" stroke-width="1.2" fill="none" opacity=".5"/>
        <rect x="126" y="262" width="48" height="26" rx="4" fill="none" stroke="#7a1a28" stroke-width="2"/>
        <text x="150" y="280" text-anchor="middle" font-family="Limelight, Georgia, serif" font-size="11" fill="#7a1a28">SNACKS</text>
        <!-- collar & bow tie -->
        <path d="M134 190 L150 206 L166 190 L172 200 L150 216 L128 200Z" fill="#fbf3e2" stroke="${INK}" stroke-width="1.6"/>
        <g class="att-bow">
          <path d="M150 208 L132 199 L132 219 Z M150 208 L168 199 L168 219Z" fill="#7a1a28" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
          <circle cx="150" cy="208.5" r="4.2" fill="#9b2638" stroke="${INK}" stroke-width="1.4"/>
        </g>
      </g>`;
    }
    return `
    <g class="att-body">
      <path d="M28 400 Q30 248 86 218 Q122 200 138 190 L162 190 Q178 200 214 218 Q270 248 272 400Z" fill="url(#attWine)" stroke="${INK}" stroke-width="2.2"/>
      <!-- epaulettes -->
      <path d="M66 226 Q84 212 104 214 L104 224 Q84 224 70 236Z" fill="url(#attBrass)" stroke="${INK}" stroke-width="1.4"/>
      <path d="M234 226 Q216 212 196 214 L196 224 Q216 224 230 236Z" fill="url(#attBrass)" stroke="${INK}" stroke-width="1.4"/>
      <!-- lapels with brass piping -->
      <path d="M138 192 L150 252 L162 192" fill="none" stroke="#d9b56c" stroke-width="3"/>
      <path d="M150 252 L150 400" stroke="#3d0b13" stroke-width="2"/>
      <!-- Peter Pan collar -->
      <path d="M150 198 Q132 216 116 204 Q120 192 138 190Z M150 198 Q168 216 184 204 Q180 192 162 190Z" fill="#fbf3e2" stroke="${INK}" stroke-width="1.6"/>
      <!-- buttons -->
      ${[268, 292, 316, 340, 364].map((y) => `<circle cx="138" cy="${y}" r="4.2" fill="url(#attBrass)" stroke="${INK}" stroke-width="1"/><circle cx="162" cy="${y}" r="4.2" fill="url(#attBrass)" stroke="${INK}" stroke-width="1"/>`).join('')}
      <!-- name badge -->
      <rect x="186" y="248" width="34" height="14" rx="3" fill="url(#attBrass)" stroke="${INK}" stroke-width="1.2"/>
      <text x="203" y="258.5" text-anchor="middle" font-family="Josefin Sans, Arial, sans-serif" font-size="7.5" font-weight="700" fill="#3d0b13" letter-spacing=".8">USHER</text>
    </g>`;
  }

  function wavingArm() {
    return `
    <g class="att-arm">
      <path d="M222 262 Q244 238 252 206" fill="none" stroke="${INK}" stroke-width="27" stroke-linecap="round"/>
      <path d="M222 262 Q244 238 252 206" fill="none" stroke="url(#attStripeV)" stroke-width="23" stroke-linecap="round"/>
      <g class="att-forearm">
        <path d="M252 206 Q258 178 262 156" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
        <path d="M252 206 Q258 178 262 156" fill="none" stroke="url(#attSkin)" stroke-width="16" stroke-linecap="round"/>
        <g transform="translate(263 140)">
          <ellipse cx="0" cy="0" rx="13" ry="15" fill="url(#attSkin)" stroke="${INK}" stroke-width="2"/>
          <path d="M-9 -10 l-3 -14 M-3 -13 l-1 -16 M3 -13 l1 -15 M9 -10 l3 -12" stroke="${INK}" stroke-width="7.5" stroke-linecap="round"/>
          <path d="M-9 -10 l-3 -14 M-3 -13 l-1 -16 M3 -13 l1 -15 M9 -10 l3 -12" stroke="#f0c6a3" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M-12 2 q-9 -4 -10 -12" stroke="${INK}" stroke-width="7.5" stroke-linecap="round" fill="none"/>
          <path d="M-12 2 q-9 -4 -10 -12" stroke="#f0c6a3" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        </g>
      </g>
    </g>`;
  }

  function defs(uid) {
    return `
    <defs>
      <linearGradient id="attSkin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f6d2b2"/><stop offset="1" stop-color="#e3a985"/>
      </linearGradient>
      <radialGradient id="attHair" cx=".35" cy=".3" r=".8">
        <stop offset="0" stop-color="#6b3e24"/><stop offset=".6" stop-color="#46251a"/><stop offset="1" stop-color="#2c160f"/>
      </radialGradient>
      <linearGradient id="attWine" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8f2236"/><stop offset=".55" stop-color="#6c1426"/><stop offset="1" stop-color="#440a17"/>
      </linearGradient>
      <linearGradient id="attBrass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f6dc96"/><stop offset=".5" stop-color="#c99a4b"/><stop offset="1" stop-color="#8a6024"/>
      </linearGradient>
      <pattern id="attStripe" width="18" height="10" patternUnits="userSpaceOnUse">
        <rect width="18" height="10" fill="#fbf3e2"/><rect width="9" height="10" fill="#8a2234"/>
      </pattern>
      <pattern id="attStripeV" width="10" height="18" patternUnits="userSpaceOnUse">
        <rect width="10" height="18" fill="#fbf3e2"/><rect width="10" height="9" fill="#8a2234"/>
      </pattern>
    </defs>`;
  }

  function create(outfit) {
    const wrap = document.createElement('div');
    wrap.className = `attendant attendant--${outfit}`;
    wrap.innerHTML = `
      <svg class="att-svg" viewBox="0 0 300 400" aria-hidden="true" focusable="false">
        ${defs()}
        <g class="att-root">
          ${body(outfit)}
          ${outfit === 'concession' ? wavingArm() : ''}
          ${face()}
          ${hat(outfit)}
        </g>
      </svg>`;
    // gradients/patterns need unique ids per instance
    const svg = wrap.querySelector('svg');
    const uid = 'a' + Math.random().toString(36).slice(2, 7);
    svg.querySelectorAll('[id]').forEach((el) => {
      const old = el.id;
      el.id = uid + old;
      svg.querySelectorAll('*').forEach((n) => {
        ['fill', 'stroke'].forEach((attr) => {
          if (n.getAttribute(attr) === `url(#${old})`) n.setAttribute(attr, `url(#${uid + old})`);
        });
      });
    });

    let talkTimer = null;
    let blinkTimer = null;
    const api = {
      el: wrap,
      talk(ms) {
        clearInterval(talkTimer);
        wrap.classList.add('is-talking');
        talkTimer = setInterval(() => wrap.classList.toggle('mouth-open', Math.random() > 0.38), 110);
        clearTimeout(api._stop);
        api._stop = setTimeout(api.hush, ms || 2400);
      },
      hush() {
        clearInterval(talkTimer);
        wrap.classList.remove('is-talking', 'mouth-open');
      },
      wave() {
        wrap.classList.remove('is-waving');
        void wrap.offsetWidth;
        wrap.classList.add('is-waving');
      },
    };
    // natural, irregular blinking
    const blink = () => {
      wrap.classList.add('is-blinking');
      setTimeout(() => wrap.classList.remove('is-blinking'), 140);
      blinkTimer = setTimeout(blink, 2200 + Math.random() * 3600);
    };
    blinkTimer = setTimeout(blink, 1500);
    return api;
  }

  window.STC = window.STC || {};
  window.STC.Attendant = { create };
})();
