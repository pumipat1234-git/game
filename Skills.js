/* Active skills and ultimates. cast(unit, kind, battle) -> true if it fired. */
E.Skills = {
  cast(u, kind, b) {
    if (!u.alive || u.stunT > 0 || !u.hero) return false;
    const cls = E.CLASSES[u.hero.cls], def = kind === 'ult' ? cls.ult : cls.skill, p = E.Hero.skillPower(u.hero);
    if (kind === 'ult') { if (!E.Hero.ultUnlocked(u.hero) || u.ult < 100) return false; }
    else if (u.skillT > 0) return false;
    const fn = this['do_' + def.id]; if (!fn) return false;
    const foes = b.foesOf(u); if (!foes.length && def.id !== 'aegis' && def.id !== 'sanctuary' && def.id !== 'mend') return false;
    if (kind === 'ult') { u.ult = 0; E.Sfx.play('ult'); b.banner(E.Hero.skillName(u.hero, 'ult') + '!', cls.color); b.shake(180, 0.006); }
    else { u.skillT = cls.skill.cd; E.Sfx.play(def.id === 'mend' ? 'heal' : 'magic'); }
    u.castT = 0.5; u.atkAnim = 0.35; u.atkAnimMax = 0.35;
    fn.call(this, u, b, p);
    return true;
  },
  target(u, b) { const f = b.focus && b.focus.alive ? b.focus : null; return f || b.nearest(u, b.foesOf(u)); },
  inRadius(b, list, x, y, r) { return list.filter(e => Math.hypot(e.x - x, e.y - y) <= r + e.radius * 0.6); },

  do_roar(u, b, p) {
    b.ring(u.x, u.y, 320, 0x4fc1bb, 0.6);
    b.foesOf(u).forEach(e => { if (Math.hypot(e.x - u.x, e.y - u.y) < 340) { e.tauntSrc = u; e.tauntT = 5; if (!e.isBoss) b.burst(e.x, e.y - 30, 0x4fc1bb, 5, 60, 0.4); } });
    u.drT = 5; u.drAmt = 0.45; b.burst(u.x, u.y - 40, 0x4fc1bb, 14, 120, 0.6);
  },
  do_aegis(u, b, p) {
    b.alliesOf(u).forEach(a => { a.shield = a.maxHp * 0.28 * p; a.shieldT = 8; b.ring(a.x, a.y, 60, 0x8cd0ff, 0.5); b.burst(a.x, a.y - 40, 0x8cd0ff, 8, 90, 0.6); });
  },
  do_cleave(u, b, p) {
    b.ring(u.x, u.y, 125, 0xff6b5a, 0.3); b.burst(u.x, u.y - 30, 0xffb0a0, 12, 160, 0.35);
    this.inRadius(b, b.foesOf(u), u.x, u.y, 125).forEach(e => b.dealDamage(u, e, 1.7 * p));
  },
  do_tempest(u, b, p) {
    for (let i = 0; i < 6; i++) b.after(0.12 + i * 0.3, () => {
      if (!u.alive) return; b.ring(u.x, u.y, 175, 0xff9a8a, 0.3); b.burst(u.x, u.y - 30, 0xffffff, 8, 200, 0.3); E.Sfx.play('hit');
      this.inRadius(b, b.foesOf(u), u.x, u.y, 175).forEach(e => b.dealDamage(u, e, 0.95 * p, { noUlt: true }));
    });
    u.moveLock = 1.9;
  },
  do_voidbolt(u, b, p) {
    const t = this.target(u, b); if (!t) return;
    b.projectile({ x: u.x, y: u.y - 50, target: t, speed: 520, kind: 'void', col: 0xc49bff, src: u, onHit: () => {
      b.ring(t.x, t.y, 105, 0xc49bff, 0.4); b.burst(t.x, t.y - 20, 0xe0c8ff, 16, 180, 0.5); b.shake(80, 0.003);
      this.inRadius(b, b.foesOf(u), t.x, t.y, 105).forEach(e => b.dealDamage(u, e, 2.1 * p));
    } });
  },
  do_abyssrain(u, b, p) {
    for (let i = 0; i < 8; i++) b.after(0.2 + i * 0.35, () => {
      const foes = b.foesOf(u); if (!foes.length) return;
      const t = E.U.pick(foes), x = t.x + E.U.rand(-60, 60), y = t.y + E.U.rand(-30, 30);
      b.meteor(x, y, 0.45, () => {
        b.ring(x, y, 100, 0xc49bff, 0.4); b.burst(x, y - 10, 0xffffff, 10, 200, 0.5); b.shake(60, 0.003);
        this.inRadius(b, b.foesOf(u), x, y, 100).forEach(e => b.dealDamage(u, e, 1.4 * p, { noUlt: true }));
      });
    });
  },
  do_pierce(u, b, p) {
    const t = this.target(u, b); if (!t) return;
    const dx = t.x - u.x, dy = t.y - u.y, L = Math.hypot(dx, dy) || 1, nx = dx / L, ny = dy / L, len = 760;
    b.beam(u.x, u.y - 40, u.x + nx * len, u.y - 40 + ny * len, 0xbfff9a, 0.35, 6);
    b.foesOf(u).forEach(e => {
      const rx = e.x - u.x, ry = e.y - u.y, along = rx * nx + ry * ny, perp = Math.abs(rx * ny - ry * nx);
      if (along > 0 && along < len && perp < 34 + e.radius * 0.7) b.dealDamage(u, e, 1.85 * p);
    });
  },
  do_arrowstorm(u, b, p) {
    b.foesOf(u).forEach((e, i) => b.after(0.1 + i * 0.09, () => {
      if (!e.alive) return; b.beam(e.x - 40, e.y - 360, e.x, e.y - 20, 0xbfff9a, 0.25, 4); E.Sfx.play('shoot');
      b.after(0.12, () => { b.burst(e.x, e.y - 20, 0xbfff9a, 6, 120, 0.3); b.dealDamage(u, e, 1.6 * p, { noUlt: true }); });
    }));
  },
  do_mend(u, b, p) {
    const allies = b.alliesOf(u).filter(a => a.hp < a.maxHp);
    const t = (allies.length ? allies : b.alliesOf(u)).sort((a, c) => a.hp / a.maxHp - c.hp / c.maxHp)[0]; if (!t) return;
    b.heal(t, u.atk * 2.6 * p, u);
    b.alliesOf(u).forEach(a => { if (a !== t && Math.hypot(a.x - t.x, a.y - t.y) < 150) b.heal(a, u.atk * 1.3 * p, u); });
    b.ring(t.x, t.y, 150, 0xf2d98a, 0.5);
  },
  do_sanctuary(u, b, p) {
    b.alliesOf(u).forEach(a => { b.heal(a, a.maxHp * 0.45, u); a.stunT = 0; b.ring(a.x, a.y, 70, 0xfff2b0, 0.7); });
    const dead = b.heroes.filter(h => !h.alive);
    if (dead.length) b.revive(E.U.pick(dead), 0.4);
    b.ring(u.x, u.y, 400, 0xfff2b0, 0.8);
  }
};
