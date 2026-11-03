E.SettingsPanel = class extends E.PanelScene {
  constructor() { super('Settings', 'Settings', 720, 540); }
  slider(x, y, w, key, label) {
    this.put(E.UI.text(this, x, y - 4, label, { size: 18, bold: true }));
    const tx = x + 230, tw = w - 230, val = E.Settings.d[key];
    const track = this.add.rectangle(tx, y + 10, tw, 8, 0x05050c).setOrigin(0, 0.5).setStrokeStyle(1, E.C.goldDark);
    const fill = this.add.rectangle(tx, y + 10, tw * val, 8, E.C.purple).setOrigin(0, 0.5);
    const knob = this.add.rectangle(tx + tw * val, y + 10, 16, 26, E.C.gold).setStrokeStyle(2, E.C.goldLight);
    const pct = E.UI.text(this, tx + tw + 14, y + 10, Math.round(val * 100) + '%', { size: 15, oy: 0.5, color: E.CS.dim });
    const hit = this.add.rectangle(tx - 10, y + 10, tw + 20, 40, 0xffffff, 0.001).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    const set = p => { const v = E.U.clamp((p.x - this.px - tx) / tw, 0, 1); E.Settings.set(key, Math.round(v * 20) / 20); fill.width = tw * E.Settings.d[key]; knob.x = tx + tw * E.Settings.d[key]; pct.setText(Math.round(E.Settings.d[key] * 100) + '%'); };
    let down = false; hit.on('pointerdown', p => { down = true; set(p); E.Sfx.init(); E.Music.start(); }); hit.on('pointermove', p => { if (down) set(p); }); hit.on('pointerup', () => { down = false; E.Sfx.play('click'); }); hit.on('pointerout', () => { down = false; });
    this.put(track, fill, knob, pct, hit);
  }
  toggle(x, y, key, label) {
    const on = E.Settings.d[key];
    this.put(E.UI.text(this, x, y + 6, label, { size: 18, bold: true }));
    this.put(E.UI.button(this, x + 400, y + 18, 120, 38, on ? 'ON' : 'OFF', () => { E.Settings.set(key, !E.Settings.d[key]); this.rerender(); }, { size: 17, skin: on ? 'g' : 'n' }));
  }
  render() {
    this.slider(40, 100, 640, 'music', 'Music Volume');
    this.slider(40, 160, 640, 'sfx', 'SFX Volume');
    this.toggle(40, 220, 'damageNumbers', 'Show Damage Numbers');
    this.toggle(40, 280, 'screenShake', 'Screen Shake');
    this.put(E.UI.text(this, 40, 346, 'Display', { size: 18, bold: true }));
    this.put(E.UI.button(this, 440, 358, 240, 38, this.scale.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen', () => { this.scale.toggleFullscreen(); this.time.delayedCall(300, () => this.rerender()); }, { size: 16 }));
    this.put(E.UI.text(this, 40, 410, 'Reference resolution 1280×720 · scales to any screen.\nProgress is saved manually only (Save slots).\nESC closes this window.', { size: 14, color: E.CS.dim, ls: 6 }));
  }
};
