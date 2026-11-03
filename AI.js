/* Auto-battle brains. Heroes obey the player's tactical command; enemies chase the closest (or taunting) hero. */
E.AI = {
  /* Is the unit standing in a telegraphed danger zone? Returns the zone or null. */
  danger(u, b) {
    for (const t of b.tele) {
      if (t.dur - t.t < 0.25) continue;
      if (t.shape === 'circle') { if (Math.hypot(u.x - t.x, u.y - t.y) < t.r + u.radius * 0.4) return t; }
      else { const rx = u.x - t.x, ry = u.y - t.y, along = rx * t.nx + ry * t.ny, perp = Math.abs(rx * t.ny - ry * t.nx); if (along > -20 && along < t.len && perp < t.w / 2 + u.radius * 0.5) return t; }
    }
    return null;
  },
  escape(u, z) { // direction out of the zone
    if (z.shape === 'circle') { const dx = u.x - z.x, dy = u.y - z.y, d = Math.hypot(dx, dy) || 1; return { x: z.x + dx / d * (z.r + 60), y: z.y + dy / d * (z.r + 60) }; }
    const rx = u.x - z.x, ry = u.y - z.y, side = (rx * z.ny - ry * z.nx) >= 0 ? 1 : -1;
    return { x: u.x + z.ny * side * (z.w / 2 + 70), y: u.y - z.nx * side * (z.w / 2 + 70) };
  },
  pickHeroTarget(u, b) {
    const foes = b.foesOf(u); if (!foes.length) return null;
    if (b.focus && b.focus.alive && !u.healOnly) return b.focus;
    return b.nearest(u, foes);
  },
  hero(u, b, dt) {
    u.moving = false;
    if (u.stunT > 0) return;
    // auto-cast regular skills when enabled
    if (b.autoSkills && u.skillT <= 0 && u.castT <= 0) E.Skills.cast(u, 'skill', b);
    const cmd = b.cmd, anch = u.anchor;
    // dodge telegraphs unless told to hold
    if (cmd !== 'hold') { const z = this.danger(u, b); if (z) { const e = this.escape(u, z); u.moveToward(e.x, e.y, dt, 1.25); return; } }
    // cleric: heal wounded allies first
    let target = null, healing = false;
    if (u.kind === 'cleric') {
      const hurt = b.alliesOf(u).filter(a => a.hp / a.maxHp < 0.7).sort((a, c) => a.hp / a.maxHp - c.hp / c.maxHp)[0];
      if (hurt) { target = hurt; healing = true; }
    }
    if (!target) target = this.pickHeroTarget(u, b);
    u.target = target;
    const inRange = target && u.edge(target) <= u.range;
    const act = () => { if (target && inRange && u.atkT <= 0 && u.castT <= 0 && u.stunT <= 0) { u.face(target); b.attack(u, target, healing); } };
    if (cmd === 'retreat') {
      u.moveToward(70 + (u.anchor.y % 5) * 6, u.anchor.y, dt, 1.35);
      return;
    }
    if (cmd === 'regroup') {
      const arrived = Math.hypot(anch.x - u.x, anch.y - u.y) < 10;
      if (!arrived) { u.moveToward(anch.x, anch.y, dt, 1.2); return; }
      act(); return;
    }
    if (cmd === 'hold') { act(); return; }
    if (cmd === 'spread') {
      // keep distance from allies and from the pack; fight from where we stand
      let px = 0, py = 0;
      b.alliesOf(u).forEach(a => { if (a === u) return; const d = u.dist(a); if (d < 190 && d > 0) { px += (u.x - a.x) / d * (190 - d); py += (u.y - a.y) / d * (190 - d); } });
      const m = Math.hypot(px, py);
      if (m > 12) { u.moveToward(u.x + px / m * 40, u.y + py / m * 40, dt, 1); return; }
      act(); if (target && !inRange && !(m > 12)) u.moveToward(target.x, target.y, dt, 0.8); return;
    }
    // advance (default): close to range and fight
    if (target && !inRange) {
      const stand = u.range * 0.88 + target.radius * 0.7;
      const dx = u.x - target.x, dy = u.y - target.y, d = Math.hypot(dx, dy) || 1;
      u.moveToward(target.x + dx / d * stand, target.y + dy / d * stand, dt);
    }
    act();
  },
  enemy(u, b, dt) {
    u.moving = false;
    if (u.stunT > 0) return;
    const foes = b.foesOf(u); if (!foes.length) return;
    // shaman heals wounded allies
    if (u.healer && u.healT <= 0) {
      const w = b.alliesOf(u).filter(a => a.hp / a.maxHp < 0.65).sort((a, c) => a.hp - c.hp)[0];
      if (w && u.edge(w) <= u.range * 1.1) { u.healT = 5; u.atkAnim = 0.3; u.atkAnimMax = 0.3; b.heal(w, u.atk * 3, u); return; }
    }
    if (u.isBoss) { this.boss(u, b, dt); if (u.casting) return; }
    let t = (u.tauntT > 0 && u.tauntSrc && u.tauntSrc.alive) ? u.tauntSrc : null;
    if (!t) { t = b.nearest(u, foes); }
    u.target = t; if (!t) return;
    const inRange = u.edge(t) <= u.range;
    if (!inRange) { const stand = u.range * 0.9 + t.radius * 0.5, dx = u.x - t.x, dy = u.y - t.y, d = Math.hypot(dx, dy) || 1; u.moveToward(t.x + dx / d * stand, t.y + dy / d * stand, dt); }
    else if (u.atkT <= 0 && u.castT <= 0) { u.face(t); b.attack(u, t, false); }
  },
  /* Boss: telegraphed attacks. Enrages below 50% HP. */
  boss(u, b, dt) {
    const enraged = u.hp < u.maxHp * 0.5; u.enraged = enraged;
    if (u.casting) {
      u.casting.t += dt; u.moving = false;
      if (u.casting.t >= u.casting.dur) { u.casting = null; u.atkAnim = 0.4; u.atkAnimMax = 0.4; b.shake(160, 0.008); }
      return;
    }
    u.bossT -= dt;
    if (u.bossT > 0) return;
    const heroes = b.heroes.filter(h => h.alive); if (!heroes.length) return;
    const kind = u.bossIdx++ % 3, dur = enraged ? 1.15 : 1.6, names = u.bossAtk || ['Slam', 'Lance', 'Roots'];
    const tgt = E.U.pick(heroes);
    b.banner(names[kind] + '!', 0xff6b5a, 0.9); E.Sfx.play('warn');
    if (kind === 0) b.addTele({ shape: 'circle', x: u.x, y: u.y, r: 175, dur, mult: 1.7, src: u, follow: true });
    else if (kind === 1) { const dx = tgt.x - u.x, dy = tgt.y - u.y, L = Math.hypot(dx, dy) || 1; b.addTele({ shape: 'line', x: u.x, y: u.y, nx: dx / L, ny: dy / L, len: 820, w: 90, dur, mult: 1.5, src: u }); }
    else { const picks = heroes.slice().sort(() => Math.random() - 0.5).slice(0, 3); picks.forEach(h => b.addTele({ shape: 'circle', x: h.x, y: h.y, r: 105, dur: dur + 0.3, mult: 1.4, src: u })); }
    u.casting = { t: 0, dur: dur * 0.9 }; u.face(tgt);
    u.bossT = (enraged ? E.U.rand(3, 4.2) : E.U.rand(4.6, 6.4)) + dur;
  }
};
