/* Builds enemy line-ups and resolves rewards for a dungeon stage. */
E.Run = {
  scale(base, power, stageIdx) {
    const m = 1 + stageIdx * 0.08;
    return { hp: Math.round(base.hp * Math.pow(power, 0.98) * 2.6 * m * (base.shape === 'boss' ? 1.5 : 1)), atk: Math.round(base.atk * Math.pow(power, 1.0) * 2.6 * m), def: Math.round(base.def * Math.pow(power, 0.8)), spd: base.spd, range: base.range, cd: base.cd, crit: 0.05 };
  },
  buildEnemies(d, idx) {
    const st = d.stages[idx], out = [];
    for (const [k, n] of st.waves) {
      const b = E.ENEMIES[k];
      for (let i = 0; i < n; i++) out.push({ kind: k, name: d.names[k], shape: b.shape, pal: d.pal, scale: b.scale, elite: !!b.elite, ranged: b.ranged, proj: b.proj, healer: b.healer, radius: 20 * (b.scale / 3) + 6, stats: this.scale(b, d.power, idx) });
    }
    if (st.boss) {
      const b = E.BOSS_BASE;
      out.unshift({ kind: 'boss', boss: true, name: d.boss.name, bossAtk: d.boss.atk, shape: 'boss', pal: d.pal, scale: b.scale, elite: true, ranged: false, radius: b.radius, stats: this.scale(b, d.power, 0) });
    }
    return out;
  },
  /* Roll rewards for a victory; also applies them to state. Returns a summary. */
  victory(d, idx) {
    const s = E.G.s, mult = E.Dungeons.stageMult[idx] || 1, isBoss = !!d.stages[idx].boss;
    const out = { gold: 0, xp: 0, mats: {}, gear: [], levelUps: [], firstClear: false, bossFirst: false };
    out.gold = Math.round(E.U.rand(d.gold[0], d.gold[1]) * mult);
    out.xp = Math.round(d.xp * mult);
    for (const m in d.mats) { const n = Math.round(E.U.randInt(d.mats[m][0], d.mats[m][1]) * (0.7 + mult * 0.4)); if (n > 0) out.mats[m] = n; }
    E.Inv.addGold(out.gold); for (const m in out.mats) E.Inv.addMat(m, out.mats[m]);
    // gear drops: bosses always, elite stage 40%, others 10%
    const chance = isBoss ? 1 : idx === 2 ? 0.4 : 0.1;
    if (d.id !== 'raid' && Math.random() < chance && s.gear.length < E.Inv.capacity()) {
      const tier = Math.min(E.TIERS.length - 1, d.gearTier + (isBoss && Math.random() < 0.3 ? 1 : 0));
      out.gear.push(E.Inv.addGear(E.Items.random(tier)));
    }
    if (d.id !== 'raid') {
      const c = s.cleared[d.id] = s.cleared[d.id] || { stages: 0, boss: false, clears: 0 };
      if (idx + 1 > c.stages) { c.stages = idx + 1; out.firstClear = true; }
      c.clears++; if (isBoss && !c.boss) { c.boss = true; out.bossFirst = true; }
      s.stats.battlesWon++;
    } else s.stats.raids++;
    return out;
  }
};
