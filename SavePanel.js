/* Manual save/load slots (IndexedDB). Overwrite is always confirmed. No autosave exists. */
E.SavePanel = class extends E.PanelScene {
  constructor() { super('SavePanel', 'Save / Load', 920, 620); }
  init(data) { super.init(data); this.mode = data.mode || 'load'; this.slots = null; this.panelTitle = this.mode === 'save' ? 'Save Game' : 'Load Game'; }
  create() { super.create(); E.Save.list().then(l => { this.slots = l; if (this.scene.isActive()) this.rerender(); }); }
  render() {
    this.put(E.UI.text(this, 24, 62, this.mode === 'save' ? 'Choose a slot to write. Existing saves will ask before being overwritten.' : 'Choose a slot to load.', { size: 15, color: E.CS.dim }));
    if (!this.slots) { this.put(E.UI.text(this, 460, 300, 'Reading saves…', { size: 22, ox: 0.5, color: E.CS.dim })); return; }
    this.slots.forEach((r, i) => {
      const y = 96 + i * 84;
      this.put(E.UI.frame(this, 24, y, 872, 76, r ? 'ui_row' : 'ui_slot'));
      this.put(E.UI.text(this, 44, y + 24, 'Slot ' + (i + 1), { size: 22, bold: true, color: E.CS.goldLight }));
      if (r) {
        const m = r.meta, d = new Date(m.savedAt);
        this.put(E.UI.text(this, 150, y + 10, 'Day ' + m.day + '  ·  ' + m.heroes + ' heroes  ·  top Lv ' + m.maxLevel + '  ·  ' + E.U.fmt(m.gold) + ' gold  ·  Bosses slain: ' + m.progress, { size: 15 }));
        this.put(E.UI.text(this, 150, y + 38, d.toLocaleDateString() + ' ' + d.toLocaleTimeString(), { size: 13, color: E.CS.dim }));
        (m.party || []).forEach((c, k) => this.put(this.add.image(560 + k * 32, y + 50, 'port_' + c).setDisplaySize(28, 28)));
      } else this.put(E.UI.text(this, 150, y + 26, 'Empty', { size: 17, color: E.CS.dim }));
      const main = this.mode === 'save' ? 'Save' : 'Load';
      this.put(E.UI.button(this, 740, y + 38, 110, 42, main, () => this.act(i, r), { size: 17, skin: 'g', disabled: this.mode === 'load' && !r, sfx: 'confirm' }));
      this.put(E.UI.button(this, 856, y + 38, 70, 42, '', () => this.del(i), { icon: 'u_x', size: 12, disabled: !r }));
    });
  }
  act(i, r) {
    if (this.mode === 'save') {
      const go = () => E.Save.write(i).then(() => { E.Sfx.play('confirm'); this.toast('Game saved to slot ' + (i + 1)); this.slots[i] = { meta: E.Save.meta(E.G.s) }; E.Save.get(i).then(x => { this.slots[i] = x; this.rerender(); }); });
      if (r) E.UI.modal(this, 'Overwrite Save?', 'Slot ' + (i + 1) + ' already contains a save (Day ' + r.meta.day + '). It will be permanently replaced.', [{ label: 'Cancel' }, { label: 'Overwrite', skin: 'g', cb: go }]);
      else go();
    } else {
      const go = () => E.Save.load(i).then(ok => {
        if (!ok) return; const parent = this.opts.parent; if (parent) this.scene.stop(parent); this.scene.start('Town');
      });
      if (this.opts.parent === 'Town') E.UI.modal(this, 'Load Game?', 'Unsaved progress in the current game will be lost.', [{ label: 'Cancel' }, { label: 'Load', skin: 'g', cb: go }]);
      else go();
    }
  }
  del(i) {
    E.UI.modal(this, 'Delete Save?', 'Slot ' + (i + 1) + ' will be permanently deleted.', [{ label: 'Cancel' }, { label: 'Delete', skin: 'g', cb: () => E.Save.remove(i).then(() => { this.slots[i] = null; this.rerender(); }) }]);
  }
};
