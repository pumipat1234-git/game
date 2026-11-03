/* Formation logic: free placement inside the deploy zone, no overlaps, auto-arrange, presets. */
E.Form = {
  zone: { x0: 70, x1: 560, y0: 130, y1: 560 },
  minDist: 78,
  clampPos(p) { return { x: E.U.clamp(p.x, this.zone.x0, this.zone.x1), y: E.U.clamp(p.y, this.zone.y0, this.zone.y1) }; },
  overlaps(p, others) { return others.some(o => Math.hypot(o.x - p.x, o.y - p.y) < this.minDist); },
  /* Nearest free spot to p (spiral search) that doesn't overlap `others`. */
  freeSpot(p, others) {
    p = this.clampPos(p);
    if (!this.overlaps(p, others)) return p;
    for (let r = 8; r < 600; r += 8) {
      const steps = Math.max(8, Math.floor(r / 6));
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const q = this.clampPos({ x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r });
        if (!this.overlaps(q, others)) return q;
      }
    }
    return p;
  },
  /* Role-based layout: tanks forward, healers/mages back. Writes into posMap. */
  autoArrange(heroes, posMap) {
    const rowX = { guardian: 470, warrior: 400, archer: 250, mage: 175, cleric: 130 };
    const byRow = {};
    heroes.forEach(h => { (byRow[h.cls] = byRow[h.cls] || []).push(h); });
    const order = ['guardian', 'warrior', 'archer', 'mage', 'cleric'];
    const n = heroes.length, zH = this.zone.y1 - this.zone.y0;
    // spread all heroes vertically, sorted by their class column
    const sorted = heroes.slice().sort((a, b) => order.indexOf(a.cls) - order.indexOf(b.cls));
    const used = [];
    sorted.forEach((h, i) => {
      const y = this.zone.y0 + zH * ((i + 0.5) / n) * 0.9 + zH * 0.05;
      // interleave: alternate order vertically so columns stay clear
      const idx = (i * 2) % n + (i * 2 >= n ? 1 : 0);
      const yy = this.zone.y0 + 20 + (zH - 40) * (n === 1 ? 0.5 : idx / (n - 1));
      const spot = this.freeSpot({ x: rowX[h.cls] || 300, y: yy }, used);
      used.push(spot); posMap[h.id] = spot;
    });
    return posMap;
  },
  /* Make sure every party hero has a valid, non-overlapping position. */
  sanitize(s) {
    const used = [];
    s.party.forEach(id => {
      let p = s.formation.pos[id] || { x: 200, y: 340 };
      p = this.freeSpot(p, used); used.push(p); s.formation.pos[id] = { x: Math.round(p.x), y: Math.round(p.y) };
    });
  },
  savePreset(s, i) {
    const pos = {}; s.party.forEach(id => { pos[id] = Object.assign({}, s.formation.pos[id]); });
    s.formation.presets[i] = { party: s.party.slice(), pos };
  },
  loadPreset(s, i) {
    const p = s.formation.presets[i]; if (!p) return false;
    const ids = p.party.filter(id => s.heroes.some(h => h.id === id)).slice(0, E.MAX_PARTY);
    s.party = ids; ids.forEach(id => { s.formation.pos[id] = Object.assign({}, p.pos[id]); });
    this.sanitize(s); return true;
  }
};
