/* Battle scene: arena + HUD (hero cards, skills/ultimates, tactical commands, pause, speed). */
E.BattleScene = class extends Phaser.Scene {
  constructor() { super('Battle'); }
  init(data) { this.d = data.dungeon; this.stage = data.stage; }
  create() {
    this.paused = false; this.speed = 1; this.resultShown = false; this.cards = [];
    this.add.image(0, 0, 'arena_' + this.d.pal).setOrigin(0).setScale(2).setDepth(0);
    this.battle = new E.Battle(this, this.d, this.stage); const b = this.battle;
    // clicking enemies sets focus target
    this.input.on('gameobjectdown', (p, o) => { if (o.unit && o.unit.side === 'enemy' && o.unit.alive) this.setFocus(o.unit); });
    this.buildHud();
    this.banner = E.UI.text(this, 640, 150, '', { size: 34, bold: true, ox: 0.5, oy: 0.5, st: 7 }).setDepth(200000).setAlpha(0);
    this.pauseTxt = E.UI.text(this, 640, 360, 'TACTICAL PAUSE', { size: 44, bold: true, ox: 0.5, oy: 0.5, color: E.CS.goldLight, st: 8 }).setDepth(200000).setVisible(false);
    this.pauseSub = E.UI.text(this, 640, 405, 'Give orders or cast skills, then press Space to resume', { size: 18, ox: 0.5, oy: 0.5, color: E.CS.text, st: 5 }).setDepth(200000).setVisible(false);
    const kb = this.input.keyboard;
    kb.on('keydown-SPACE', () => this.togglePause());
    const cmds = { A: 'advance', H: 'hold', G: 'regroup', S: 'spread', R: 'retreat' };
    for (const k in cmds) kb.on('keydown-' + k, () => this.setCmd(cmds[k]));
    kb.on('keydown', ev => { const m = /^Digit([1-5])$/.exec(ev.code); if (m) { const c = this.cards[+m[1] - 1]; if (c) this.cast(c.u, ev.shiftKey ? 'ult' : 'skill'); } });
    this.showBanner(this.d.stages[this.stage].boss ? 'BOSS: ' + b.boss.name : this.d.stages[this.stage].name, this.d.stages[this.stage].boss ? 0xff6b5a : 0xf2d98a, 2.2);
    if (!E.Settings.d.tipsShown) { E.Settings.set('tipsShown', true); E.UI.toast(this, 'Click an enemy to focus · Space = tactical pause · 1–5 skills · Shift+1–5 ultimates', E.CS.goldLight); }
    this.events.once('shutdown', () => { if (this.battle) this.battle.destroy(); this.input.off('gameobjectdown'); });
  }
  showBanner(text, col, dur = 1.4) {
    this.banner.setText(text).setColor(E.U.hex(col)).setAlpha(1).setScale(1.25); this.tweens.killTweensOf(this.banner);
    this.tweens.add({ targets: this.banner, scale: 1, duration: 200 }); this.tweens.add({ targets: this.banner, alpha: 0, delay: dur * 1000, duration: 400 });
  }
  setFocus(u) { const b = this.battle; b.focus = (b.focus === u) ? null : u; E.Sfx.play('click'); if (b.focus) this.showBanner('Focus: ' + u.name, 0xff6b5a, 0.8); this.refreshCmds(); }
  setCmd(c) { this.battle.cmd = c; E.Sfx.play('click'); this.refreshCmds(); }
  togglePause() { if (this.battle.over) return; this.paused = !this.paused; this.pauseTxt.setVisible(this.paused); this.pauseSub.setVisible(this.paused); this.pauseBtn.setLabel(this.paused ? 'Resume' : 'Pause'); this.pauseBtn.setSelected(this.paused); E.Sfx.play('click'); }
  cast(u, kind) { if (!E.Skills.cast(u, kind, this.battle)) E.Sfx.play('error'); }
  buildHud() {
    const b = this.battle, D = 150000;
    this.add.nineslice(0, 0, 'ui_panel2', undefined, E.W, 54, 12, 12, 12, 12).setOrigin(0).setDepth(D);
    E.UI.button(this, 70, 27, 120, 38, 'Flee', () => this.flee(), { size: 15, icon: 'c_retreat', iconScale: 1.5 }).setDepth(D + 1);
    E.UI.text(this, 150, 27, this.d.name + ' · ' + this.d.stages[this.stage].name, { size: 18, bold: true, color: E.CS.goldLight, oy: 0.5, st: 3 }).setDepth(D + 1);
    this.pauseBtn = E.UI.button(this, 1000, 27, 140, 38, 'Pause', () => this.togglePause(), { size: 15, icon: 'u_pause', iconScale: 1.5 }).setDepth(D + 1);
    this.speedBtn = E.UI.button(this, 1116, 27, 82, 38, 'x1', () => { this.speed = this.speed === 1 ? 2 : 1; this.speedBtn.setLabel('x' + this.speed); this.speedBtn.setSelected(this.speed === 2); }, { size: 16 }).setDepth(D + 1);
    this.autoBtn = E.UI.button(this, 1216, 27, 100, 38, 'Auto: OFF', () => { b.autoSkills = !b.autoSkills; this.autoBtn.setLabel('Auto: ' + (b.autoSkills ? 'ON' : 'OFF')); this.autoBtn.setSelected(b.autoSkills); }, { size: 13 }).setDepth(D + 1);
    // boss bar
    if (b.boss) { this.bossBarBg = this.add.rectangle(640, 82, 560, 18, 0x05050c).setStrokeStyle(2, E.C.gold).setDepth(D); this.bossBar = this.add.rectangle(360, 82, 556, 14, 0xc0392b).setOrigin(0, 0.5).setDepth(D + 1); this.bossTxt = E.UI.text(this, 640, 82, b.boss.name, { size: 13, bold: true, ox: 0.5, oy: 0.5, st: 4 }).setDepth(D + 2); }
    // bottom bar
    this.add.nineslice(0, 600, 'ui_panel2', undefined, E.W, 120, 12, 12, 12, 12).setOrigin(0).setDepth(D);
    b.heroes.forEach((u, i) => {
      const x = 14 + i * 152, y = 608, c = { u };
      const g = this.add.container(x, y).setDepth(D + 1);
      g.add(this.add.nineslice(0, 0, 'ui_row', undefined, 146, 106, 6, 6, 6, 6).setOrigin(0));
      g.add(this.add.image(6, 6, 'port_' + u.hero.cls).setOrigin(0).setDisplaySize(40, 40));
      g.add(E.UI.text(this, 52, 6, u.name, { size: 14, bold: true }));
      g.add(E.UI.text(this, 52, 24, 'Lv ' + u.hero.level, { size: 11, color: E.CS.blue }));
      c.hpBg = this.add.rectangle(6, 54, 134, 9, 0x05050c).setOrigin(0).setStrokeStyle(1, E.C.goldDark); c.hp = this.add.rectangle(7, 55, 132, 7, 0x4caf50).setOrigin(0);
      c.hpTxt = E.UI.text(this, 73, 58.5, '', { size: 9, bold: true, ox: 0.5, oy: 0.5, st: 3 }); g.add([c.hpBg, c.hp, c.hpTxt]);
      const mk = (kind, bx, label, key) => {
        const w = 64, bt = this.add.container(bx, 68); bt.add(this.add.nineslice(0, 0, 'ui_btn_n', undefined, w, 32, 10, 10, 8, 8).setOrigin(0));
        bt.add(E.UI.text(this, 4, 4, key, { size: 9, color: E.CS.dim }));
        bt.add(E.UI.text(this, w / 2, 17, label, { size: 12, bold: true, ox: 0.5, oy: 0.5, color: E.CS.goldLight, st: 2 }));
        const ov = this.add.rectangle(0, 0, w, 32, 0x000000, 0.6).setOrigin(0); bt.add(ov);
        const glow = this.add.rectangle(0, 0, w, 32).setOrigin(0).setStrokeStyle(2, 0xffe070).setVisible(false); bt.add(glow);
        bt.setSize(w, 32); bt.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, 32), Phaser.Geom.Rectangle.Contains); bt.input.cursor = 'pointer';
        bt.on('pointerdown', () => this.cast(u, kind)); g.add(bt); return { bt, ov, glow, w };
      };
      c.sk = mk('skill', 6, 'Skill', String(i + 1)); c.ul = mk('ult', 76, 'Ultimate', '⇧' + (i + 1));
      this.cards.push(Object.assign(c, { g })); this.add.existing(g);
    });
    // commands
    const cmds = [['focus', 'Focus', 'c_focus'], ['hold', 'Hold', 'c_hold'], ['regroup', 'Regroup', 'c_regroup'], ['spread', 'Spread', 'c_spread'], ['advance', 'Advance', 'c_advance'], ['retreat', 'Retreat', 'c_retreat']];
    this.cmdBtns = {};
    this.add.text(0, 0, '').setVisible(false);
    E.UI.text(this, 800, 606, 'Tactical Commands', { size: 12, color: E.CS.dim }).setDepth(D + 1);
    cmds.forEach(([k, label, icon], i) => {
      const bt = E.UI.button(this, 880 + (i % 3) * 150, 640 + Math.floor(i / 3) * 52, 144, 46, label, () => k === 'focus' ? this.autoFocus() : this.setCmd(k), { size: 15, icon, iconScale: 2 }).setDepth(D + 1);
      this.cmdBtns[k] = bt;
    });
    this.refreshCmds();
  }
  autoFocus() {
    const b = this.battle; if (b.focus) { b.focus = null; this.refreshCmds(); E.Sfx.play('click'); return; }
    const foes = b.enemies.filter(e => e.alive).sort((a, c) => (c.isBoss - a.isBoss) || (c.elite - a.elite) || (c.atk - a.atk));
    if (foes[0]) this.setFocus(foes[0]);
  }
  refreshCmds() { for (const k in this.cmdBtns) this.cmdBtns[k].setSelected(k === 'focus' ? !!this.battle.focus : k === this.battle.cmd); }
  flee() {
    E.UI.modal(this, 'Flee the battle?', 'You will return to the Bastion with no rewards.', [{ label: 'Keep fighting' }, { label: 'Flee', skin: 'g', cb: () => this.toTown(60) }]).setDepth(300000);
  }
  toTown(mins) { E.Clock.advance(mins); this.scene.start('Town'); }
  update(t, dtms) {
    const b = this.battle, dt = Math.min(0.05, dtms / 1000);
    b.update(this.paused ? 0 : dt * this.speed);
    this.updateHud();
    if (b.over && !this.resultShown && b.afterOver > 1.1) this.showResult();
  }
  updateHud() {
    const b = this.battle;
    this.cards.forEach(c => {
      const u = c.u, pct = u.hp / u.maxHp, cls = E.CLASSES[u.hero.cls];
      c.hp.width = 132 * Math.max(0, pct); c.hp.fillColor = pct > 0.5 ? 0x4caf50 : pct > 0.25 ? 0xe0a030 : 0xc0392b; c.hpTxt.setText(Math.max(0, Math.ceil(u.hp)) + ' / ' + u.maxHp);
      c.g.setAlpha(u.alive ? 1 : 0.45);
      const skReady = u.alive && u.skillT <= 0; c.sk.ov.width = skReady ? 0 : c.sk.w * Math.min(1, Math.max(0, u.skillT) / cls.skill.cd); c.sk.glow.setVisible(skReady);
      const unl = E.Hero.ultUnlocked(u.hero), ulReady = u.alive && unl && u.ult >= 100;
      c.ul.ov.width = !unl ? c.ul.w : ulReady ? 0 : c.ul.w * (1 - u.ult / 100); c.ul.glow.setVisible(ulReady);
    });
    if (b.boss && this.bossBar) { this.bossBar.width = 556 * Math.max(0, b.boss.hp / b.boss.maxHp); this.bossBar.fillColor = b.boss.enraged ? 0xff3b2a : 0xc0392b; this.bossTxt.setText(b.boss.name + (b.boss.enraged ? '  — ENRAGED' : '')); }
  }
  showResult() {
    this.resultShown = true; const b = this.battle, win = b.over === 'win', s = E.G.s;
    let out = null, levelUps = [];
    if (win) {
      out = E.Run.victory(this.d, this.stage);
      b.heroes.forEach(u => { const gained = E.Hero.addXp(u.hero, u.alive ? out.xp : out.xp * 0.5); if (gained) levelUps.push(u.hero.name + ' → Lv ' + u.hero.level); });
      E.Sfx.play('victory');
    } else E.Sfx.play('defeat');
    const W = 760, H = 500, x0 = (E.W - W) / 2, y0 = 100, D = 250000;
    const c = this.add.container(0, 0).setDepth(D); c.add(this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.6).setInteractive());
    c.add(E.UI.panel(this, x0, y0, W, H, ''));
    const t = E.UI.text(this, 640, y0 + 50, win ? 'VICTORY' : 'DEFEAT', { size: 56, bold: true, ox: 0.5, oy: 0.5, color: win ? E.CS.goldLight : E.CS.red, st: 8 }); c.add(t);
    this.tweens.add({ targets: t, scale: { from: 1.5, to: 1 }, duration: 350, ease: 'Back.Out' });
    let y = y0 + 110;
    if (win) {
      const line = (icon, str, col) => { c.add(this.add.image(x0 + 60, y + 10, icon).setScale(2)); c.add(E.UI.text(this, x0 + 90, y, str, { size: 20, bold: true, color: col || E.CS.text, st: 2 })); y += 36; };
      line('u_coin', '+' + E.U.fmt(out.gold) + ' gold', E.CS.goldLight); line('u_star', '+' + E.U.fmt(out.xp) + ' XP to each hero (fallen heroes: half)', E.CS.purple);
      const mats = Object.keys(out.mats); if (mats.length) { mats.forEach((m, i) => { c.add(this.add.image(x0 + 60 + (i % 3) * 220, y + 10, E.MATS[m].icon).setScale(2)); c.add(E.UI.text(this, x0 + 86 + (i % 3) * 220, y, '+' + out.mats[m] + ' ' + E.MATS[m].name.split(' ')[0], { size: 17, st: 2 })); if (i % 3 === 2) y += 32; }); y += 40; }
      out.gear.forEach(g => { c.add(E.UI.slot(this, x0 + 56, y - 4, 44, E.Items.icon(g), E.Items.rarity(g).color)); c.add(E.UI.text(this, x0 + 110, y + 4, 'Dropped: ' + E.Items.name(g), { size: 19, bold: true, color: E.Items.rarity(g).css, st: 2 })); y += 52; });
      if (levelUps.length) { c.add(E.UI.text(this, x0 + 60, y, 'LEVEL UP!  ' + levelUps.join('   '), { size: 18, bold: true, color: E.CS.green, wrap: 640, st: 3 })); y += 62; E.Sfx.play('levelup'); }
      if (out.bossFirst) c.add(E.UI.text(this, 640, y + 4, '★ Boss defeated — new region unlocked! ★', { size: 20, bold: true, ox: 0.5, color: E.CS.goldLight, st: 3 }));
      else if (out.firstClear && this.stage < 3) c.add(E.UI.text(this, 640, y + 4, 'Next stage unlocked', { size: 17, ox: 0.5, color: E.CS.blue, st: 2 }));
    } else {
      c.add(E.UI.text(this, 640, y + 40, 'Your heroes have fallen.\nRegroup, change your formation or train, then try again.', { size: 20, ox: 0.5, align: 'center', color: E.CS.dim, ls: 8 }));
    }
    const by = y0 + H - 50;
    c.add(E.UI.button(this, 640 - 250, by, 230, 46, 'Return to Town', () => this.toTown(120), { size: 18 }));
    c.add(E.UI.button(this, 640, by, 230, 46, win ? 'Replay' : 'Retry', () => this.scene.start('Formation', { mode: 'battle', dungeon: this.d, stage: this.stage }), { size: 18, skin: 'g', sfx: 'confirm' }));
    const canNext = win && this.d.id !== 'raid' && this.stage < this.d.stages.length - 1;
    c.add(E.UI.button(this, 640 + 250, by, 230, 46, 'Next Stage', () => this.scene.start('Formation', { mode: 'battle', dungeon: this.d, stage: this.stage + 1 }), { size: 18, disabled: !canNext }));
    c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 300 });
  }
};
