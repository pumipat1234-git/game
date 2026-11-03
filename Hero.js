E.Hero = {
  create(cls, name, level = 1) {
    return { id: E.U.uid(), name: name || E.U.pick(E.NAMES[cls]), cls, level, xp: 0, tier: 0, equip: { weapon: null, armor: null, accessory: null } };
  },
  xpNeed: lv => Math.floor(60 + lv * lv * 14),
  title(h) { return E.CLASSES[h.cls].titles[h.tier]; },
  /* Final combat stats including tier multiplier and equipment. */
  stats(h) {
    const c = E.CLASSES[h.cls], L = h.level - 1, tm = E.TIER_MULT[h.tier];
    const st = {
      hp: c.base.hp * (1 + c.grow.hp * L) * tm, atk: c.base.atk * (1 + c.grow.atk * L) * tm, def: c.base.def * (1 + c.grow.def * L) * tm,
      spd: c.base.spd, range: c.base.range, cd: c.base.cd, crit: c.base.crit
    };
    for (const slot of E.SLOTS) {
      const uid = h.equip[slot]; if (!uid) continue;
      const g = E.Inv.gearByUid(uid); if (!g) continue;
      const b = E.Items.stats(g); st.hp += b.hp; st.atk += b.atk; st.def += b.def;
    }
    st.hp = Math.round(st.hp); st.atk = Math.round(st.atk); st.def = Math.round(st.def);
    return st;
  },
  power(h) { const s = this.stats(h); return Math.round(s.hp / 10 + s.atk * 4 + s.def * 3); },
  /* Returns number of levels gained. */
  addXp(h, amount, silent) {
    if (h.level >= E.MAX_LEVEL) return 0;
    h.xp += Math.round(amount); let gained = 0;
    while (h.level < E.MAX_LEVEL && h.xp >= this.xpNeed(h.level)) { h.xp -= this.xpNeed(h.level); h.level++; gained++; }
    if (h.level >= E.MAX_LEVEL) h.xp = 0;
    return gained;
  },
  promoReq(h) { return h.tier < 2 ? E.PROMO[h.tier + 1] : null; },
  canPromote(h) {
    const r = this.promoReq(h); if (!r) return { ok: false, why: 'Max tier reached' };
    if (h.level < r.level) return { ok: false, why: 'Requires level ' + r.level };
    if (E.G.s.gold < r.gold) return { ok: false, why: 'Not enough gold' };
    if (!E.Inv.hasMats(r.mats)) return { ok: false, why: 'Missing materials' };
    return { ok: true };
  },
  promote(h) {
    const c = this.canPromote(h); if (!c.ok) return false;
    const r = this.promoReq(h); E.Inv.spendGold(r.gold); E.Inv.spendMats(r.mats);
    h.tier++; E.G.s.stats.promoted++; return true;
  },
  skillName(h, kind) { const c = E.CLASSES[h.cls][kind === 'ult' ? 'ult' : 'skill']; return c.names[h.tier]; },
  skillPower: h => 1 + 0.25 * h.tier,
  ultUnlocked: h => h.level >= E.CLASSES[h.cls].ult.unlock
};
