/* Formation: pick the party (max 5) and drag heroes freely inside the deploy zone. No overlaps allowed. */
E.FormationScene = class extends Phaser.Scene {
  constructor() { super('Formation'); }
  init(data) { this.mode = data.mode || 'edit'; this.d = data.dungeon || null; this.stage = data.stage || 0; this.st = { page: 0 }; }
  create() {
    const s = E.G.s, Z = E.Form.zone, pal = this.d ? this.d.pal : 'forest';
    this.add.image(0, 0, 'arena_' + pal).setOrigin(0).setScale(2);
    this.add.rectangle(0, 0, E.W, E.H, 0x000000, 0.25).setOrigin(0);
    // deploy zone
    this.zone = this.add.rectangle(Z.x0 - 40, Z.y0 - 60, Z.x1 - Z.x0 + 80, Z.y1 - Z.y0 + 100, 0x8a4be8, 0.12).setOrigin(0).setStrokeStyle(3, E.C.purple, 0.9);
    this.tweens.add({ targets: this.zone, alpha: 0.6, yoyo: true, repeat: -1, duration: 1200 });
    E.UI.text(this, Z.x0 - 30, Z.y0 - 52, 'DEPLOY ZONE — drag heroes anywhere inside', { size: 14, color: E.CS.purple, bold: true, st: 3 });
    this.add.rectangle(Z.x1 + 130, 360, 3, 560, E.C.red, 0.35);
    E.UI.text(this, 700, 360, 'ENEMY\nSIDE', { size: 16, color: E.CS.red, ox: 0.5, oy: 0.5, align: 'center', bold: true, st: 3 }).setAlpha(0.6);
    // header
    const hdr = this.add.nineslice(0, 0, 'ui_panel2', undefined, E.W, 54, 12, 12, 12, 12).setOrigin(0).setDepth(100);
    E.UI.text(this, 24, 27, this.mode === 'battle' ? 'Formation — ' + this.d.stages[this.stage].name : 'Formation', { size: 22, bold: true, color: E.CS.goldLight, oy: 0.5, st: 3 }).setDepth(101);
    this.sprites = {}; this.labels = {};
    s.party.forEach(id => this.makeSprite(E.G.hero(id)));
    this.panel = this.add.container(0, 0).setDepth(100);
    this.input.on('dragstart', (p, o) => { if (!o.heroId) return; o.setScale(3.25); o.setDepth(500); E.Sfx.play('click'); });
    this.input.on('drag', (p, o, x, y) => {
      if (!o.heroId) return; const q = E.Form.clampPos({ x, y }); o.setPosition(q.x, q.y);
      o.setTint(E.Form.overlaps(q, this.othersOf(o.heroId)) ? 0xff7070 : 0xffffff);
    });
    this.input.on('dragend', (p, o) => {
      if (!o.heroId) return; o.clearTint(); o.setScale(3);
      const q = E.Form.freeSpot({ x: o.x, y: o.y }, this.othersOf(o.heroId));
      this.tweens.add({ targets: o, x: q.x, y: q.y, duration: 140, ease: 'Sine.Out' });
      s.formation.pos[o.heroId] = { x: Math.round(q.x), y: Math.round(q.y) };
      if (q.x !== o.x || q.y !== o.y) E.Sfx.play('error');
    });
    this.buildPanel();
    this.input.keyboard.on('keydown-ESC', () => this.back());
  }
  othersOf(id) { return Object.keys(this.sprites).filter(k => k !== id).map(k => ({ x: this.sprites[k].x, y: this.sprites[k].y })); }
  makeSprite(h) {
    const p = E.G.s.formation.pos[h.id] || { x: 260, y: 340 };
    const sp = this.add.sprite(p.x, p.y, 'hero_' + h.cls).setScale(3).setOrigin(0.5, 0.92); sp.heroId = h.id; sp.play('idle_' + h.cls);
    sp.setInteractive({ draggable: true, useHandCursor: true, pixelPerfect: false }); this.sprites[h.id] = sp;
    this.labels[h.id] = E.UI.text(this, p.x, p.y + 10, h.name, { size: 14, bold: true, ox: 0.5, st: 4, color: E.CS.goldLight });
    sp.shadow = this.add.ellipse(p.x, p.y, 48, 16, 0, 0.4);
  }
  update() {
    for (const id in this.sprites) { const sp = this.sprites[id]; sp.setDepth(sp.y); this.labels[id].setPosition(sp.x, sp.y + 8).setDepth(sp.y + 1); sp.shadow.setPosition(sp.x, sp.y - 2).setDepth(sp.y - 1); }
  }
  removeSprite(id) { const sp = this.sprites[id]; if (!sp) return; sp.shadow.destroy(); sp.destroy(); this.labels[id].destroy(); delete this.sprites[id]; delete this.labels[id]; }
  syncPositions() { const s = E.G.s; for (const id in this.sprites) { const p = s.formation.pos[id]; if (p) this.tweens.add({ targets: this.sprites[id], x: p.x, y: p.y, duration: 250, ease: 'Sine.InOut' }); } }
  toggle(h) {
    const s = E.G.s;
    if (s.party.includes(h.id)) {
      if (s.party.length <= 1) { E.UI.toast(this, 'The party needs at least one hero', E.CS.red); E.Sfx.play('error'); return; }
      s.party = s.party.filter(i => i !== h.id); this.removeSprite(h.id);
    } else {
      if (s.party.length >= E.MAX_PARTY) { E.UI.toast(this, 'Party is full (5 heroes)', E.CS.red); E.Sfx.play('error'); return; }
      s.party.push(h.id); s.formation.pos[h.id] = E.Form.freeSpot({ x: 270, y: 340 }, this.othersOf(h.id)); this.makeSprite(h);
      this.sprites[h.id].setAlpha(0); this.tweens.add({ targets: this.sprites[h.id], alpha: 1, duration: 200 });
    }
    E.Sfx.play('click'); this.buildPanel();
  }
  buildPanel() {
    const s = E.G.s, st = this.st, per = 5; this.panel.removeAll(true);
    const P = this.panel, add = o => { P.add(o); return o; };
    add(E.UI.panel(this, 810, 66, 456, 640, 'Party', { light: false, titleSize: 20 }));
    add(E.UI.text(this, 1240, 80, s.party.length + ' / ' + E.MAX_PARTY, { size: 18, bold: true, ox: 1, color: E.CS.goldLight }));
    s.heroes.slice(st.page * per, st.page * per + per).forEach((h, i) => {
      const y = 112 + i * 60, on = s.party.includes(h.id);
      const row = add(E.UI.frame(this, 826, y, 424, 54, on ? 'ui_row_s' : 'ui_row')); row.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.toggle(h));
      add(E.UI.portrait(this, 832, y + 1, h.cls, 44));
      add(E.UI.text(this, 890, y + 7, h.name, { size: 17, bold: true })); add(E.UI.text(this, 890, y + 30, 'Lv ' + h.level + ' ' + E.Hero.title(h) + ' · P' + E.Hero.power(h), { size: 12, color: E.CS.blue }));
      add(E.UI.text(this, 1236, y + 27, on ? '✔ IN PARTY' : 'bench', { size: 12, bold: true, ox: 1, oy: 0.5, color: on ? E.CS.green : E.CS.dim }));
    });
    add(E.UI.pager(this, 826, 430, st, s.heroes.length, per, () => this.buildPanel()));
    add(E.UI.button(this, 1160, 444, 180, 34, 'Auto Arrange', () => {
      const hs = s.party.map(id => E.G.hero(id)); E.Form.autoArrange(hs, s.formation.pos); this.syncPositions(); E.Sfx.play('confirm');
    }, { size: 14, icon: 'u_star', iconScale: 1.5 }));
    add(E.UI.text(this, 826, 486, 'Formation Presets', { size: 15, bold: true, color: E.CS.goldLight }));
    for (let i = 0; i < 3; i++) {
      const y = 516 + i * 40, pr = s.formation.presets[i];
      add(E.UI.text(this, 826, y, 'Preset ' + (i + 1) + (pr ? '  (' + pr.party.length + ' heroes)' : '  — empty'), { size: 14, color: pr ? E.CS.text : E.CS.dim, oy: 0.5 }));
      add(E.UI.button(this, 1090, y, 90, 32, 'Load', () => {
        if (E.Form.loadPreset(s, i)) { Object.keys(this.sprites).forEach(id => this.removeSprite(id)); s.party.forEach(id => this.makeSprite(E.G.hero(id))); this.buildPanel(); E.Sfx.play('confirm'); E.UI.toast(this, 'Preset ' + (i + 1) + ' loaded'); }
      }, { size: 14, disabled: !pr }));
      add(E.UI.button(this, 1190, y, 90, 32, 'Save', () => { E.Form.savePreset(s, i); E.Sfx.play('confirm'); E.UI.toast(this, 'Preset ' + (i + 1) + ' saved (in memory — use Save Game to keep it)'); this.buildPanel(); }, { size: 14, skin: 'g' }));
    }
    // enemy preview
    if (this.mode === 'battle') {
      const en = E.Run.buildEnemies(this.d, this.stage), cnt = {};
      en.forEach(e => { const k = e.boss ? 'boss' : e.kind; cnt[k] = cnt[k] || { e, n: 0 }; cnt[k].n++; });
      add(E.UI.text(this, 826, 636, 'Enemies:', { size: 14, bold: true, color: E.CS.red, oy: 0.5 }));
      Object.values(cnt).forEach((c, i) => { const sp = this.add.image(920 + i * 62, 650, `mon_${c.e.shape}_${c.e.pal}`, 'idle0').setScale(c.e.boss ? 0.8 : 1.5).setOrigin(0.5, 0.9); add(sp); add(E.UI.text(this, 920 + i * 62 + 14, 656, '×' + c.n, { size: 13, bold: true, st: 3 })); });
    }
    add(E.UI.button(this, 100, 680, 160, 42, 'Back', () => this.back(), { size: 18, icon: 'u_home' }).setDepth(101));
    if (this.mode === 'battle') add(E.UI.button(this, 1110, 680, 250, 44, 'Start Battle', () => this.start(), { size: 20, skin: 'g', icon: 'u_swords', sfx: 'confirm' }));
    else add(E.UI.button(this, 1110, 680, 250, 44, 'Done', () => this.back(), { size: 20, skin: 'g' }));
    if (this.mode === 'edit') add(E.UI.text(this, 640, 690, 'Positions are used when a battle starts.', { size: 13, color: E.CS.dim, ox: 0.5 }));
  }
  back() { E.Form.sanitize(E.G.s); this.scene.start('Town'); }
  start() { E.Form.sanitize(E.G.s); this.scene.start('Battle', { dungeon: this.d, stage: this.stage }); }
};
