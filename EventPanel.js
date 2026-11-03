/* Random / timed town events. Must be resolved by choosing an option. */
E.EventPanel = class extends E.PanelScene {
  constructor() { super('Event', '', 780, 430); }
  init(data) { super.init(data); this.ev = data.event; this.panelTitle = this.ev.title; this.result = null; }
  create() { super.create(); this.closeBtn.setVisible(false).disableInteractive(); this.input.keyboard.removeAllListeners(); }
  close() { if (!this.result) return; super.close(); }
  render() {
    const ev = this.ev, s = E.G.s;
    this.put(E.UI.text(this, 40, 74, ev.special ? '🌑 ' + 'The sky turns red…' : 'Day ' + E.G.day() + ' · ' + E.U.clockStr(s.time), { size: 15, color: ev.special ? E.CS.red : E.CS.dim }));
    this.put(E.UI.text(this, 40, 108, this.result ? this.result.text : ev.text, { size: 21, wrap: 700, ls: 8 }));
    if (!this.result) {
      ev.choices.forEach((c, i) => {
        const ok = !c.cond || c.cond(s);
        this.put(E.UI.button(this, 390, 250 + i * 58, 640, 46, c.label, () => {
          this.result = c.do(s); E.Sfx.play(this.result.battle ? 'warn' : 'coin'); this.rerender();
        }, { size: 18, disabled: !ok, skin: ev.special && i === 0 ? 'g' : 'n' }));
      });
    } else {
      this.put(E.UI.button(this, 390, 360, 300, 50, this.result.battle ? 'To the walls!' : 'Continue', () => {
        if (this.result.battle) { this.scene.stop('Town'); this.scene.start('Formation', { mode: 'battle', dungeon: E.Dungeons.raid(E.G.day()), stage: 0 }); }
        else this.close();
      }, { size: 20, sfx: 'confirm', skin: 'g' }));
    }
  }
};
