// Exercise animations. Three scenes:
//  - "side":  mid-sagittal section of head and neck (tongue, soft palate, jaw, larynx move)
//  - "front": face seen from the front (lips, cheeks, finger, balloon)
//  - "lying": supine body for the head-lift exercise
// Each exercise is a loop of keyframed poses; numbers are interpolated with easing.
(() => {
  let uidSeq = 0;
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
  const mixPts = (A, B, k) => A.map((p, i) => [lerp(p[0], B[i][0], k), lerp(p[1], B[i][1], k)]);
  const f = n => (Math.round(n * 10) / 10).toString();
  const rot = ([x, y], [cx, cy], deg) => {
    const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
  };

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
  // A tapered band around a centre line (used for the soft palate).
  function ribbon(P, W) {
    const up = [], lo = [];
    P.forEach((p, i) => {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      up.push([p[0] + (nx * W[i]) / 2, p[1] + (ny * W[i]) / 2]);
      lo.push([p[0] - (nx * W[i]) / 2, p[1] - (ny * W[i]) / 2]);
    });
    return closedSpline([...up, ...lo.reverse()]);
  }
  // Dashed arrow along a curve, with a solid head.
  function arrowPath(P) {
    const n = P.length, [x2, y2] = P[n - 1], [x1, y1] = P[n - 2];
    const a = Math.atan2(y2 - y1, x2 - x1), h = 7;
    const l = [x2 - h * Math.cos(a - 0.5), y2 - h * Math.sin(a - 0.5)], r = [x2 - h * Math.cos(a + 0.5), y2 - h * Math.sin(a + 0.5)];
    return { line: openSpline(P), head: `M${f(l[0])} ${f(l[1])}L${f(x2)} ${f(y2)}L${f(r[0])} ${f(r[1])}Z` };
  }
  // Point and direction along a polyline, k in [0,1].
  function along(P, k) {
    const seg = []; let tot = 0;
    for (let i = 0; i < P.length - 1; i++) { const l = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); seg.push(l); tot += l; }
    let d = Math.max(0, Math.min(1, k)) * tot, i = 0;
    while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; }
    const t = seg[i] ? d / seg[i] : 0;
    return [lerp(P[i][0], P[i + 1][0], t), lerp(P[i][1], P[i + 1][1], t)];
  }

  // Interpolate a pose from the keyframes at time `time` (seconds).
  function poseAt(def, time) {
    const k = (time % def.cycle) / def.cycle, fr = def.frames;
    let i = 0; while (i < fr.length - 2 && k >= fr[i + 1][0]) i++;
    const [ta, a] = fr[i], [tb, b] = fr[i + 1];
    const m = ease(tb > ta ? Math.min(1, Math.max(0, (k - ta) / (tb - ta))) : 0);
    const base = def.base || {};
    const out = { k, m, a, b };
    const keys = new Set([...Object.keys(base), ...Object.keys(a), ...Object.keys(b)]);
    keys.forEach(key => {
      const va = key in a ? a[key] : base[key], vb = key in b ? b[key] : base[key];
      out[key] = typeof va === "number" && typeof vb === "number" ? lerp(va, vb, m) : (m < 0.5 ? va : vb) ?? va ?? vb;
    });
    return out;
  }

  /* =====================================================================
     SIDE SCENE
     ===================================================================== */
  const PIV = [212, 176];          // jaw hinge
  const SUBMENTAL = [292, 318];    // where chin skin meets the neck (jaw frame)

  // Tongue: 12 points clockwise from the tip, in the jaw's frame.
  const T = {
    rest:     [[334,242],[322,232],[300,222],[276,222],[257,231],[245,248],[240,272],[244,292],[262,310],[292,300],[316,282],[328,256]],
    tipUp:    [[337,222],[323,216],[300,216],[276,219],[257,229],[245,248],[240,272],[244,292],[262,310],[292,300],[316,282],[332,248]],
    tipBack:  [[282,215],[270,217],[258,226],[250,240],[244,256],[241,274],[244,292],[262,310],[292,300],[316,282],[322,256],[302,232]],
    suck:     [[337,222],[322,214],[300,212],[276,212],[258,216],[246,232],[241,262],[244,292],[262,310],[292,300],[316,282],[332,250]],
    down:     [[336,246],[324,243],[300,242],[276,244],[258,252],[247,266],[243,282],[246,297],[262,310],[292,300],[316,282],[331,262]],
    low:      [[334,248],[320,242],[298,240],[276,241],[258,248],[246,262],[242,280],[245,295],[262,310],[292,300],[316,282],[330,266]],
    out:      [[398,250],[378,242],[352,236],[324,232],[294,234],[266,242],[250,260],[244,284],[258,306],[296,300],[326,262],[354,240]],
    kBack:    [[332,246],[318,238],[298,232],[280,226],[264,219],[250,226],[243,246],[241,270],[244,292],[262,310],[300,300],[326,270]],
    teeth:    [[358,236],[341,229],[316,223],[290,221],[266,226],[250,240],[242,262],[244,290],[262,310],[292,300],[318,282],[344,246]],
    swallow:  [[337,222],[322,214],[300,212],[276,212],[258,214],[244,224],[234,248],[236,284],[258,308],[292,300],[316,282],[332,250]]
  };
  T.half = mixPts(T.low, T.out, 0.5);
  const lift = (P, dy) => P.map((p, i) => (i <= 2 || i >= 10 ? [p[0], p[1] + dy * (i === 0 ? 1 : 0.7)] : p));
  T.halfUp = lift(T.half, -9);
  T.halfDown = lift(T.half, 9);

  // Soft palate centre line (from the end of the hard palate to the uvula) and its thickness.
  const SP = {
    down: [[256,210],[249,221],[245,235],[245,248]],
    rest: [[256,210],[247,217],[240,229],[236,243]],
    up:   [[256,210],[246,208],[236,206],[228,206]]
  };
  const SPW = [12, 11, 9, 8];
  const spPts = v => (v < 0 ? mixPts(SP.rest, SP.down, -v) : mixPts(SP.rest, SP.up, v));

  const FLOW = [[380,210],[356,204],[330,186],[296,176],[262,180],[240,196],[232,232],[232,290],[252,332],[262,356],[266,396]];
  const SWALLOW_PATH = [[304,226],[276,224],[250,236],[236,262],[234,300],[238,340],[240,396]];

  function headPath(S) {
    return `M350 232 C 356 230 360 226 358 220 C 357 214 354 209 350 206 C 356 205 366 204 372 200 C 380 196 382 186 376 180 C 366 168 352 150 344 134 C 342 128 344 120 346 112 C 346 80 330 46 300 28 C 260 4 190 6 150 24 C 100 46 72 100 74 150 C 76 190 96 220 118 250 C 128 290 130 340 130 400 L 286 400 C 286 372 ${f(S[0] - 2)} ${f(S[1] + 26)} ${f(S[0])} ${f(S[1])} L 300 300 L 330 238 Z`;
  }
  const HEAD_STROKE = "M350 232 C 356 230 360 226 358 220 C 357 214 354 209 350 206 C 356 205 366 204 372 200 C 380 196 382 186 376 180 C 366 168 352 150 344 134 C 342 128 344 120 346 112 C 346 80 330 46 300 28 C 260 4 190 6 150 24 C 100 46 72 100 74 150 C 76 190 96 220 118 250 C 128 290 130 340 130 400";

  const SIDE_LABELS = [
    ["nose", "Cavità nasale", 150, [300, 172]],
    ["palate", "Palato duro", 186, [300, 209]],
    ["sp", "Palato molle", 216, [246, 222]],
    ["tongue", "Lingua", 248, [292, 250]],
    ["wall", "Faringe", 280, [228, 272]],
    ["epi", "Epiglottide", 310, [251, 298]],
    ["larynx", "Laringe", 352, [270, 350]]
  ];

  function sideMarkup(u) {
    const vert = [244, 274, 304, 334, 364].map(y => `<rect class="a-vert" x="176" y="${y}" width="31" height="24" rx="5"/><rect class="a-disc" x="177" y="${y + 24}" width="29" height="6" rx="2"/><path class="a-vert" d="M158 ${y + 6} L132 ${y + 16} L130 ${y + 22} L158 ${y + 18} Z"/>`).join("");
    const rings = [384, 392].map(y => `<rect class="a-cart" x="270" y="${y}" width="9" height="5" rx="2"/>`).join("");
    const labels = SIDE_LABELS.map(([key, text, y, [tx, ty]]) => `<g class="a-label" data-label="${key}"><path class="a-lead" d="M154 ${y - 4} L${tx} ${ty}"/><circle class="a-dot" cx="${tx}" cy="${ty}" r="2"/><text x="150" y="${y}" text-anchor="end">${text}</text></g>`).join("");
    return `
    <defs>
      <linearGradient id="gs${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0D2BF"/><stop offset="1" stop-color="#DDAE96"/></linearGradient>
      <linearGradient id="gb${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3E2DE"/><stop offset="1" stop-color="#E4C6C0"/></linearGradient>
      <radialGradient id="gt${u}" cx=".55" cy=".3" r=".75"><stop offset="0" stop-color="#EE9AA3"/><stop offset=".6" stop-color="#D86A7B"/><stop offset="1" stop-color="#B84862"/></radialGradient>
      <radialGradient id="ga${u}" cx=".6" cy=".35" r=".8"><stop offset="0" stop-color="#4A3038"/><stop offset="1" stop-color="#1E1318"/></radialGradient>
      <linearGradient id="gp${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0AAB2"/><stop offset="1" stop-color="#CF7584"/></linearGradient>
      <linearGradient id="gw${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE3F5" stop-opacity=".95"/><stop offset="1" stop-color="#6FB6DE" stop-opacity=".9"/></linearGradient>
      <clipPath id="ct${u}"><path data-tclip d=""/></clipPath>
    </defs>
    <g data-scene>
      <path class="a-air" d="M351 231 L358 234 L350 252 L340 280 L300 300 L330 237 Z"/>
      <path data-head fill="url(#gs${u})" d=""/>
      <path class="a-skull" d="M312 52 C 278 24 196 20 150 40 C 106 60 90 108 98 146 C 104 168 124 180 150 178 C 176 176 196 170 214 160 C 240 146 270 132 300 126 C 322 118 330 92 324 72 C 322 64 318 58 312 52 Z"/>
      <path fill="url(#gb${u})" d="M312 52 C 278 24 196 20 150 40 C 106 60 90 108 98 146 C 104 168 124 180 150 178 C 176 176 196 170 214 160 C 240 146 270 132 300 126 C 322 118 330 92 324 72 C 322 64 318 58 312 52 Z"/>
      <g class="a-gyri"><path d="M140 60 C 160 70 150 90 172 96 C 190 100 186 120 206 122"/><path d="M220 44 C 222 64 244 66 242 86 C 240 104 262 108 270 120"/><path d="M118 100 C 134 106 130 126 150 132 C 168 138 170 152 190 156"/><path d="M286 52 C 280 70 300 82 296 100"/><path d="M180 50 C 186 64 204 70 202 86"/></g>
      <ellipse class="a-cereb" cx="134" cy="162" rx="30" ry="17"/>
      <path class="a-cereb-l" d="M110 158 C 124 154 142 154 158 160 M112 166 C 126 162 144 162 158 168"/>
      <path class="a-cord" d="M190 162 C 186 180 180 196 172 214 L168 400 L156 400 L158 214 C 166 196 172 180 176 162 Z"/>
      <ellipse class="a-vert" cx="216" cy="198" rx="6" ry="8"/>
      <path class="a-vert" d="M184 186 C 188 178 198 178 202 186 L207 200 L208 232 C 208 236 205 238 201 238 L182 238 C 178 238 176 235 176 231 Z"/>
      <rect class="a-disc" x="177" y="238" width="29" height="6" rx="2"/>
      ${vert}
      <path class="a-sinus" d="M330 100 C 336 96 340 104 338 114 C 334 120 326 118 326 110 Z"/>
      <path class="a-sinus" d="M246 150 C 256 144 270 146 270 156 C 268 166 252 168 246 162 Z"/>
      <path fill="url(#ga${u})" d="M352 204 C 350 192 350 184 346 176 C 330 150 300 140 270 146 C 254 150 242 160 236 174 C 230 188 226 200 225 214 L224 300 C 224 330 228 350 232 364 L234 400 L278 400 L276 372 C 272 352 264 336 258 322 L246 300 L246 230 L300 232 L338 236 L338 214 L340 208 Z"/>
      <path class="a-turb" d="M262 196 C 282 187 318 187 336 196 C 318 202 282 203 262 196 Z"/>
      <path class="a-turb" d="M268 178 C 284 169 312 169 326 178 C 312 184 284 185 268 178 Z"/>
      <path class="a-turb" d="M276 161 C 288 155 304 155 314 161 C 302 166 288 167 276 161 Z"/>
      <path class="a-eso" d="M236 366 L238 400 M250 366 L252 400"/>
      <path class="a-wall" data-wall d=""/>
      <g data-lx>
        <ellipse class="a-bone" cx="270" cy="317" rx="9" ry="4" transform="rotate(-20 270 317)"/>
        <path class="a-cartf" data-epi d="M264 326 C 257 312 249 300 246 288 C 245 282 249 280 251 284 C 255 296 261 308 270 320 Z"/>
        <path class="a-cartf" d="M272 330 L284 332 C 286 344 286 356 282 366 L270 364 C 272 352 272 340 272 330 Z"/>
        <path class="a-cartf" d="M262 368 L282 368 L282 382 L262 380 Z"/>
        <path class="a-fold" d="M248 350 L264 352"/>
        ${rings}
      </g>
      <path class="a-bone" d="M340 206 C 320 204 280 204 256 205 L254 213 C 280 215 320 215 338 217 Z"/>
      <path class="a-bone" d="M338 204 C 346 204 352 208 352 214 L348 222 L336 220 Z"/>
      <path class="a-sp" data-sp fill="url(#gp${u})" d=""/>
      <g data-jaw>
        <path data-jawfill fill="url(#gs${u})" d="M350 232 C 358 234 362 240 358 246 C 354 252 348 254 346 258 C 352 266 356 276 354 286 C 352 298 344 304 334 306 C 318 310 304 314 292 318 L300 300 L330 238 Z"/>
        <path class="a-skin" d="M350 232 C 358 234 362 240 358 246 C 354 252 348 254 346 258 C 352 266 356 276 354 286 C 352 298 344 304 334 306 C 318 310 304 314 292 318"/>
        <path class="a-lip" d="M350 232 C 358 234 362 240 358 246 C 354 249 348 248 343 244 C 343 238 346 234 350 232 Z"/>
        <path data-tongue fill="url(#gt${u})" class="a-tongue" d=""/>
        <g clip-path="url(#ct${u})" class="a-fibers"><path d="M320 270 L250 220 M320 270 L270 214 M320 270 L294 212 M320 270 L318 214 M320 270 L240 250 M320 270 L238 285 M320 270 L250 306"/></g>
        <path class="a-bone" d="M342 246 C 348 256 350 270 348 286 C 346 298 336 302 326 298 C 318 292 318 276 322 262 C 326 252 332 246 342 246 Z"/>
        <path class="a-tooth" d="M330 272 C 334 262 338 252 342 244 L346 236 C 344 236 340 238 338 240 C 334 248 328 258 324 270 Z"/>
        <g data-brush><path class="a-brush" d="M296 232 L420 250"/><rect class="a-brushhead" x="276" y="226" width="26" height="8" rx="3" transform="rotate(8 289 230)"/><path class="a-bristle" d="M279 235 l-1 5 M284 236 l-1 5 M289 237 l-1 5 M294 237 l-1 5 M299 238 l-1 5"/></g>
        <g data-spoon><ellipse class="a-spoon" data-spoonbowl cx="0" cy="0" rx="13" ry="5"/><path class="a-spoon-h" data-spoonh d=""/></g>
      </g>
      <path class="a-tooth" d="M336 200 C 342 206 348 214 350 222 L350 234 C 347 232 344 228 342 224 C 340 216 336 208 332 202 Z"/>
      <path class="a-lip" d="M350 232 C 356 230 360 226 358 220 C 352 219 346 222 343 227 C 345 230 347 232 350 232 Z"/>
      <path class="a-skin" d="${HEAD_STROKE}"/>
      <path class="a-skin" data-neck d=""/>
      <g data-water><path class="a-water" data-waterblob fill="url(#gw${u})" d=""/><g data-bubbles></g></g>
      <path class="a-flow" data-flow d="${openSpline(FLOW)}"/>
      <g data-waves class="a-waves"><path d="M372 236 C 378 242 378 250 372 256"/><path d="M382 230 C 390 240 390 252 382 262"/><path d="M392 224 C 402 238 402 254 392 268"/></g>
    </g>
    <g class="a-labels">${labels}</g>
    <path class="a-arrow" data-arrow d=""/><path class="a-arrowhead" data-arrowhead d=""/>
    <text class="a-say" data-say x="396" y="390" text-anchor="end"></text>`;
  }

  function mountSide(svg, def, u) {
    svg.setAttribute("viewBox", "20 30 380 370");
    svg.innerHTML = sideMarkup(u);
    const q = s => svg.querySelector(s);
    const el = {
      scene: q("[data-scene]"), head: q("[data-head]"), neck: q("[data-neck]"), jaw: q("[data-jaw]"), tongue: q("[data-tongue]"), tclip: q("[data-tclip]"),
      sp: q("[data-sp]"), wall: q("[data-wall]"), lx: q("[data-lx]"), epi: q("[data-epi]"), brush: q("[data-brush]"), spoon: q("[data-spoon]"),
      bowl: q("[data-spoonbowl]"), spoonh: q("[data-spoonh]"), water: q("[data-water]"), blob: q("[data-waterblob]"), bubbles: q("[data-bubbles]"),
      flow: q("[data-flow]"), waves: q("[data-waves]"), say: q("[data-say]"), arrow: q("[data-arrow]"), arrowhead: q("[data-arrowhead]")
    };
    (def.focus || []).forEach(k => q(`[data-label="${k}"]`)?.classList.add("on"));
    if (def.arrow) { const a = arrowPath(def.arrow); el.arrow.setAttribute("d", a.line); el.arrowhead.setAttribute("d", a.head); }
    el.brush.style.display = def.props?.includes("brush") ? "" : "none";
    el.spoon.style.display = def.props?.includes("spoon") ? "" : "none";
    el.bubbles.innerHTML = [0, 1, 2, 3].map(() => `<circle class="a-bubble" r="2.2"/>`).join("");
    const bubbles = [...el.bubbles.children];

    return time => {
      const p = poseAt(def, time);
      const jaw = p.jaw || 0;
      const S = rot(SUBMENTAL, PIV, jaw);
      el.scene.setAttribute("transform", p.tilt ? `rotate(${f(p.tilt)} 200 330)` : "");
      el.head.setAttribute("d", headPath(S));
      el.neck.setAttribute("d", `M286 400 C 286 372 ${f(S[0] - 2)} ${f(S[1] + 26)} ${f(S[0])} ${f(S[1])}`);
      el.jaw.setAttribute("transform", `rotate(${f(jaw)} ${PIV[0]} ${PIV[1]})`);
      const ta = T[p.a.t || def.base?.t || "rest"], tb = T[p.b.t || def.base?.t || "rest"];
      const tongue = mixPts(ta, tb, p.m);
      const td = closedSpline(tongue);
      el.tongue.setAttribute("d", td); el.tclip.setAttribute("d", td);
      el.sp.setAttribute("d", ribbon(spPts(p.sp || 0), SPW));
      const b = p.wall || 0;
      el.wall.setAttribute("d", `M236 174 C 230 188 226 200 225 214 C ${f(225 + b)} 240 ${f(225 + b * 1.4)} 270 ${f(224 + b)} 300 C 224 330 228 350 232 364 L234 400`);
      el.lx.setAttribute("transform", `translate(${f(p.lxx || 0)} ${f(p.lx || 0)})`);
      el.epi.setAttribute("transform", `rotate(${f(-(p.lx || 0) * 2.4)} 266 324)`);
      if (def.props?.includes("brush")) el.brush.setAttribute("transform", `translate(${f(-30 * (p.brush || 0))} ${f(4 * (p.brush || 0))})`);
      if (def.props?.includes("spoon")) {
        const tip = tongue[0], side = p.spoon || 0;
        const y = tip[1] + side * 9;
        el.bowl.setAttribute("cx", f(tip[0] + 2)); el.bowl.setAttribute("cy", f(y));
        el.spoonh.setAttribute("d", `M${f(tip[0] + 10)} ${f(y)} L420 ${f(y + 18 + side * 4)}`);
      }
      // water: a sip that travels (swallow) or sits in the throat (gargle)
      if (p.water != null && def.water) {
        const pos = def.water === "gargle" ? [252, 238] : along(SWALLOW_PATH, p.water);
        const r = def.water === "gargle" ? 13 : 8;
        el.water.style.opacity = f(p.wop ?? 1);
        el.blob.setAttribute("d", `M${f(pos[0] - r)} ${f(pos[1])} a${r} ${f(r * 0.7)} 0 1 0 ${2 * r} 0 a${r} ${f(r * 0.7)} 0 1 0 ${-2 * r} 0Z`);
        bubbles.forEach((c, i) => {
          if (def.water !== "gargle") { c.setAttribute("r", "0"); return; }
          const ph = (time * 1.6 + i / 4) % 1;
          c.setAttribute("r", "2.2"); c.setAttribute("cx", f(pos[0] - 6 + i * 4)); c.setAttribute("cy", f(pos[1] + 7 - ph * 14)); c.style.opacity = f(1 - ph);
        });
      } else el.water.style.opacity = "0";
      const flow = p.flow || 0;
      el.flow.style.opacity = f(Math.min(1, Math.abs(flow)));
      el.flow.style.strokeDashoffset = f((flow >= 0 ? -1 : 1) * time * 26);
      el.waves.style.opacity = f(p.waves || 0);
      el.say.textContent = p.text || def.say || "";
      el.say.style.opacity = f(p.say || 0);
    };
  }

  /* =====================================================================
     FRONT SCENE
     ===================================================================== */
  const FRONT_LABELS = {
    orbicolare: ["Orbicolare", "della bocca", 312, 318, [240, 292]],
    buccinatore: ["Buccinatore", "", 14, 252, [138, 268]],
    zigomatico: ["Muscoli", "zigomatici", 312, 200, [262, 236]],
    labbra: ["Labbra", "chiuse", 312, 300, [222, 296]],
    naso: ["Naso", "", 312, 240, [210, 250]]
  };
  function lipsPaths(p) {
    const cx = 200, cy = 292, hw = p.hw ?? 32, pk = p.pucker || 0, o = p.open || 0;
    const L = [cx - hw, cy - (p.liftL || 0)], R = [cx + hw, cy - (p.liftR || 0)];
    const th = 9 + 6 * pk, tl = 11 + 6 * pk;
    const upper = `M${f(L[0])} ${f(L[1])} C ${f(cx - hw * 0.75)} ${f(L[1] - th * 0.6)} ${f(cx - hw * 0.4)} ${f(cy - th - 1)} ${f(cx - hw * 0.2)} ${f(cy - th)} Q ${cx} ${f(cy - th + 4)} ${f(cx + hw * 0.2)} ${f(cy - th)} C ${f(cx + hw * 0.4)} ${f(cy - th - 1)} ${f(cx + hw * 0.75)} ${f(R[1] - th * 0.6)} ${f(R[0])} ${f(R[1])} C ${f(cx + hw * 0.5)} ${f(cy - o * 0.5 + 1)} ${f(cx - hw * 0.5)} ${f(cy - o * 0.5 + 1)} ${f(L[0])} ${f(L[1])} Z`;
    const lower = `M${f(L[0])} ${f(L[1])} C ${f(cx - hw * 0.5)} ${f(cy + o * 0.5 + 1)} ${f(cx + hw * 0.5)} ${f(cy + o * 0.5 + 1)} ${f(R[0])} ${f(R[1])} C ${f(cx + hw * 0.75)} ${f(cy + tl + o * 0.5)} ${f(cx - hw * 0.75)} ${f(cy + tl + o * 0.5)} ${f(L[0])} ${f(L[1])} Z`;
    const mouth = `M${f(L[0])} ${f(L[1])} C ${f(cx - hw * 0.5)} ${f(cy - o * 0.5 + 1)} ${f(cx + hw * 0.5)} ${f(cy - o * 0.5 + 1)} ${f(R[0])} ${f(R[1])} C ${f(cx + hw * 0.5)} ${f(cy + o * 0.5 + 1)} ${f(cx - hw * 0.5)} ${f(cy + o * 0.5 + 1)} ${f(L[0])} ${f(L[1])} Z`;
    const line = `M${f(L[0])} ${f(L[1])} C ${f(cx - hw * 0.5)} ${f(cy + 1)} ${f(cx + hw * 0.5)} ${f(cy + 1)} ${f(R[0])} ${f(R[1])}`;
    return { upper, lower, mouth, line, L, R };
  }
  function faceOutline(cl, cr) {
    return `M200 70 C 270 70 304 130 302 200 C ${f(302 + cr * 26)} 246 ${f(272 + cr * 18)} 326 200 352 C ${f(128 - cl * 18)} 326 ${f(98 - cl * 26)} 246 98 200 C 96 130 130 70 200 70 Z`;
  }
  function frontMarkup(u, def) {
    const labels = (def.labels || []).map(key => {
      const [l1, l2, x, y, [tx, ty]] = FRONT_LABELS[key];
      const anchor = x < 200 ? "start" : "start";
      return `<g class="a-label on"><path class="a-lead" d="M${x < 200 ? x + 70 : x - 4} ${y - 4} L${tx} ${ty}"/><circle class="a-dot" cx="${tx}" cy="${ty}" r="2.4"/><text x="${x}" y="${y}" text-anchor="${anchor}">${l1}${l2 ? `<tspan x="${x}" dy="14">${l2}</tspan>` : ""}</text></g>`;
    }).join("");
    return `
    <defs>
      <radialGradient id="fs${u}" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="#F3D7C5"/><stop offset=".8" stop-color="#E5B9A0"/><stop offset="1" stop-color="#D2A086"/></radialGradient>
      <radialGradient id="fc${u}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#E79A8E" stop-opacity=".55"/><stop offset="1" stop-color="#E79A8E" stop-opacity="0"/></radialGradient>
      <linearGradient id="fl${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9696D"/><stop offset="1" stop-color="#A9505A"/></linearGradient>
      <radialGradient id="fb${u}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#F27C7C"/><stop offset="1" stop-color="#B83A44"/></radialGradient>
    </defs>
    <path fill="url(#fs${u})" class="a-skin-f" d="M160 320 C 162 350 156 380 150 400 L250 400 C 244 380 238 350 240 320 Z"/>
    <ellipse fill="url(#fs${u})" class="a-skin-f" cx="98" cy="206" rx="13" ry="26"/>
    <ellipse fill="url(#fs${u})" class="a-skin-f" cx="302" cy="206" rx="13" ry="26"/>
    <path data-face fill="url(#fs${u})" class="a-skin-f" d=""/>
    <path class="a-hair" d="M96 196 C 86 110 138 52 200 52 C 262 52 314 110 304 196 C 298 146 276 110 200 106 C 124 110 102 146 96 196 Z"/>
    <ellipse data-cheekl fill="url(#fc${u})" cx="146" cy="262" rx="30" ry="22"/>
    <ellipse data-cheekr fill="url(#fc${u})" cx="254" cy="262" rx="30" ry="22"/>
    <path class="a-brow" d="M136 166 C 150 156 170 156 184 164"/><path class="a-brow" d="M264 166 C 250 156 230 156 216 164"/>
    <g class="a-eye"><path class="a-eyew" d="M138 190 C 150 178 172 178 184 190 C 172 198 150 198 138 190 Z"/><circle class="a-iris" cx="161" cy="189" r="7"/><circle class="a-pupil" cx="161" cy="189" r="3"/><path class="a-lid" d="M138 190 C 150 178 172 178 184 190"/></g>
    <g class="a-eye"><path class="a-eyew" d="M216 190 C 228 178 250 178 262 190 C 250 198 228 198 216 190 Z"/><circle class="a-iris" cx="239" cy="189" r="7"/><circle class="a-pupil" cx="239" cy="189" r="3"/><path class="a-lid" d="M216 190 C 228 178 250 178 262 190"/></g>
    <path class="a-nose" d="M192 196 C 190 220 184 236 182 246 C 186 256 196 258 200 256 C 204 258 214 256 218 246 C 216 236 210 220 208 196"/>
    <path class="a-nostril" d="M188 251 C 191 247 196 248 196 252 Z"/><path class="a-nostril" d="M212 251 C 209 247 204 248 204 252 Z"/>
    <path class="a-fold-f" data-folds d=""/>
    <path class="a-philtrum" d="M195 260 L194 276 M205 260 L206 276"/>
    <path class="a-chin" d="M184 330 C 194 336 206 336 216 330"/>
    <g data-musc></g>
    <g data-finger><path class="a-finger" data-fingerp d=""/></g>
    <path class="a-mouth-f" data-mouth d=""/>
    <path data-upper fill="url(#fl${u})" d=""/>
    <path data-lower fill="url(#fl${u})" d=""/>
    <path class="a-lipline" data-lipline d=""/>
    <g data-wrinkles class="a-wrinkle"><path d="M186 270 l-2 -6 M200 268 l0 -6 M214 270 l2 -6 M184 312 l-2 6 M200 314 l0 6 M216 312 l2 6"/></g>
    <g data-balloon><path class="a-balloon-neck" d="M196 300 L204 300 L206 314 L194 314 Z"/><ellipse data-balloonb fill="url(#fb${u})" cx="200" cy="330" rx="20" ry="23"/><ellipse class="a-balloon-hi" data-balloonhi cx="192" cy="322" rx="5" ry="8"/></g>
    <g data-nflow class="a-nflow"><path d="M186 280 L188 262"/><path d="M214 280 L212 262"/></g>
    <g class="a-labels">${labels}</g>
    <text class="a-say a-say-s" data-say x="394" y="368" text-anchor="end"></text>`;
  }
  function mountFront(svg, def, u) {
    svg.setAttribute("viewBox", "0 46 400 330");
    svg.innerHTML = frontMarkup(u, def);
    const q = s => svg.querySelector(s);
    const el = {
      face: q("[data-face]"), cl: q("[data-cheekl]"), cr: q("[data-cheekr]"), folds: q("[data-folds]"), mouth: q("[data-mouth]"), upper: q("[data-upper]"),
      lower: q("[data-lower]"), line: q("[data-lipline]"), wr: q("[data-wrinkles]"), finger: q("[data-finger]"), fingerp: q("[data-fingerp]"),
      balloon: q("[data-balloon]"), bb: q("[data-balloonb]"), bhi: q("[data-balloonhi]"), nflow: q("[data-nflow]"), musc: q("[data-musc]"), say: q("[data-say]")
    };
    const muscle = def.muscle;
    return time => {
      const p = poseAt(def, time);
      const cl = p.cheekL || 0, cr = p.cheekR || 0;
      el.face.setAttribute("d", faceOutline(cl, cr));
      el.cl.setAttribute("cx", f(146 - cl * 8)); el.cl.setAttribute("rx", f(30 + cl * 8));
      el.cr.setAttribute("cx", f(254 + cr * 8)); el.cr.setAttribute("rx", f(30 + cr * 8));
      const lp = lipsPaths(p);
      el.mouth.setAttribute("d", lp.mouth); el.upper.setAttribute("d", lp.upper); el.lower.setAttribute("d", lp.lower); el.line.setAttribute("d", lp.line);
      el.folds.setAttribute("d", `M182 250 C 172 262 ${f(lp.L[0] - 8)} ${f(lp.L[1] - 10)} ${f(lp.L[0] - 4)} ${f(lp.L[1] + 4)} M218 250 C 228 262 ${f(lp.R[0] + 8)} ${f(lp.R[1] - 10)} ${f(lp.R[0] + 4)} ${f(lp.R[1] + 4)}`);
      el.folds.style.opacity = f(0.25 + 0.5 * (p.fold || 0));
      el.wr.style.opacity = f(p.pucker || 0);
      const fv = p.finger || 0;
      el.finger.style.display = def.props?.includes("finger") ? "" : "none";
      if (def.props?.includes("finger")) {
        const tip = [lp.L[0] + 4, lp.L[1] + 1];
        el.fingerp.setAttribute("d", `M${f(tip[0])} ${f(tip[1] - 8)} C ${f(tip[0] - 30)} ${f(tip[1] - 5)} 78 336 64 400 L84 400 C 98 344 ${f(tip[0] - 26)} ${f(tip[1] + 10)} ${f(tip[0])} ${f(tip[1] + 6)} Z`);
        el.finger.style.opacity = f(0.6 + 0.4 * fv);
      }
      el.balloon.style.display = def.props?.includes("balloon") ? "" : "none";
      if (def.props?.includes("balloon")) {
        const r = p.balloon || 14;
        el.bb.setAttribute("rx", f(r)); el.bb.setAttribute("ry", f(r * 1.15)); el.bb.setAttribute("cy", f(312 + r * 1.1));
        el.bhi.setAttribute("cx", f(200 - r * 0.4)); el.bhi.setAttribute("cy", f(312 + r * 0.7)); el.bhi.setAttribute("rx", f(r * 0.18)); el.bhi.setAttribute("ry", f(r * 0.3));
      }
      el.nflow.style.opacity = f(p.nflow || 0);
      el.nflow.style.strokeDashoffset = f(time * 20);
      // muscle being trained, drawn as a translucent band
      if (muscle === "orbicolare") el.musc.innerHTML = `<ellipse class="a-musc" cx="200" cy="${f(292 - ((p.liftL || 0) + (p.liftR || 0)) / 4)}" rx="${f((p.hw ?? 32) + 9)}" ry="${f(19 + 4 * (p.pucker || 0))}"/>`;
      else if (muscle === "buccinatore") el.musc.innerHTML = `<ellipse class="a-musc-fill" cx="${f(140 - cl * 8)}" cy="270" rx="${f(24 + cl * 6)}" ry="18"/>`;
      else if (muscle === "zigomatico") el.musc.innerHTML = `<path class="a-musc" d="M${f(lp.L[0] - 2)} ${f(lp.L[1] - 2)} C 150 262 140 238 134 222" style="opacity:${f(0.1 + 0.9 * (p.liftL || 0) / 9)}"/><path class="a-musc" d="M${f(lp.R[0] + 2)} ${f(lp.R[1] - 2)} C 250 262 260 238 266 222" style="opacity:${f(0.1 + 0.9 * (p.liftR || 0) / 9)}"/>`;
      el.say.textContent = p.text || def.say || "";
      el.say.style.opacity = f(p.say || 0);
    };
  }

  /* =====================================================================
     LYING SCENE (head lift)
     ===================================================================== */
  function mountLying(svg, def, u) {
    svg.setAttribute("viewBox", "120 160 280 185");
    svg.innerHTML = `
      <defs><linearGradient id="ls${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0D2BF"/><stop offset="1" stop-color="#D9A88F"/></linearGradient></defs>
      <rect class="a-mat" x="0" y="300" width="400" height="16" rx="6"/>
      <path class="a-shirt" d="M0 252 C 80 248 160 248 214 252 C 236 254 246 268 246 282 C 246 294 238 300 226 300 L0 300 Z"/>
      <path class="a-shirt-d" d="M40 284 C 100 280 170 280 214 284 C 222 286 224 296 216 298 L40 298 Z"/>
      <path data-neck fill="url(#ls${u})" class="a-skin-f" d=""/>
      <g data-head>
        <path class="a-musc-fill" data-supra d="M272 262 C 268 270 268 278 274 284 L250 286 L250 266 Z"/>
        <path fill="url(#ls${u})" class="a-skin-f" d="M270 262 C 268 252 272 246 278 245 C 282 242 284 240 286 240 C 290 238 292 234 294 228 C 296 224 300 224 302 230 C 304 236 308 238 314 238 C 326 238 336 248 338 262 C 340 280 330 294 314 296 C 296 298 280 292 272 282 Z"/>
        <path class="a-hair" d="M318 238 C 330 240 338 250 339 264 C 340 280 330 294 314 296 C 320 286 324 272 322 258 C 321 250 318 244 318 238 Z"/>
        <ellipse class="a-ear" cx="312" cy="268" rx="6" ry="9"/>
        <path class="a-lid" d="M302 241 L310 241"/>
        <path class="a-lipline" d="M279 246 L287 243"/>
        <path class="a-gaze" data-gaze d="M306 242 L60 262"/>
      </g>
      <g class="a-labels">
        <g class="a-label on"><path class="a-lead" d="M200 222 L258 262" data-lead/><circle class="a-dot" cx="258" cy="262" r="2.4" data-leaddot/><text x="128" y="216">Muscoli sopra</text><text x="128" y="230">l'osso ioide</text></g>
        <g class="a-label"><text x="128" y="336">Spalle sempre appoggiate</text></g>
      </g>
      <text class="a-say a-say-s" data-say x="128" y="184"></text>`;
    const q = s => svg.querySelector(s);
    const head = q("[data-head]"), neck = q("[data-neck]"), say = q("[data-say]"), gaze = q("[data-gaze]"), lead = q("[data-lead]"), dot = q("[data-leaddot]");
    const P = [246, 280];
    return time => {
      const p = poseAt(def, time), a = -(p.lift || 0) * 38;
      head.setAttribute("transform", `rotate(${f(a)} ${P[0]} ${P[1]})`);
      const c1 = rot([272, 260], P, a), c2 = rot([274, 286], P, a), tgt = rot([258, 270], P, a);
      neck.setAttribute("d", `M226 256 C 240 254 ${f(c1[0] - 6)} ${f(c1[1])} ${f(c1[0])} ${f(c1[1])} L${f(c2[0])} ${f(c2[1])} C ${f(c2[0] - 10)} 294 238 298 226 298 Z`);
      gaze.style.opacity = f(p.lift || 0);
      lead.setAttribute("d", `M206 222 L${f(tgt[0])} ${f(tgt[1])}`); dot.setAttribute("cx", f(tgt[0])); dot.setAttribute("cy", f(tgt[1]));
      say.textContent = p.text || ""; say.style.opacity = f(p.say || 0);
    };
  }

  /* =====================================================================
     EXERCISES
     ===================================================================== */
  const EX = {
    spazzola: { scene: "side", cycle: 1.4, base: { t: "low", jaw: 11, sp: 0 }, props: ["brush"], focus: ["tongue"],
      caption: "Bocca aperta, spazzolino sulla parte alta della lingua: avanti e indietro, poi sui lati.",
      frames: [[0, { brush: 0 }], [0.5, { brush: 1 }], [1, { brush: 0 }]] },
    scivola: { scene: "side", cycle: 2.4, focus: ["tongue", "palate"],
      caption: "La punta parte dietro gli incisivi e scivola indietro lungo il palato duro, premendo.",
      frames: [[0, { t: "tipUp" }], [0.15, { t: "tipUp" }], [0.6, { t: "tipBack" }], [0.75, { t: "tipBack" }], [1, { t: "tipUp" }]],
      arrow: [[326, 226], [306, 222], [288, 224]] },
    risucchio: { scene: "side", cycle: 3, base: { jaw: 3 }, focus: ["tongue", "palate"],
      caption: "Tutta la lingua viene aspirata verso l'alto e resta incollata al palato per 2 secondi.",
      frames: [[0, { t: "rest" }], [0.2, { t: "suck" }], [0.75, { t: "suck" }], [1, { t: "rest" }]],
      arrow: [[290, 250], [290, 236]] },
    dorso: { scene: "side", cycle: 2.2, focus: ["tongue"],
      caption: "Punta ferma contro gli incisivi inferiori; il dorso e la base della lingua spingono verso il basso.",
      frames: [[0, { t: "rest" }], [0.4, { t: "down" }], [0.7, { t: "down" }], [1, { t: "rest" }]],
      arrow: [[276, 214], [276, 232]] },
    fuori: { scene: "side", cycle: 4, focus: ["tongue"],
      caption: "Lingua fuori il più possibile, dritta e tesa, senza appoggiarla alle labbra. Mantieni.",
      frames: [[0, { t: "rest" }], [0.18, { t: "out", jaw: 9 }], [0.8, { t: "out", jaw: 9 }], [1, { t: "rest" }]],
      arrow: [[350, 270], [392, 270]] },
    cucchiaio: { scene: "side", cycle: 4, base: { t: "half", jaw: 9 }, props: ["spoon"], focus: ["tongue"],
      caption: "La punta spinge contro il cucchiaio: verso l'alto, verso il basso, poi a destra e a sinistra.",
      frames: [[0, { t: "half", spoon: -1 }], [0.1, { t: "halfUp", spoon: -1, say: 1, text: "su" }], [0.4, { t: "halfUp", spoon: -1, say: 1, text: "su" }], [0.5, { t: "half", spoon: 1 }], [0.6, { t: "halfDown", spoon: 1, say: 1, text: "giù" }], [0.9, { t: "halfDown", spoon: 1, say: 1, text: "giù" }], [1, { t: "half", spoon: -1 }]] },
    a_scatti: { scene: "side", cycle: 1.6, base: { t: "low", jaw: 11 }, focus: ["sp"],
      caption: "Bocca aperta, lingua bassa. A ogni «A» il palato molle e l'ugola si alzano e chiudono il passaggio verso il naso.",
      frames: [[0, { sp: 0 }], [0.15, { sp: 1, say: 1 }], [0.45, { sp: 1, say: 1 }], [0.6, { sp: 0 }], [1, { sp: 0 }]],
      say: "A!", arrow: [[250, 250], [240, 236], [238, 222]] },
    a_lunga: { scene: "side", cycle: 4, base: { t: "low", jaw: 11 }, focus: ["sp"],
      caption: "Una «A» lunga e costante: il palato molle resta sollevato per tutta la durata.",
      frames: [[0, { sp: 0 }], [0.12, { sp: 1, say: 1, waves: 1 }], [0.85, { sp: 1, say: 1, waves: 1 }], [1, { sp: 0 }]],
      say: "Aaaa", arrow: [[250, 250], [240, 236], [238, 222]] },
    kaga: { scene: "side", cycle: 1.4, base: { jaw: 4, sp: 0.4 }, focus: ["tongue", "sp"],
      caption: "Il retro della lingua batte contro il palato molle: «KA» e poi «GA», veloce.",
      frames: [[0, { t: "rest" }], [0.18, { t: "kBack", say: 1, text: "KA" }], [0.38, { t: "rest" }], [0.68, { t: "kBack", say: 1, text: "GA" }], [0.88, { t: "rest" }], [1, { t: "rest" }]] },
    gargarismo: { scene: "side", cycle: 2, base: { t: "kBack", jaw: 5, sp: 1, tilt: -14, water: 1 }, water: "gargle", focus: ["wall"],
      caption: "Testa un po' indietro, acqua in fondo alla bocca: l'aria che esce fa vibrare la gola.",
      frames: [[0, { wall: 0 }], [0.5, { wall: 3 }], [1, { wall: 0 }]] },
    sirena: { scene: "side", cycle: 5, base: { t: "kBack", sp: -1, flow: -1, say: 1, text: "ng" }, focus: ["larynx", "sp"],
      caption: "Bocca chiusa sul suono «ng»: il palato molle è abbassato, l'aria esce dal naso. Salendo di nota la laringe si alza.",
      frames: [[0, { lx: 3 }], [0.5, { lx: -12 }], [1, { lx: 3 }]] },
    deglutizione_forte: { scene: "side", cycle: 3, focus: ["wall", "larynx"],
      caption: "Lingua che spinge forte contro il palato, gola che stringe: la laringe sale.",
      frames: [[0, { t: "rest" }], [0.2, { t: "tipUp" }], [0.42, { t: "swallow", lx: -16, lxx: 6, wall: 5 }], [0.62, { t: "swallow", lx: -16, lxx: 6, wall: 5 }], [0.85, { t: "rest" }], [1, { t: "rest" }]] },
    masako: { scene: "side", cycle: 3, base: { t: "teeth", jaw: 2 }, focus: ["wall"],
      caption: "Punta della lingua tra i denti: deglutendo è la parete posteriore della gola che deve avanzare.",
      frames: [[0, { wall: 0 }], [0.3, { wall: 10, lx: -12, lxx: 4 }], [0.6, { wall: 10, lx: -12, lxx: 4 }], [0.85, { wall: 0 }], [1, { wall: 0 }]],
      arrow: [[212, 270], [230, 270]] },
    shaker: { scene: "lying", cycle: 5, caption: "Spalle a terra, solleva solo la testa fino a vedere le punte dei piedi. Mantieni, poi appoggia.",
      frames: [[0, { lift: 0 }], [0.2, { lift: 1, say: 1, text: "Guarda i piedi" }], [0.8, { lift: 1, say: 1, text: "Guarda i piedi" }], [1, { lift: 0 }]] },
    guancia: { scene: "front", cycle: 2.2, props: ["finger"], muscle: "buccinatore", labels: ["buccinatore"],
      caption: "Il dito spinge la guancia verso l'esterno; il muscolo della guancia resiste e la riporta verso i denti.",
      frames: [[0, { cheekL: 0, finger: 0, hw: 30 }], [0.35, { cheekL: 1, finger: 1, hw: 30, say: 1, text: "Il dito spinge" }], [0.5, { cheekL: 1, finger: 1, hw: 30 }], [0.85, { cheekL: 0.15, finger: 0.4, hw: 30, say: 1, text: "La guancia resiste" }], [1, { cheekL: 0, finger: 0, hw: 30 }]] },
    bacio: { scene: "front", cycle: 2.6, muscle: "orbicolare", labels: ["orbicolare"],
      caption: "Labbra chiuse in avanti come per un bacio, poi un sorriso ampio a labbra chiuse.",
      frames: [[0, { hw: 32 }], [0.2, { hw: 17, pucker: 1 }], [0.45, { hw: 17, pucker: 1 }], [0.65, { hw: 44, liftL: 6, liftR: 6, fold: 1 }], [0.9, { hw: 44, liftL: 6, liftR: 6, fold: 1 }], [1, { hw: 32 }]] },
    angoli: { scene: "front", cycle: 2.8, base: { hw: 34, open: 4 }, muscle: "zigomatico", labels: ["zigomatico"],
      caption: "Bocca appena aperta: solleva un angolo della bocca, rilascia, poi l'altro.",
      frames: [[0, {}], [0.2, { liftR: 9, fold: 0.6 }], [0.4, {}], [0.6, { liftL: 9, fold: 0.6 }], [0.8, {}], [1, {}]] },
    palloncino: { scene: "front", cycle: 8, base: { hw: 14, pucker: 1 }, props: ["balloon"], labels: ["labbra", "naso"],
      caption: "Inspira dal naso tenendo il palloncino tra le labbra, poi soffia a lungo. Ripeti senza toglierlo.",
      frames: [[0, { balloon: 14, nflow: 1, say: 1, text: "Inspira" }], [0.18, { balloon: 14, nflow: 1, say: 1, text: "Inspira" }], [0.22, { balloon: 14, cheekL: 0.5, cheekR: 0.5, say: 1, text: "Soffia" }], [0.48, { balloon: 30, cheekL: 0.5, cheekR: 0.5, say: 1, text: "Soffia" }], [0.52, { balloon: 30, nflow: 1, say: 1, text: "Inspira" }], [0.66, { balloon: 30, nflow: 1, say: 1, text: "Inspira" }], [0.7, { balloon: 30, cheekL: 0.5, cheekR: 0.5, say: 1, text: "Soffia" }], [0.94, { balloon: 44, cheekL: 0.5, cheekR: 0.5, say: 1, text: "Soffia" }], [1, { balloon: 14 }]] },
    nasale: { scene: "side", cycle: 10, base: { t: "suck" }, focus: ["nose"],
      caption: "Bocca chiusa e lingua appoggiata al palato: l'aria entra ed esce solo dal naso. Dentro 4 secondi, fuori 6.",
      frames: [[0, { flow: 1, say: 1, text: "Dentro · 4 s" }], [0.38, { flow: 1, say: 1, text: "Dentro · 4 s" }], [0.42, { flow: -1, say: 1, text: "Fuori · 6 s" }], [0.98, { flow: -1, say: 1, text: "Fuori · 6 s" }], [1, { flow: 1 }]] },
    deglutizione: { scene: "side", cycle: 3.4, water: "sip", focus: ["tongue", "palate"],
      caption: "Denti a contatto e labbra rilassate: la punta sale al palato e la lingua spinge l'acqua all'indietro.",
      frames: [[0, { t: "rest", water: 0, wop: 1 }], [0.2, { t: "tipUp", water: 0.05, wop: 1 }], [0.45, { t: "swallow", water: 0.45, lx: -14, lxx: 5, wop: 1 }], [0.7, { t: "swallow", water: 1, lx: -14, lxx: 5, wop: 0 }], [0.9, { t: "rest", water: 1, wop: 0 }], [1, { t: "rest", water: 0, wop: 0 }]] }
  };

  function mount(el, id, opts = {}) {
    const def = EX[id]; if (!def || !el) return null;
    const u = ++uidSeq;
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Animazione dell'esercizio"></svg>`;
    const svg = el.firstElementChild;
    const draw = def.scene === "front" ? mountFront(svg, def, u) : def.scene === "lying" ? mountLying(svg, def, u) : mountSide(svg, def, u);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, alive = true; const t0 = performance.now();
    const loop = now => { if (!alive) return; draw((now - t0) / 1000); raf = requestAnimationFrame(loop); };
    if (opts.at != null) draw(opts.at);
    else if (reduce) draw(def.cycle * (def.frames[Math.min(2, def.frames.length - 1)][0]) + 0.001);
    else raf = requestAnimationFrame(loop);
    return { stop() { alive = false; cancelAnimationFrame(raf); } };
  }

  window.GolaAnim = { mount, has: id => !!EX[id], caption: id => EX[id]?.caption || "", ids: Object.keys(EX) };
})();
