/* Expedition Gate: world map of Eldoria, dungeon + stage selection, then Formation -> Battle. */
E.ExpeditionPanel = class extends E.PanelScene {
  constructor() { super('Expedition', 'Expedition Gate — Eldoria', 1220, 660); }
  init(d) { super.init(d); const s = E.G.s; this.st = { sel: 'forest', stage: null }; }
  render() {
    const s = E.G.s, st = this.st, MX = 24, MY = 70, MS = 2;
    this.put(this.add.image(MX, MY, 'worldmap').setOrigin(0).setScale(MS));
    // home marker
    this.put(this.add.image(MX + 0.14 * 380 * MS, MY + 0.42 * 220 * MS, 'u_home').setScale(2.5));
    this.put(E.UI.text(this, MX + 0.14 * 380 * MS, MY + 0.42 * 220 * MS + 22, 'The Last Bastion', { size: 12, bold: true, ox: 0.5, st: 3, color: E.CS.goldLight }));
    E.DUNGEONS.forEach(d => {
      const x = MX + d.mapPos[0] * 380 * MS, y = MY + d.mapPos[1] * 220 * MS, un = E.Dungeons.isUnlocked(d, s), sel = st.sel === d.id, boss = s.cleared[d.id] && s.cleared[d.id].boss;
      const b = this.put(E.UI.button(this, x, y, 50, 46, '', () => { st.sel = d.id; st.stage = null; E.Sfx.play('click'); this.rerender(); }, { icon: un ? (boss ? 'u_star' : 'u_skull') : 'u_lock', iconScale: 2.4, skin: sel ? 'g' : 'n' }));
      b.ic.x = 0;
      this.put(E.UI.text(this, x, y + 30, d.region, { size: 13, bold: true, ox: 0.5, st: 4, color: un ? (sel ? E.CS.goldLight : E.CS.text) : E.CS.dim }));
      if (sel) { const ring = this.add.circle(x, y, 36).setStrokeStyle(3, E.C.goldLight); this.put(ring); this.tweens.add({ targets: ring, scale: 1.25, alpha: 0.2, yoyo: false, repeat: -1, duration: 900 }); }
    });
    const d = E.Dungeons.get(st.sel), un = E.Dungeons.isUnlocked(d, s), c = s.cleared[d.id] || { stages: 0, boss: false, clears: 0 };
    // info under map
    this.put(E.UI.text(this, 24, 520, d.region + ' — ' + d.name, { size: 22, bold: true, color: E.CS.goldLight, st: 3 }));
    this.put(E.UI.text(this, 24, 552, d.desc, { size: 14, color: E.CS.dim, wrap: 740 }));
    const drops = Object.keys(d.mats).map(m => E.MATS[m].name).join(', ');
    this.put(E.UI.text(this, 24, 598, 'Drops: ' + E.U.fmt(d.gold[0]) + '–' + E.U.fmt(d.gold[1]) + ' gold, ' + drops + '; ' + E.TIERS[d.gearTier].name + '-tier gear. No stamina — replay freely.', { size: 13, color: E.CS.purple, wrap: 740 }));
    // right: stage list
    this.put(E.UI.panel(this, 800, 70, 396, 570, 'Stages', { light: true, titleSize: 20 }));
    this.put(E.UI.text(this, 820, 120, 'Recommended Lv ' + d.recLv + '+   ·   Clears: ' + c.clears, { size: 14, color: un ? E.CS.blue : E.CS.red }));
    if (!un) { const need = E.Dungeons.get(d.unlock); this.put(E.UI.text(this, 998, 330, '🔒 Locked\n\nDefeat the boss of\n' + need.name + '\nto open this region.', { size: 20, ox: 0.5, align: 'center', color: E.CS.dim, ls: 6 })); return; }
    d.stages.forEach((sg, i) => {
      const y = 154 + i * 76, open = E.Dungeons.stageUnlocked(d, i, s), done = c.stages > i, sel = st.stage === i;
      const row = this.put(E.UI.frame(this, 820, y, 356, 68, sel ? 'ui_row_s' : 'ui_row'));
      if (open) row.setInteractive({ useHandCursor: true }).on('pointerdown', () => { st.stage = i; E.Sfx.play('click'); this.rerender(); });
      this.put(E.UI.text(this, 836, y + 8, (i + 1) + '. ' + sg.name, { size: 17, bold: true, color: open ? (sg.boss ? E.CS.red : E.CS.text) : E.CS.dim }));
      const en = E.Run.buildEnemies(d, i), elite = en.filter(e => e.elite && !e.boss).length;
      this.put(E.UI.text(this, 836, y + 36, open ? en.length + ' enemies' + (elite ? ' · ' + elite + ' elite' : '') + (sg.boss ? ' · BOSS' : '') : 'Clear the previous stage', { size: 13, color: E.CS.dim }));
      if (done) this.put(this.add.image(1148, y + 34, 'u_check').setScale(2));
      else if (!open) this.put(this.add.image(1148, y + 34, 'u_lock').setScale(2));
    });
    const stg = st.stage;
    this.put(E.UI.text(this, 820, 470, stg !== null ? 'Stage ' + (stg + 1) + ': ' + d.stages[stg].name : 'Select a stage', { size: 15, color: E.CS.goldLight, bold: true }));
    if (stg !== null) { this.put(E.UI.text(this, 820, 494, 'Party power ' + s.party.reduce((a, id) => a + E.Hero.power(E.G.hero(id)), 0) + '  ·  ' + s.party.length + ' hero(es)', { size: 13, color: E.CS.dim })); }
    this.put(E.UI.button(this, 998, 580, 340, 54, 'Deploy', () => {
      this.scene.stop(); this.scene.stop('Town'); this.scene.start('Formation', { mode: 'battle', dungeon: d, stage: stg });
    }, { size: 22, skin: 'g', disabled: stg === null, icon: 'u_swords', sfx: 'confirm' }));
  }
};
