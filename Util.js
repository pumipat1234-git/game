E.U = {
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  rand: (a, b) => a + Math.random() * (b - a),
  randInt: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  fmt: n => Math.floor(n).toLocaleString('en-US'),
  uid: (() => { let n = Date.now() % 1e6; return () => 'u' + (n++).toString(36) + Math.floor(Math.random() * 1e3).toString(36); })(),
  clone: o => JSON.parse(JSON.stringify(o)),
  // deterministic PRNG for procedural art
  rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; },
  hex: n => '#' + n.toString(16).padStart(6, '0'),
  mix(a, b, t) { // blend two 0xRRGGBB ints
    const ar = a >> 16 & 255, ag = a >> 8 & 255, ab = a & 255, br = b >> 16 & 255, bg = b >> 8 & 255, bb = b & 255;
    return ((ar + (br - ar) * t) << 16) | ((ag + (bg - ag) * t) << 8) | (ab + (bb - ab) * t) | 0;
  },
  clockStr(min) { const h = Math.floor(min / 60) % 24, m = Math.floor(min % 60); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }
};
