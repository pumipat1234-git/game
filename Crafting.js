/* Blacksmith: craft (gold + materials) and upgrade equipment up to +5. */
E.Craft = {
  canCraft(key) {
    const r = E.Items.recipe(key), s = E.G.s;
    if (s.gear.length >= E.Inv.capacity()) return { ok: false, why: 'Inventory full' };
    if (s.gold < r.gold) return { ok: false, why: 'Not enough gold' };
    if (!E.Inv.hasMats(r.mats)) return { ok: false, why: 'Missing materials' };
    return { ok: true };
  },
  craft(key) {
    const c = this.canCraft(key); if (!c.ok) return null;
    const r = E.Items.recipe(key); E.Inv.spendGold(r.gold); E.Inv.spendMats(r.mats);
    E.G.s.stats.crafted++; return E.Inv.addGear(key);
  },
  canUpgrade(g) {
    if ((g.lvl || 0) >= E.MAX_UPGRADE) return { ok: false, why: 'Max +' + E.MAX_UPGRADE };
    const c = E.Items.upgradeCost(g);
    if (E.G.s.gold < c.gold) return { ok: false, why: 'Not enough gold' };
    if (!E.Inv.hasMats(c.mats)) return { ok: false, why: 'Missing materials' };
    return { ok: true };
  },
  upgrade(g) {
    if (!this.canUpgrade(g).ok) return false;
    const c = E.Items.upgradeCost(g); E.Inv.spendGold(c.gold); E.Inv.spendMats(c.mats);
    g.lvl = (g.lvl || 0) + 1; E.G.s.stats.upgrades++; return true;
  }
};
