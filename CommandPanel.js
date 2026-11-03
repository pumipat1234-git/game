/* Command Hall: collect taxes, upgrade the Bastion, quests. */
E.CommandPanel = class extends E.PanelScene {
  constructor() { super('Command', 'Command Hall', 1180, 640); }
  render() {
    const s = E.G.s, f = s.fortress, T = E.Town;
    this.put(this.goldBar(1000, 10));
    // left: Bastion
    this.put(E.UI.panel(this, 24, 70, 420, 546, 'The Last Bastion', { light: true, titleSize: 20 }));
    this.put(E.UI.text(this, 44, 130, 'Fortress Level ' + f.level + ' / 5', { size: 22, bold: true, color: E.CS.goldLight }));
    for (let i = 0; i < 5; i++) this.put(this.add.image(50 + i * 34, 186, 'u_star').setScale(2).setTint(i < f.level ? 0xffffff : 0x333344));
    const rows = [['Taxes per day', E.U.fmt(T.taxPerDay()) + ' g'], ['Roster capacity', s.heroes.length + ' / ' + T.maxRoster()], ['Training slots', T.trainSlots()], ['Inventory capacity', E.Inv.capacity()], ['Day', E.G.day()]];
    rows.forEach((r, i) => this.put(E.UI.statRow(this, 44, 220 + i * 26, null, r[0], r[1], 370)));
    this.put(E.UI.text(this, 44, 366, 'Pending taxes', { size: 15, color: E.CS.dim }), E.UI.text(this, 414, 366, E.U.fmt(f.taxPending) + ' g', { size: 20, bold: true, ox: 1, color: E.CS.goldLight }));
    this.put(E.UI.button(this, 234, 418, 360, 44, 'Collect Taxes', () => { const n = T.collectTax(); E.Sfx.play('coin'); this.toast('+' + E.U.fmt(n) + ' gold collected'); this.rerender(); }, { size: 18, skin: 'g', disabled: f.taxPending < 1 }));
    const c = T.upgradeCost(), max = f.level >= 5;
    const need = max ? 'Bastion fully restored' : 'Upgrade: ' + E.U.fmt(c.gold) + 'g  +  ' + Object.keys(c.mats).map(m => c.mats[m] + ' ' + E.MATS[m].name).join(', ');
    this.put(E.UI.text(this, 234, 480, need, { size: 14, ox: 0.5, color: max ? E.CS.green : (s.gold >= c.gold && E.Inv.hasMats(c.mats) ? E.CS.text : E.CS.red), wrap: 380, align: 'center' }));
    this.put(E.UI.button(this, 234, 548, 360, 48, max ? 'Max Level' : 'Upgrade Bastion', () => {
      const r = T.upgradeFortress(); if (!r.ok) { E.Sfx.play('error'); this.toast(r.why, E.CS.red); return; }
      E.Sfx.play('levelup'); this.toast('The Bastion grows stronger! (Level ' + s.fortress.level + ')'); this.rerender();
    }, { size: 18, disabled: max }));
    // right: quests
    this.put(E.UI.panel(this, 460, 70, 696, 546, 'Main Quests', { light: true, titleSize: 20 }));
    const st = this.st, per = 5;
    const qs = E.QUESTS.slice().sort((a, b) => { const o = { ready: 0, active: 1, claimed: 2 }; return o[T.questState(a)] - o[T.questState(b)]; });
    this.put(E.UI.pager(this, 480, 585, st, qs.length, per, () => this.rerender()));
    qs.slice(st.page * per, st.page * per + per).forEach((q, i) => {
      const y = 126 + i * 90, state = T.questState(q);
      this.put(E.UI.frame(this, 480, y, 656, 82, state === 'ready' ? 'ui_row_s' : 'ui_row'));
      this.put(E.UI.text(this, 498, y + 8, (state === 'claimed' ? '✔ ' : '◆ ') + q.title, { size: 18, bold: true, color: state === 'claimed' ? E.CS.dim : state === 'ready' ? E.CS.green : E.CS.goldLight }));
      this.put(E.UI.text(this, 498, y + 34, q.desc, { size: 13, color: E.CS.dim, wrap: 420 }));
      const r = q.reward, parts = []; if (r.gold) parts.push(E.U.fmt(r.gold) + 'g'); for (const m in (r.mats || {})) parts.push(r.mats[m] + ' ' + E.MATS[m].name.split(' ')[0]);
      this.put(E.UI.text(this, 498, y + 62, 'Reward: ' + parts.join(', ') + '    Progress: ' + q.prog(s), { size: 12, color: E.CS.purple }));
      if (state === 'ready') this.put(E.UI.button(this, 1060, y + 41, 130, 44, 'Claim', () => { T.claimQuest(q); E.Sfx.play('levelup'); this.toast('Quest complete: ' + q.title); this.rerender(); }, { size: 17, skin: 'g', sfx: 'confirm' }));
      else if (state === 'claimed') this.put(E.UI.text(this, 1060, y + 41, 'Done', { size: 16, color: E.CS.dim, ox: 0.5, oy: 0.5 }));
      else this.put(E.UI.text(this, 1060, y + 41, 'In progress', { size: 15, color: E.CS.blue, ox: 0.5, oy: 0.5 }));
    });
  }
};
