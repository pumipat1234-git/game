/* Inventory: equipment + materials, tabs, details, selling. */
E.InventoryPanel = class extends E.PanelScene {
  constructor() { super('Inventory', 'Inventory', 1100, 620); }
  init(d) { super.init(d); this.st = { page: 0, tab: 'All', sel: null }; }
  items() {
    const s = E.G.s, out = [], t = this.st.tab;
    if (t === 'All' || t === 'Equipment') s.gear.slice().sort((a, b) => E.Items.rarity(b).color - E.Items.rarity(a).color || a.key.localeCompare(b.key)).forEach(g => out.push({ type: 'gear', g }));
    if (t === 'All' || t === 'Material') for (const m in E.MATS) if ((s.mats[m] || 0) > 0) out.push({ type: 'mat', m });
    return out;
  }
  render() {
    const s = E.G.s, st = this.st, per = 28, cols = 7;
    this.put(this.goldBar(900, 10));
    ['All', 'Equipment', 'Material'].forEach((t, i) => this.put(E.UI.button(this, 100 + i * 150, 82, 140, 34, t, () => { st.tab = t; st.page = 0; st.sel = null; this.rerender(); }, { size: 15 }).setSelected(st.tab === t)));
    const items = this.items();
    this.put(E.UI.pager(this, 24, 562, st, items.length, per, () => this.rerender()));
    this.put(E.UI.text(this, 300, 566, 'Capacity ' + s.gear.length + ' / ' + E.Inv.capacity() + ' equipment', { size: 14, color: E.CS.dim }));
    items.slice(st.page * per, st.page * per + per).forEach((it, i) => {
      const x = 24 + (i % cols) * 78, y = 130 + Math.floor(i / cols) * 78;
      const key = it.type === 'gear' ? it.g.uid : it.m, sel = st.sel === key;
      const slot = it.type === 'gear'
        ? this.put(E.UI.slot(this, x, y, 70, E.Items.icon(it.g), E.Items.rarity(it.g).color, it.g.lvl ? '+' + it.g.lvl : null, sel))
        : this.put(E.UI.slot(this, x, y, 70, E.MATS[it.m].icon, null, E.U.fmt(s.mats[it.m]), sel));
      slot.setInteractive({ useHandCursor: true }).on('pointerdown', () => { st.sel = key; E.Sfx.play('click'); this.rerender(); });
      if (it.type === 'gear' && E.Inv.equippedBy(it.g.uid)) this.put(E.UI.text(this, x + 6, y + 4, 'E', { size: 13, bold: true, color: E.CS.green, st: 3 }));
    });
    if (!items.length) this.put(E.UI.text(this, 280, 260, 'Nothing here yet.', { size: 20, color: E.CS.dim, ox: 0.5 }));
    // detail pane
    this.put(E.UI.panel(this, 590, 70, 486, 520, '', { light: true }));
    const mat = st.sel && E.MATS[st.sel] ? st.sel : null, g = st.sel && E.Inv.gearByUid(st.sel);
    if (g) {
      const r = E.Items.rarity(g), p = E.Items.parse(g.key), by = E.Inv.equippedBy(g.uid);
      this.put(E.UI.slot(this, 616, 96, 84, E.Items.icon(g), r.color));
      this.put(E.UI.text(this, 716, 98, E.Items.name(g), { size: 24, bold: true, color: r.css, wrap: 340, st: 2 }), E.UI.text(this, 716, 158, r.name + ' ' + E.SLOT_NAMES[p.def.slot], { size: 15, color: E.CS.dim }));
      const stt = E.Items.stats(g); let y = 214;
      for (const [k, ic, lb] of [['atk', 'u_atk', 'Attack'], ['def', 'u_def', 'Defense'], ['hp', 'u_heart', 'Health']]) if (stt[k]) { this.put(E.UI.statRow(this, 620, y, ic, lb, '+' + stt[k], 420)); y += 28; }
      this.put(E.UI.text(this, 620, y + 10, 'Upgrade level +' + g.lvl + ' / ' + E.MAX_UPGRADE + '  (upgrade at the Blacksmith)', { size: 14, color: E.CS.purple }));
      this.put(E.UI.text(this, 620, y + 40, p.def.cls ? 'Usable by: ' + E.CLASSES[p.def.cls].name : 'Usable by: any hero', { size: 14, color: E.CS.blue }));
      this.put(E.UI.text(this, 620, y + 66, by ? 'Equipped by ' + by.name : 'In storage', { size: 14, color: by ? E.CS.green : E.CS.dim }));
      const price = E.Items.sellPrice(g);
      this.put(E.UI.button(this, 833, 540, 300, 44, 'Sell for ' + E.U.fmt(price) + 'g', () => {
        E.UI.modal(this, 'Sell item?', 'Sell ' + E.Items.name(g) + ' for ' + price + ' gold?', [{ label: 'Cancel' }, { label: 'Sell', skin: 'g', cb: () => { E.Inv.sell(g.uid); E.Sfx.play('coin'); st.sel = null; this.rerender(); } }]);
      }, { size: 17, disabled: !!by }));
    } else if (mat) {
      this.put(E.UI.slot(this, 616, 96, 84, E.MATS[mat].icon, null, null));
      this.put(E.UI.text(this, 716, 98, E.MATS[mat].name, { size: 24, bold: true, wrap: 340 }), E.UI.text(this, 716, 140, 'Owned: ' + E.U.fmt(s.mats[mat]), { size: 18, color: E.CS.goldLight }));
      const src = E.DUNGEONS.filter(d => d.mats[mat]).map(d => d.name).join(', ');
      this.put(E.UI.text(this, 620, 214, 'Crafting material. Dropped in: ' + src + '.\nUsed for crafting, upgrades, promotions and Bastion upgrades.', { size: 15, color: E.CS.dim, wrap: 430, ls: 6 }));
    } else this.put(E.UI.text(this, 833, 300, 'Select an item', { size: 20, color: E.CS.dim, ox: 0.5 }));
  }
};
