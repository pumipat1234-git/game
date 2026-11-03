/* Title screen: Continue / New Game / Load / Settings / Credits. */
E.MenuScene = class extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    const W = E.W, H = E.H;
    this.add.image(0, 0, 'arena_abyss').setOrigin(0).setScale(2).setTint(0x7a6aa8);
    // moon + glow
    this.add.image(930, 170, 'glow_white').setScale(5).setTint(0x8a7ae0).setAlpha(0.5);
    const moon = this.add.graphics(); moon.fillStyle(0xe8e4ff, 1); moon.fillCircle(930, 170, 62); moon.fillStyle(0xc4bce8, 1); moon.fillCircle(910, 190, 14); moon.fillCircle(950, 150, 9); moon.fillCircle(940, 200, 7);
    // castle silhouette
    const cs = this.add.graphics(); cs.fillStyle(0x0b0a1c, 1);
    const blocks = [[640, 380, 90, 200], [720, 300, 60, 280], [770, 340, 70, 240], [840, 260, 50, 320], [890, 330, 100, 250], [1000, 290, 60, 290], [1060, 350, 90, 230], [1150, 320, 70, 260], [560, 420, 90, 160], [1210, 380, 100, 200]];
    blocks.forEach(([x, y, w, h]) => { cs.fillRect(x, y, w, h); cs.fillTriangle(x - 4, y, x + w / 2, y - w * 0.9, x + w + 4, y); for (let i = 0; i < w; i += 14) cs.fillRect(x + i, y - 6, 8, 6); });
    cs.fillStyle(0xf2b84a, 0.9); blocks.forEach(([x, y, w, h], i) => { for (let k = 0; k < 3; k++) if ((i + k) % 2) cs.fillRect(x + w / 2 - 4, y + 30 + k * 50, 6, 10); });
    this.add.rectangle(0, 560, W, 200, 0x07070f, 0.92).setOrigin(0).setDepth(2);
    // hero
    const hero = this.add.sprite(300, 640, 'hero_warrior').setScale(8).setOrigin(0.5, 0.92).setDepth(3); hero.play('idle_warrior'); this.tweens.add({ targets: hero, x: 310, yoyo: true, repeat: -1, duration: 3000, ease: 'Sine.InOut' });
    // embers
    for (let i = 0; i < 40; i++) {
      const e = this.add.image(Phaser.Math.Between(0, W), Phaser.Math.Between(250, H), 'glow_purple').setScale(Phaser.Math.FloatBetween(0.12, 0.35)).setAlpha(Phaser.Math.FloatBetween(0.3, 0.9)).setBlendMode(Phaser.BlendModes.ADD).setDepth(4);
      this.tweens.add({ targets: e, y: e.y - Phaser.Math.Between(120, 300), x: e.x + Phaser.Math.Between(-60, 60), alpha: 0, duration: Phaser.Math.Between(3000, 7000), repeat: -1, delay: Phaser.Math.Between(0, 3000) });
    }
    // title
    const t1 = E.UI.text(this, 340, 84, 'ELDORIA', { size: 96, color: E.CS.goldLight, bold: true, st: 8, ox: 0.5 }).setDepth(6);
    E.UI.text(this, 340, 190, 'T H E   L A S T   B A S T I O N', { size: 22, color: E.CS.purple, bold: true, st: 4, ox: 0.5 }).setDepth(6);
    this.add.rectangle(340, 176, 440, 3, E.C.gold).setDepth(6);
    this.tweens.add({ targets: t1, scale: 1.02, yoyo: true, repeat: -1, duration: 2200, ease: 'Sine.InOut' });
    // buttons
    this.menuBtns = [];
    const mk = (i, label, cb, o) => { const b = E.UI.button(this, 1010, 320 + i * 68, 300, 54, label, cb, Object.assign({ size: 22 }, o)).setDepth(10); this.menuBtns.push(b); return b; };
    this.cont = mk(0, 'Continue', () => this.doContinue(), { skin: 'g', disabled: true, sfx: 'confirm' });
    mk(1, 'New Game', () => this.newGame(), { sfx: 'confirm' });
    mk(2, 'Load Game', () => this.openPanel('SavePanel', { mode: 'load' }));
    mk(3, 'Settings', () => this.openPanel('Settings'));
    mk(4, 'Credits', () => this.openPanel('Credits'));
    E.UI.text(this, W - 12, H - 10, 'v' + E.VERSION + ' · Placeholder art generated in code', { size: 12, color: E.CS.dim, ox: 1, oy: 1 }).setDepth(10);
    this.hint = E.UI.text(this, 340, 690, 'Click anywhere to enable audio', { size: 14, color: E.CS.dim, ox: 0.5 }).setDepth(10);
    this.input.once('pointerdown', () => { E.Sfx.init(); E.Music.start(); this.hint.setVisible(false); });
    this.events.on('resume', () => this.refreshContinue());
    this.refreshContinue();
  }
  refreshContinue() { E.Save.latest().then(i => { this.latest = i; if (this.cont && this.cont.scene) this.cont.setEnabled(i >= 0); }); }
  openPanel(key, data) { E.Sfx.init(); this.scene.pause(); this.scene.launch(key, Object.assign({ parent: 'Menu' }, data)); }
  doContinue() { E.Save.load(this.latest).then(ok => { if (ok) this.scene.start('Town'); }); }
  newGame() { E.Sfx.init(); E.Music.start(); E.G.newGame(); this.scene.start('Intro'); }
};
