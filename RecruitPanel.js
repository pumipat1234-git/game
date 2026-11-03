E.RecruitPanel = class extends E.PanelScene {
  constructor() { super('Recruit', 'Recruitment Hall', 1040, 560); }
  hero(x, y, cls, scale) {
    const sp = this.add.sprite(x, y, 'hero_' + cls).setScale(scale).setOrigin(0.5, 0.92); sp.play('idle_' + cls); return sp;
  }
  render() {
    const s = E.G.s, list = s.recruits.list;
    this.put(this.goldBar(780, 10));
    this.put(E.UI.text(this, 24, 62, 'Roster ' + s.heroes.length + ' / ' + E.Town.maxRoster() + '   ·   New candidates arrive every day.', { size: 15, color: E.CS.dim }));
    if (!list.length) this.put(E.UI.text(this, 520, 280, 'No candidates today.\nCome back tomorrow.', { size: 24, color: E.CS.dim, ox: 0.5, align: 'center' }));
    list.forEach((c, i) => {
      const x = 30 + i * 330, y = 100, cls = E.CLASSES[c.cls];
      this.put(E.UI.panel(this, x, y, 310, 430, '', { light: true }));
      this.put(E.UI.frame(this, x + 20, y + 20, 270, 150, 'ui_slot'));
      this.put(this.hero(x + 155, y + 150, c.cls, 5));
      this.put(E.UI.text(this, x + 155, y + 188, c.name, { size: 24, bold: true, ox: 0.5, color: E.CS.goldLight, st: 3 }));
      this.put(E.UI.text(this, x + 155, y + 218, cls.name + ' · ' + cls.role + ' · Lv ' + c.level, { size: 15, ox: 0.5, color: E.CS.blue }));
      this.put(E.UI.text(this, x + 20, y + 246, cls.blurb, { size: 14, wrap: 270, color: E.CS.dim }));
      this.put(E.UI.text(this, x + 20, y + 290, '◆ ' + cls.skill.names[0] + '\n◆ ' + cls.ult.names[0] + ' (Lv 5)', { size: 14, color: E.CS.purple, ls: 5 }));
      const can = s.gold >= c.cost && s.heroes.length < E.Town.maxRoster();
      this.put(this.add.image(x + 30, y + 354, 'u_coin').setScale(1.6)); this.put(E.UI.text(this, x + 48, y + 345, E.U.fmt(c.cost), { size: 20, bold: true, color: s.gold >= c.cost ? E.CS.goldLight : E.CS.red, st: 2 }));
      this.put(E.UI.button(this, x + 155, y + 394, 250, 40, 'Recruit', () => {
        const r = E.Town.recruit(c);
        if (!r.ok) { E.Sfx.play('error'); this.toast(r.why, E.CS.red); return; }
        E.Sfx.play('coin'); this.toast(r.hero.name + ' joins the Bastion!'); this.rerender();
      }, { size: 18, skin: can ? 'g' : 'n', sfx: 'confirm' }));
    });
  }
};
