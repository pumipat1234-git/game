E.TrainingPanel = class extends E.PanelScene {
  constructor() { super('Training', 'Training Ground', 1000, 560); }
  create() { super.create(); this.timer = this.time.addEvent({ delay: 500, loop: true, callback: () => { if (!this.st.pick) this.rerender(); } }); }
  render() {
    const s = E.G.s, slots = E.Town.trainSlots();
    this.put(this.goldBar(780, 10));
    this.put(E.UI.text(this, 24, 62, 'Assigned heroes gain XP as in-game time passes (max 24h per session). Slots: ' + s.training.length + ' / ' + slots, { size: 15, color: E.CS.dim }));
    if (this.st.pick) return this.renderPicker();
    for (let i = 0; i < 3; i++) {
      const x = 30 + i * 320, y = 100, t = s.training[i], locked = i >= slots;
      this.put(E.UI.panel(this, x, y, 300, 420, '', { light: true }));
      if (locked) { this.put(this.add.image(x + 150, y + 170, 'u_lock').setScale(5)); this.put(E.UI.text(this, x + 150, y + 250, 'Upgrade the Bastion\nto unlock', { size: 16, color: E.CS.dim, ox: 0.5, align: 'center' })); continue; }
      if (!t) {
        this.put(E.UI.text(this, x + 150, y + 150, 'Empty Slot', { size: 22, color: E.CS.dim, ox: 0.5 }));
        this.put(E.UI.button(this, x + 150, y + 380, 240, 44, 'Assign Hero', () => { this.st.pick = true; this.rerender(); }, { size: 18 }));
        continue;
      }
      const h = E.G.hero(t.heroId), xp = E.Town.trainingXp(t), hrs = Math.min(24, (s.time - t.start) / 60), cls = E.CLASSES[h.cls];
      this.put(E.UI.frame(this, x + 20, y + 20, 260, 150, 'ui_slot'));
      const sp = this.add.sprite(x + 150, y + 150, 'hero_' + h.cls).setScale(5).setOrigin(0.5, 0.92); sp.play('atk_' + h.cls); sp.on('animationcomplete', () => sp.play('idle_' + h.cls)); this.put(sp);
      this.put(E.UI.text(this, x + 150, y + 188, h.name, { size: 22, bold: true, ox: 0.5, color: E.CS.goldLight, st: 3 }));
      this.put(E.UI.text(this, x + 150, y + 216, 'Lv ' + h.level + ' ' + E.Hero.title(h), { size: 15, ox: 0.5, color: E.CS.blue }));
      this.put(E.UI.text(this, x + 150, y + 250, 'Training: ' + hrs.toFixed(1) + ' h', { size: 15, ox: 0.5, color: E.CS.dim }));
      this.put(E.UI.text(this, x + 150, y + 280, '+' + E.U.fmt(xp) + ' XP', { size: 28, ox: 0.5, bold: true, color: E.CS.green, st: 3 }));
      this.put(E.UI.text(this, x + 150, y + 316, E.Town.trainRate(h) + ' XP / hour', { size: 13, ox: 0.5, color: E.CS.dim }));
      this.put(E.UI.button(this, x + 150, y + 380, 240, 44, 'Collect', () => {
        const r = E.Town.collectTraining(t); E.Sfx.play(r.levels ? 'levelup' : 'coin');
        this.toast(r.hero.name + ' gained ' + r.xp + ' XP' + (r.levels ? ' — Level up! (Lv ' + r.hero.level + ')' : '')); this.rerender();
      }, { size: 18, skin: 'g', sfx: 'confirm' }));
    }
  }
  renderPicker() {
    const s = E.G.s, st = this.st;
    this.put(E.UI.text(this, 24, 96, 'Choose a hero to train (cost in gold, paid up front):', { size: 17, color: E.CS.goldLight }));
    const avail = s.heroes.filter(h => !s.training.some(t => t.heroId === h.id)), per = 6;
    this.put(E.UI.pager(this, 24, 520, st, avail.length, per, () => this.rerender()));
    avail.slice(st.page * per, st.page * per + per).forEach((h, i) => {
      const y = 130 + i * 62, cost = E.Town.trainCost(h);
      this.put(E.UI.frame(this, 24, y, 950, 54, 'ui_row'));
      this.put(E.UI.portrait(this, 32, y + 1, h.cls, 44));
      this.put(E.UI.text(this, 100, y + 8, h.name, { size: 19, bold: true }), E.UI.text(this, 100, y + 30, 'Lv ' + h.level + ' ' + E.Hero.title(h) + '  ·  ' + E.Town.trainRate(h) + ' XP/h', { size: 13, color: E.CS.dim }));
      this.put(E.UI.button(this, 860, y + 27, 170, 40, cost + 'g · Train', () => {
        const r = E.Town.startTraining(h); if (!r.ok) { E.Sfx.play('error'); this.toast(r.why, E.CS.red); return; }
        st.pick = false; E.Sfx.play('coin'); this.rerender();
      }, { size: 16, disabled: s.gold < cost || h.level >= E.MAX_LEVEL }));
    });
    this.put(E.UI.button(this, 900, 520, 170, 40, 'Back', () => { st.pick = false; this.rerender(); }, { size: 16 }));
  }
};
