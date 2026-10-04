// Side-view (sagittal) animations of the exercises.
// Tongue, soft palate and jaw are driven by keyframed poses; everything else is static anatomy.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const JAW_PIVOT = [196, 124];

  // Tongue outline: 10 points, clockwise from the tip, in the jaw's frame of reference.
  const T = {
    rest:      [[250,156],[238,146],[214,141],[190,147],[172,162],[163,185],[166,210],[190,218],[226,200],[246,172]],
    tipUp:     [[253,146],[241,138],[214,138],[190,146],[172,162],[163,185],[166,210],[190,218],[226,200],[248,166]],
    tipBack:   [[212,134],[200,137],[186,146],[173,159],[164,181],[162,202],[168,214],[198,217],[234,196],[238,162]],
    low:       [[252,168],[236,163],[212,161],[190,164],[172,175],[163,193],[166,212],[190,218],[226,202],[248,180]],
    out:       [[306,166],[282,159],[244,154],[206,153],[180,166],[167,192],[170,212],[196,218],[240,192],[282,175]]
  };
  // Soft palate: open curve from the end of the hard palate to the uvula.
  const SP = {
    rest: [[190,132],[176,138],[166,149],[161,161]],
    up:   [[190,132],[176,129],[163,126],[153,128]]
  };

  const EX = {
    scivola: {
      cycle: 2.4,
      caption: "La punta parte dietro gli incisivi e scivola indietro lungo il palato, premendo.",
      frames: [[0, { t: "tipUp" }], [0.15, { t: "tipUp" }], [0.6, { t: "tipBack" }], [0.75, { t: "tipBack" }], [1, { t: "tipUp" }]],
      arrow: "M246 128 C 232 120 214 120 204 124"
    },
    a_scatti: {
      cycle: 1.6,
      caption: "Bocca aperta, lingua bassa. A ogni «A» il palato molle e l'ugola si alzano e chiudono il passaggio verso il naso.",
      frames: [[0, { t: "low", jaw: 11, sp: 0 }], [0.15, { t: "low", jaw: 11, sp: 1, say: 1 }], [0.45, { t: "low", jaw: 11, sp: 1, say: 1 }], [0.6, { t: "low", jaw: 11, sp: 0 }], [1, { t: "low", jaw: 11, sp: 0 }]],
      say: "A!",
      arrow: "M172 166 C 160 156 156 144 160 134"
    },
    fuori: {
      cycle: 4,
      caption: "Lingua fuori il più possibile, dritta e tesa, senza appoggiarla alle labbra. Mantieni.",
      frames: [[0, { t: "rest" }], [0.18, { t: "out", jaw: 9 }], [0.8, { t: "out", jaw: 9 }], [1, { t: "rest" }]],
      arrow: "M268 198 L 304 198"
    }
  };

  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const mixPts = (A, B, k) => A.map((p, i) => [lerp(p[0], B[i][0], k), lerp(p[1], B[i][1], k)]);
  const f = n => n.toFixed(1);

  function closedSpline(P) {
    const n = P.length; let d = `M${f(P[0][0])} ${f(P[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + "Z";
  }
  function openSpline(P) {
    let d = `M${f(P[0][0])} ${f(P[0][1])}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d;
  }

  function pose(def, time) {
    const k = (time % def.cycle) / def.cycle;
    const fr = def.frames;
    let i = 0; while (i < fr.length - 2 && k >= fr[i + 1][0]) i++;
    const [ta, a] = fr[i], [tb, b] = fr[i + 1];
    const m = ease(tb > ta ? Math.min(1, Math.max(0, (k - ta) / (tb - ta))) : 0);
    return {
      tongue: mixPts(T[a.t || "rest"], T[b.t || "rest"], m),
      sp: lerp(a.sp || 0, b.sp || 0, m),
      jaw: lerp(a.jaw || 0, b.jaw || 0, m),
      say: lerp(a.say || 0, b.say || 0, m)
    };
  }

  const STATIC = `
    <path class="a-mouth" d="M274 157 L279 172 L250 192 L204 166 Z"/>
    <path class="a-skin" d="M222 300 L222 238 L200 236 L198 158 L274 158 C 279 155 283 152 281 149 C 279 142 274 137 272 134 C 278 134 284 133 286 131 C 296 128 304 124 302 118 C 292 104 280 96 270 88 C 270 80 268 72 266 62 C 266 40 258 22 240 12 C 200 -6 120 -4 84 34 C 56 64 52 112 66 150 C 76 180 98 206 108 236 C 112 260 114 280 114 300 Z"/>
    <g class="a-bone">
      <rect x="112" y="150" width="26" height="20" rx="5"/><rect x="112" y="176" width="26" height="20" rx="5"/>
      <rect x="113" y="202" width="26" height="20" rx="5"/><rect x="114" y="228" width="26" height="20" rx="5"/>
      <rect x="115" y="254" width="26" height="20" rx="5"/>
    </g>
    <path class="a-air" d="M262 135 L190 132 L162 124 L150 116 L147 270 L170 270 L172 240 L182 226 L206 222 L254 176 Z"/>
    <path class="a-nose" d="M268 120 C 252 102 206 98 168 106 L156 116 L164 126 L190 130 L262 132 C 268 130 270 126 268 120 Z"/>
    <path class="a-wall" d="M151 104 C 148 150 146 210 147 270"/>
    <path class="a-tissue-line" d="M168 214 C 162 206 158 198 158 190" />
    <path class="a-cart" d="M178 236 L190 238 L192 262 L176 262 Z"/>
    <path class="a-fold" d="M158 248 L176 248"/>
    <path class="a-palate-bone" d="M258 137 C 246 129 216 128 190 132"/>
    <path class="a-sp" data-sp d=""/>
    <g data-jaw>
      <path class="a-skin" d="M274 158 C 284 161 285 170 277 176 C 282 188 281 204 268 212 C 252 222 234 228 222 238 L204 238 L204 200 L252 176 L268 162 Z"/>
      <path class="a-jawbone" d="M255 176 C 262 186 264 200 259 210 C 252 214 245 211 242 203 C 240 193 246 183 251 176 Z"/>
      <ellipse class="a-jawbone" cx="190" cy="224" rx="7" ry="3.5"/>
      <path class="a-tooth" d="M253 160 L263 160 L262 176 L256 178 Z"/>
      <path class="a-tongue" data-tongue d=""/>
    </g>
    <path class="a-tooth" d="M255 136 L265 137 L264 154 L257 152 Z"/>
    <path class="a-arrow" data-arrow d=""/>
    <text class="a-say" data-say x="292" y="200"></text>`;

  function mount(el, id) {
    const def = EX[id]; if (!def || !el) return null;
    el.innerHTML = `<svg viewBox="40 0 280 300" role="img" aria-label="Animazione dell'esercizio vista di lato">${STATIC}</svg>`;
    const svg = el.firstElementChild;
    const tongue = svg.querySelector("[data-tongue]"), sp = svg.querySelector("[data-sp]"), jaw = svg.querySelector("[data-jaw]"), say = svg.querySelector("[data-say]");
    svg.querySelector("[data-arrow]").setAttribute("d", def.arrow || "");
    say.textContent = def.say || "";
    const draw = time => {
      const p = pose(def, time);
      tongue.setAttribute("d", closedSpline(p.tongue));
      sp.setAttribute("d", openSpline(mixPts(SP.rest, SP.up, p.sp)));
      jaw.setAttribute("transform", `rotate(${f(p.jaw)} ${JAW_PIVOT[0]} ${JAW_PIVOT[1]})`);
      say.style.opacity = f(p.say);
    };
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, t0 = performance.now(), alive = true;
    const loop = now => { if (!alive) return; draw((now - t0) / 1000); raf = requestAnimationFrame(loop); };
    if (reduce) {
      // show the key position instead of motion
      const peak = def.frames.reduce((best, fr) => (fr[1].t && fr[1].t !== "rest" ? fr : best), def.frames[0]);
      draw(peak[0] * def.cycle + 0.001);
    } else raf = requestAnimationFrame(loop);
    return { caption: def.caption, stop() { alive = false; cancelAnimationFrame(raf); } };
  }

  window.GolaAnim = { mount, has: id => !!EX[id], caption: id => EX[id]?.caption || "" };
})();
