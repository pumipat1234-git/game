E.Inv = {
  get s() { return E.G.s; },
  addGold(n) { this.s.gold += Math.round(n); },
  spendGold(n) { if (this.s.gold < n) return false; this.s.gold -= Math.round(n); return true; },
  addMat(k, n) { this.s.mats[k] = (this.s.mats[k] || 0) + n; },
  hasMats(m) { for (const k in m) if ((this.s.mats[k] || 0) < m[k]) return false; return true; },
  spendMats(m) { if (!this.hasMats(m)) return false; for (const k in m) this.s.mats[k] -= m[k]; return true; },
  addGear(key, lvl = 0) { const g = { uid: E.U.uid(), key, lvl }; this.s.gear.push(g); return g; },
  gearByUid(uid) { return this.s.gear.find(g => g.uid === uid); },
  equippedBy(uid) { return this.s.heroes.find(h => E.SLOTS.some(sl => h.equip[sl] === uid)); },
  canEquip(h, g) {
    const p = E.Items.parse(g.key); return !p.def.cls || p.def.cls === h.cls;
  },
  equip(h, uid) {
    const g = this.gearByUid(uid); if (!g || !this.canEquip(h, g)) return false;
    const slot = E.Items.slot(g), other = this.equippedBy(uid);
    if (other) other.equip[slot] = null;
    h.equip[slot] = uid; return true;
  },
  unequip(h, slot) { h.equip[slot] = null; },
  sell(uid) {
    const g = this.gearByUid(uid); if (!g || this.equippedBy(uid)) return 0;
    const p = E.Items.sellPrice(g); this.s.gear = this.s.gear.filter(x => x.uid !== uid); this.addGold(p); return p;
  },
  used() { return this.s.gear.length + Object.values(this.s.mats).filter(v => v > 0).length; },
  capacity() { return 60 + this.s.fortress.level * 20; }
};
