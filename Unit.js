/* A combatant (hero or enemy): stats, timers and sprite. Decisions live in AI.js; effects in Battle.js. */
E.Unit = class {
  constructor(b, o) {
    this.b = b; this.side = o.side; this.hero = o.hero || null; this.name = o.name; this.kind = o.kind || (o.hero && o.hero.cls);
    const s = o.stats; this.maxHp = s.hp; this.hp = s.hp; this.atk = s.atk; this.def = s.def; this.spd = s.spd; this.range = s.range; this.cd = s.cd; this.crit = s.crit || 0.05;
    this.x = o.x; this.y = o.y; this.anchor = { x: o.x, y: o.y }; this.radius = o.radius || 20; this.isBoss = !!o.boss;
    this.ranged = o.ranged !== undefined ? o.ranged : this.range > 120; this.proj = o.proj || (this.hero ? (this.kind === 'archer' ? 'arrow' : this.kind === 'mage' ? 'orb' : this.kind === 'cleric' ? 'heal' : null) : null);
    this.healer = !!o.healer || this.kind === 'cleric'; this.elite = !!o.elite; this.bossAtk = o.bossAtk;
    this.alive = true; this.atkT = Math.random() * 0.5; this.skillT = 0; this.ult = 0; this.autoCast = false;
    this.stunT = 0; this.tauntT = 0; this.tauntSrc = null; this.drT = 0; this.drAmt = 0; this.shield = 0; this.shieldT = 0;
    this.hurtT = 0; this.atkAnim = 0; this.atkAnimMax = 0.32; this.pending = null; this.animT = Math.random(); this.moving = false; this.castT = 0; this.moveLock = 0;
    this.facing = this.side === 'hero' ? 1 : -1; this.target = null; this.healT = 3; this.bossT = 3.5; this.bossIdx = 0; this.corpseT = 0; this.casting = null;
    this.sc = o.scale; this.tex = o.tex;
    const sc = this.scene = b.scene;
    this.shadow = sc.add.ellipse(this.x, this.y, this.radius * 2.4, this.radius * 0.9, 0x000000, 0.4);
    this.sprite = sc.add.sprite(this.x, this.y, o.tex, 'idle0').setScale(o.scale).setOrigin(0.5, 0.92);
    this.spriteH = (o.boss ? 64 : 32) * o.scale * 0.9;
    this.sprite.setInteractive({ useHandCursor: this.side === 'enemy' });
    this.sprite.unit = this;
  }
  get dead() { return !this.alive; }
  dist(o) { return Math.hypot(o.x - this.x, o.y - this.y); }
  edge(o) { return this.dist(o) - o.radius * 0.7; }
  moveToward(x, y, dt, mult = 1) {
    if (this.moveLock > 0 || this.stunT > 0 || this.castT > 0) return false;
    const dx = x - this.x, dy = y - this.y, d = Math.hypot(dx, dy);
    if (d < 3) return false;
    const st = Math.min(d, this.spd * mult * dt * (this.slowT > 0 ? 0.5 : 1));
    this.x += dx / d * st; this.y += dy / d * st; this.moving = true;
    if (Math.abs(dx) > 4) this.facing = dx > 0 ? 1 : -1;
    return true;
  }
  face(o) { if (Math.abs(o.x - this.x) > 4) this.facing = o.x > this.x ? 1 : -1; }
  /* Frame selection driven by simulation time so a tactical pause freezes animation. */
  render() {
    const s = this.sprite; s.setPosition(Math.round(this.x), Math.round(this.y)); s.setDepth(this.y);
    this.shadow.setPosition(Math.round(this.x), Math.round(this.y - 2)).setDepth(this.y - 1);
    s.setFlipX(this.facing < 0);
    let f;
    if (!this.alive) f = 'dead';
    else if (this.hurtT > 0 && this.atkAnim <= 0) f = 'hurt';
    else if (this.casting || this.atkAnim > 0) {
      const p = this.casting ? 0 : 1 - this.atkAnim / this.atkAnimMax; f = 'atk' + (p < 0.34 ? 0 : p < 0.7 ? 1 : 2);
    } else if (this.moving) f = 'walk' + (Math.floor(this.animT * 9) % 4);
    else f = 'idle' + (Math.floor(this.animT * 2.2) % 2);
    if (s.frame.name !== f) s.setFrame(f);
    if (this.hurtT > 0) s.setTint(0xff9090); else if (this.stunT > 0) s.setTint(0x9aa0ff); else if (this.shieldT > 0) s.setTint(0xbfe8ff); else if (this.tauntT > 0 && this.side === 'enemy') s.setTint(0xffd0a0); else s.clearTint();
    if (!this.alive) { s.setAlpha(Math.max(0, 1 - this.corpseT / 3.5)); this.shadow.setAlpha(0.25 * s.alpha); }
  }
  destroy() { this.sprite.destroy(); this.shadow.destroy(); }
};
