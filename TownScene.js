/* The Last Bastion: top-down town hub. Buildings are real buttons that open the game systems. */
E.TownScene = class extends Phaser.Scene {
  constructor() { super('Town'); }
  create() {
    const s = E.G.s; if (!s) { this.scene.start('Menu'); return; }
    this.hudT = 0; E.Town.refreshRecruits();
    this.add.image(0, 0, 'town_ground').setOrigin(0).setScale(2);
    this.buildings = {}; this.badges = {}; this.glows = [];
    for (const k in E.TOWN_POS) {
      const p = E.TOWN_POS[k], img = this.add.image(p.x, p.y, 'b_' + (k === 'recruit' ? 'recruit' : k)).setOrigin(0.5, 1).setScale(2).setDepth(p.y);
      const w = img.width * 2, h = img.height * 2;
      img.setInteractive({ useHandCursor: true, pixelPerfect: true, alphaTolerance: 40 });
      img.on('pointerover', () => { img.setTint(0xffeebb); this.tweens.add({ targets: img, scale: 2.05, duration: 100 }); this.showTip(p.name + ' — ' + p.desc); E.Sfx.play('hover'); });
      img.on('pointerout', () => { img.clearTint(); this.tweens.add({ targets: img, scale: 2, duration: 100 }); this.showTip(''); });
      img.on('pointerdown', () => { E.Sfx.play('confirm'); this.tweens.add({ targets: img, scale: 1.97, yoyo: true, duration: 80, onComplete: () => this.openPanel(p.panel) }); });
      this.buildings[k] = img;
      // name plate
      const plate = E.UI.text(this, p.x, p.y + 10, p.name, { size: 15, color: E.CS.goldLight, bold: true, ox: 0.5, st: 4 }).setDepth(p.y + 1);
      this.add.rectangle(p.x, p.y + 20, plate.width + 18, 24, 0x07070f, 0.7).setDepth(p.y).setStrokeStyle(1, E.C.goldDark);
      // lit windows / forge glow at night
      const g = this.add.image(p.x + (k === 'smith' ? -20 : 0), p.y - h * 0.4, k === 'gate' ? 'glow_purple' : 'glow_orange').setScale(k === 'gate' ? 2.4 : 1.8).setBlendMode(Phaser.BlendModes.ADD).setDepth(p.y + 2).setAlpha(0);
      this.glows.push({ g, base: k === 'gate' ? 0.8 : 0.6 });
      // notification badge
      const b = E.UI.text(this, p.x + w * 0.38, p.y - h + 6, '!', { size: 30, color: '#ffe070', bold: true, st: 6, ox: 0.5 }).setDepth(p.y + 5).setVisible(false);
      this.tweens.add({ targets: b, y: b.y - 8, yoyo: true, repeat: -1, duration: 500 }); this.badges[k] = b;
    }
    // fireflies and wandering villagers
    for (let i = 0; i < 26; i++) {
      const f = this.add.image(Phaser.Math.Between(20, 1260), Phaser.Math.Between(100, 640), 'glow_white').setScale(0.12).setTint(0xc49bff).setBlendMode(Phaser.BlendModes.ADD).setDepth(900).setAlpha(0.3);
      this.tweens.add({ targets: f, x: f.x + Phaser.Math.Between(-80, 80), y: f.y + Phaser.Math.Between(-60, 60), alpha: { from: 0.1, to: 0.9 }, yoyo: true, repeat: -1, duration: Phaser.Math.Between(1800, 3600), delay: Phaser.Math.Between(0, 2000) });
    }
    this.villagers = [];
    ['archer', 'cleric', 'mage', 'guardian'].forEach((cls, i) => {
      const v = this.add.sprite(300 + i * 220, 440, 'hero_' + cls).setScale(1.8).setOrigin(0.5, 0.92).setTint(0x9a8a7a); v.cls = cls; v.play('walk_' + cls); this.villagers.push(v); this.wander(v);
    });
    this.night = this.add.rectangle(0, 0, E.W, E.H, 0x080a38, 0).setOrigin(0).setDepth(5000);
    this.buildHud();
    this.events.on('resume', () => { this.refresh(true); });
    this.events.once('shutdown', () => { this.events.off('resume'); });
    this.refresh(true);
    if (!E.G.s.hintsSeen.town) { E.G.s.hintsSeen.town = true; E.UI.toast(this, 'Click a building to begin. Recruit heroes, then visit the Expedition Gate.', E.CS.goldLight); }
  }
  wander(v) {
    const nx = Phaser.Math.Between(120, 1160), ny = Phaser.Math.Between(380, 640), d = Phaser.Math.Distance.Between(v.x, v.y, nx, ny);
    v.setFlipX(nx < v.x); v.setDepth(v.y);
    this.tweens.add({ targets: v, x: nx, y: ny, duration: d * 22, onUpdate: () => v.setDepth(v.y), onComplete: () => this.time.delayedCall(Phaser.Math.Between(500, 3000), () => v.scene && this.wander(v)) });
  }
  buildHud() {
    const top = this.add.container(0, 0).setDepth(6000);
    top.add(this.add.nineslice(0, 0, 'ui_panel2', undefined, E.W, 54, 12, 12, 12, 12).setOrigin(0));
    this.goldTxt = E.UI.text(this, 52, 27, '', { size: 20, color: E.CS.goldLight, bold: true, oy: 0.5, st: 3 });
    top.add([this.add.image(30, 27, 'u_coin').setScale(2), this.goldTxt]);
    this.matTxt = {}; let x = 230;
    for (const k in E.MATS) { top.add(this.add.image(x, 27, E.MATS[k].icon).setScale(2)); this.matTxt[k] = E.UI.text(this, x + 20, 27, '0', { size: 16, bold: true, oy: 0.5, st: 3 }); top.add(this.matTxt[k]); x += 92; }
    this.clockTxt = E.UI.text(this, 780, 27, '', { size: 20, color: E.CS.blue, bold: true, oy: 0.5, st: 3 }); top.add(this.clockTxt);
    const tb = (x, icon, tip, cb) => { const b = E.UI.button(this, x, 27, 44, 38, '', cb, { icon, iconScale: 2 }); b.on('pointerover', () => this.showTip(tip)); b.on('pointerout', () => this.showTip('')); top.add(b); return b; };
    tb(1130, 'u_gear', 'Settings', () => this.openPanel('Settings'));
    tb(1182, 'u_exit', 'Return to Title (unsaved progress is lost)', () => this.quitToTitle());
    tb(1234, 'u_quest', 'Quest log (Command Hall)', () => this.openPanel('Command'));
    // bottom nav
    const nav = this.add.container(0, 0).setDepth(6000);
    nav.add(this.add.nineslice(815, 690, 'ui_panel2', undefined, 790, 60, 12, 12, 12, 12));
    const items = [['u_helm', 'Heroes', () => this.openPanel('Barracks')], ['u_bag', 'Inventory', () => this.openPanel('Inventory')], ['u_party', 'Formation', () => this.goFormation()],
      ['u_hammer', 'Craft', () => this.openPanel('Blacksmith')], ['u_save', 'Save', () => this.openPanel('SavePanel', { mode: 'save' })], ['u_load', 'Load', () => this.openPanel('SavePanel', { mode: 'load' })]];
    items.forEach(([ic, lb, cb], i) => nav.add(E.UI.button(this, 500 + i * 126, 690, 118, 44, lb, cb, { icon: ic, size: 14, iconScale: 2 })));
    this.tip = E.UI.text(this, E.W / 2, 646, '', { size: 16, color: E.CS.goldLight, ox: 0.5, oy: 0.5, bold: true, st: 4 }).setDepth(6001);
    // quest tracker
    this.qBox = this.add.container(16, 640).setDepth(6000);
    this.qBox.add(this.add.nineslice(0, 0, 'ui_panel2', undefined, 330, 64, 12, 12, 12, 12).setOrigin(0));
    this.qTitle = E.UI.text(this, 14, 8, '', { size: 15, color: E.CS.goldLight, bold: true }); this.qDesc = E.UI.text(this, 14, 32, '', { size: 13, color: E.CS.dim, wrap: 300 });
    this.qBox.add([this.qTitle, this.qDesc]);
    this.qBox.setSize(330, 64).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.openPanel('Command'));
  }
  showTip(s) { this.tip.setText(s); }
  refresh(force) {
    const s = E.G.s; this.goldTxt.setText(E.U.fmt(s.gold));
    for (const k in this.matTxt) this.matTxt[k].setText(E.U.fmt(s.mats[k] || 0));
    this.clockTxt.setText(E.Clock.label());
    const q = E.Town.currentQuest();
    if (q) { const rdy = E.Town.questState(q) === 'ready'; this.qTitle.setText((rdy ? '★ ' : '◆ ') + q.title); this.qTitle.setColor(rdy ? E.CS.green : E.CS.goldLight); this.qDesc.setText(rdy ? 'Complete! Claim in the Command Hall.' : q.prog(s) + '  ' + q.desc.slice(0, 48) + '…'); }
    else { this.qTitle.setText('◆ All quests complete'); this.qDesc.setText('Eldoria is yours.'); }
    this.badges.command.setVisible(s.fortress.taxPending > 0 || E.Town.readyQuests() > 0);
    this.badges.recruit.setVisible(s.recruits.list.length > 0 && s.heroes.length < E.Town.maxRoster());
    this.badges.training.setVisible(E.Town.trainingReady());
    this.badges.gate.setVisible(false); this.badges.barracks.setVisible(s.party.length < Math.min(E.MAX_PARTY, s.heroes.length)); this.badges.smith.setVisible(false);
    const dk = E.Clock.darkness(); this.night.setFillStyle(0x080a38, dk * 0.55);
    this.glows.forEach(o => o.g.setAlpha(Math.min(1, dk * 1.4) * o.base * (0.9 + Math.random() * 0.1)));
    this.villagers.forEach(v => v.setAlpha(dk > 0.8 ? 0.6 : 1));
  }
  update(t, dtms) {
    E.Clock.advance(dtms / 1000 * E.Clock.RATE);
    this.hudT += dtms; if (this.hudT > 250) { this.hudT = 0; this.refresh(); }
    const ev = E.Town.pollEvent();
    if (ev) { E.Sfx.play(ev.special ? 'warn' : 'confirm'); this.openPanel('Event', { event: ev }); }
  }
  openPanel(key, data) { this.showTip(''); this.scene.pause(); this.scene.launch(key, Object.assign({ parent: 'Town' }, data)); }
  goFormation() { this.scene.start('Formation', { mode: 'edit' }); }
  quitToTitle() {
    E.UI.modal(this, 'Return to Title?', 'Unsaved progress will be lost. There is no autosave — use Save first.', [
      { label: 'Stay' }, { label: 'Quit to Title', skin: 'g', cb: () => this.scene.start('Menu') }]).setDepth(9000);
  }
};
