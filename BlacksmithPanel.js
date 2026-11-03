/* Blacksmith: craft new equipment by tier, upgrade owned equipment up to +5. */
E.BlacksmithPanel = class extends E.PanelScene {
  constructor() { super('Blacksmith', 'Blacksmith', 1180, 640); }
  init(d) { super.init(d); this.st = { page: 0, tab: 'Craft', tier: 0, sel: null, usel: null }; }
  matLine(mats, y, x = 0) {
    const s = E.G.s; let cx = x;
    for (const m in mats) {
      const have = s.mats[m] || 0, ok = have >= mats[m];
      this.put(this.add.image(cx + 10, y + 10, E.MATS[m].icon).setScale(1.5));
      this.put(E.UI.text(this, cx + 26, y, mats[m] + '/' + have, { size: 15, bold: true, color: ok ? E.CS.green : E.CS.red, st: 2 })); cx += 96;
    }
  }
  render() {
    const st = this.st, s = E.G.s;
    this.put(this.goldBar(1000, 10));
    ['Craft', 'Upgrade'].forEach((t, i) => this.put(E.UI.button(this, 100 + i * 170, 82, 160, 36, t, () => { st.tab = t; st.page = 0; this.rerender(); }, { size: 17 }).setSelected(st.tab === t)));
    if (st.tab === 'Craft') this.renderCraft(); else this.renderUpgrade();
  }
  renderCraft() {
    const st = this.st, s = E.G.s;
    E.TIERS.forEach((t, i) => this.put(E.UI.button(this, 100 + i * 112, 134, 106, 34, t.name, () => { st.tier = i; st.sel = null; this.rerender(); }, { size: 13, color: E.RARITY[t.rarity].css }).setSelected(st.tier === i)));
    const keys = Object.keys(E.EQUIP).map(ty => E.Items.key(ty, st.tier));
    keys.forEach((k, i) => {
      const y = 166 + i * 48, p = E.Items.parse(k), g = { key: k, lvl: 0 }, r = E.Items.rarity(g), sel = st.sel === k;
      const row = this.put(E.UI.frame(this, 24, y, 590, 44, sel ? 'ui_row_s' : 'ui_row'));
      row.setInteractive({ useHandCursor: true }).on('pointerdown', () => { st.sel = k; E.Sfx.play('click'); this.rerender(); });
      this.put(this.add.image(46, y + 22, p.def.icon).setScale(2));
      this.put(E.UI.text(this, 72, y + 4, E.Items.name(g), { size: 16, bold: true, color: r.css }), E.UI.text(this, 72, y + 25, E.Items.statLine(E.Items.stats(g)) + (p.def.cls ? '  ·  ' + E.CLASSES[p.def.cls].name : ''), { size: 12, color: E.CS.dim }));
      const can = E.Craft.canCraft(k).ok; this.put(E.UI.text(this, 600, y + 22, can ? '✔' : '', { size: 18, color: E.CS.green, ox: 1, oy: 0.5 }));
    });
    // detail
    this.put(E.UI.panel(this, 640, 134, 516, 480, '', { light: true }));
    if (!st.sel) { this.put(E.UI.text(this, 898, 360, 'Select a recipe', { size: 20, color: E.CS.dim, ox: 0.5 })); return; }
    const k = st.sel, p = E.Items.parse(k), g = { key: k, lvl: 0 }, r = E.Items.rarity(g), rec = E.Items.recipe(k), c = E.Craft.canCraft(k);
    this.put(E.UI.slot(this, 664, 158, 88, p.def.icon, r.color));
    this.put(E.UI.text(this, 770, 160, E.Items.name(g), { size: 24, bold: true, color: r.css, wrap: 360, st: 2 }), E.UI.text(this, 770, 220, r.name + ' ' + E.SLOT_NAMES[p.def.slot], { size: 14, color: E.CS.dim }));
    const stt = E.Items.stats(g); let y = 268;
    for (const [kk, ic, lb] of [['atk', 'u_atk', 'Attack'], ['def', 'u_def', 'Defense'], ['hp', 'u_heart', 'Health']]) if (stt[kk]) { this.put(E.UI.statRow(this, 668, y, ic, lb, '+' + stt[kk], 440)); y += 28; }
    this.put(E.UI.text(this, 668, y + 8, p.def.cls ? 'Equippable by: ' + E.CLASSES[p.def.cls].name + ' only' : 'Equippable by any hero', { size: 14, color: E.CS.blue }));
    this.put(E.UI.text(this, 668, 400, 'Materials needed', { size: 15, bold: true, color: E.CS.goldLight }));
    this.matLine(rec.mats, 428, 668);
    this.put(this.add.image(678, 478, 'u_coin').setScale(1.5)); this.put(E.UI.text(this, 696, 468, E.U.fmt(rec.gold) + 'g', { size: 17, bold: true, color: s.gold >= rec.gold ? E.CS.goldLight : E.CS.red, st: 2 }));
    this.put(E.UI.button(this, 898, 558, 340, 50, c.ok ? 'Craft' : c.why, () => {
      const it = E.Craft.craft(k); if (!it) { E.Sfx.play('error'); return; }
      E.Sfx.play('anvil'); this.toast('Forged: ' + E.Items.name(it), E.Items.rarity(it).css); this.rerender();
    }, { size: 20, skin: c.ok ? 'g' : 'n', disabled: !c.ok, sfx: 'anvil' }));
  }
  renderUpgrade() {
    const st = this.st, s = E.G.s, per = 7;
    const gear = s.gear.slice().sort((a, b) => E.Items.rarity(b).color - E.Items.rarity(a).color || b.lvl - a.lvl);
    if (!st.usel || !E.Inv.gearByUid(st.usel)) st.usel = gear[0] && gear[0].uid;
    this.put(E.UI.pager(this, 24, 590, st, gear.length, per, () => this.rerender()));
    if (!gear.length) this.put(E.UI.text(this, 300, 300, 'You own no equipment.', { size: 20, color: E.CS.dim, ox: 0.5 }));
    gear.slice(st.page * per, st.page * per + per).forEach((g, i) => {
      const y = 134 + i * 64, r = E.Items.rarity(g), sel = st.usel === g.uid, by = E.Inv.equippedBy(g.uid);
      const row = this.put(E.UI.frame(this, 24, y, 590, 58, sel ? 'ui_row_s' : 'ui_row'));
      row.setInteractive({ useHandCursor: true }).on('pointerdown', () => { st.usel = g.uid; E.Sfx.play('click'); this.rerender(); });
      this.put(this.add.image(48, y + 29, E.Items.icon(g)).setScale(2));
      this.put(E.UI.text(this, 76, y + 8, E.Items.name(g), { size: 17, bold: true, color: r.css }), E.UI.text(this, 76, y + 32, E.Items.statLine(E.Items.stats(g)) + (by ? '  ·  on ' + by.name : ''), { size: 12, color: E.CS.dim }));
    });
    this.put(E.UI.panel(this, 640, 134, 516, 480, '', { light: true }));
    const g = st.usel && E.Inv.gearByUid(st.usel); if (!g) return;
    const r = E.Items.rarity(g), c = E.Craft.canUpgrade(g), cost = E.Items.upgradeCost(g), cur = E.Items.stats(g), nx = E.Items.stats({ key: g.key, lvl: g.lvl + 1 });
    this.put(E.UI.slot(this, 664, 158, 88, E.Items.icon(g), r.color));
    this.put(E.UI.text(this, 770, 160, E.Items.name(g), { size: 24, bold: true, color: r.css, wrap: 360, st: 2 }), E.UI.text(this, 770, 220, 'Upgrade +' + g.lvl + ' → +' + Math.min(E.MAX_UPGRADE, g.lvl + 1), { size: 15, color: E.CS.purple }));
    let y = 270;
    for (const [kk, ic, lb] of [['atk', 'u_atk', 'Attack'], ['def', 'u_def', 'Defense'], ['hp', 'u_heart', 'Health']]) if (cur[kk]) {
      this.put(E.UI.statRow(this, 668, y, ic, lb, cur[kk] + (g.lvl < E.MAX_UPGRADE ? '  →  ' + nx[kk] : ''), 440)); y += 28;
    }
    if (g.lvl < E.MAX_UPGRADE) { this.put(E.UI.text(this, 668, 400, 'Upgrade cost', { size: 15, bold: true, color: E.CS.goldLight })); this.matLine(cost.mats, 428, 668); this.put(this.add.image(678, 478, 'u_coin').setScale(1.5)); this.put(E.UI.text(this, 696, 468, E.U.fmt(cost.gold) + 'g', { size: 17, bold: true, color: s.gold >= cost.gold ? E.CS.goldLight : E.CS.red, st: 2 })); }
    this.put(E.UI.button(this, 898, 558, 340, 50, c.ok ? 'Upgrade' : c.why, () => {
      if (E.Craft.upgrade(g)) { E.Sfx.play('anvil'); this.toast(E.Items.name(g) + ' upgraded!', E.CS.green); this.rerender(); } else E.Sfx.play('error');
    }, { size: 20, skin: c.ok ? 'g' : 'n', disabled: !c.ok, sfx: 'anvil' }));
  }
};
