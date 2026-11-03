/* Town simulation: daily taxes, recruits, training, random & timed events, quests. */
E.Town = {
  taxPerDay() { const s = E.G.s; return 40 + s.fortress.level * 35 + s.heroes.length * 6; },
  maxRoster() { return 6 + E.G.s.fortress.level * 2; },
  trainSlots() { return Math.min(3, 1 + Math.floor(E.G.s.fortress.level / 2)); },
  onNewDay(day) {
    const s = E.G.s;
    s.fortress.taxPending = Math.min(this.taxPerDay() * 7, s.fortress.taxPending + this.taxPerDay());
    this.refreshRecruits();
    E.bus && E.bus.emit('newday', day);
  },
  collectTax() { const s = E.G.s, n = s.fortress.taxPending; s.fortress.taxPending = 0; E.Inv.addGold(n); return n; },
  /* Candidates change every day. The first batch is guaranteed to include the missing classes. */
  refreshRecruits(first) {
    const s = E.G.s, day = E.G.day();
    if (!first && s.recruits.day === day) return;
    const avg = s.heroes.length ? Math.round(s.heroes.reduce((a, h) => a + h.level, 0) / s.heroes.length) : 1;
    const list = [];
    const owned = new Set(s.heroes.map(h => h.cls));
    const missing = E.CLASS_ORDER.filter(c => !owned.has(c));
    const pickCls = i => (first ? ['mage', 'archer', 'cleric'][i] : (missing[i] || E.U.pick(E.CLASS_ORDER)));
    for (let i = 0; i < 3; i++) {
      const cls = pickCls(i), level = first ? 1 : Math.max(1, avg + E.U.randInt(-2, 1));
      list.push({ id: E.U.uid(), cls, name: E.U.pick(E.NAMES[cls]), level, cost: Math.round(100 + level * level * 6 + level * 25) });
    }
    s.recruits = { day, list };
  },
  recruit(c) {
    const s = E.G.s;
    if (s.heroes.length >= this.maxRoster()) return { ok: false, why: 'Barracks full — upgrade the Bastion' };
    if (s.gold < c.cost) return { ok: false, why: 'Not enough gold' };
    E.Inv.spendGold(c.cost);
    const h = E.Hero.create(c.cls, c.name, c.level); s.heroes.push(h);
    s.recruits.list = s.recruits.list.filter(x => x.id !== c.id);
    if (s.party.length < E.MAX_PARTY) { s.party.push(h.id); }
    E.Form.sanitize(s);
    return { ok: true, hero: h };
  },
  /* Training Ground */
  trainRate(h) { return 10 + h.level * 4; }, // xp per game hour
  trainCost(h) { return 25 * h.level; },
  startTraining(h) {
    const s = E.G.s;
    if (s.training.length >= this.trainSlots()) return { ok: false, why: 'All training slots busy' };
    if (s.training.some(t => t.heroId === h.id)) return { ok: false, why: 'Already training' };
    if (h.level >= E.MAX_LEVEL) return { ok: false, why: 'Max level' };
    if (!E.Inv.spendGold(this.trainCost(h))) return { ok: false, why: 'Not enough gold' };
    s.training.push({ heroId: h.id, start: s.time }); return { ok: true };
  },
  trainingXp(t) { const h = E.G.hero(t.heroId); const hrs = Math.min(24, (E.G.s.time - t.start) / 60); return h ? Math.floor(hrs * this.trainRate(h)) : 0; },
  collectTraining(t) {
    const s = E.G.s, h = E.G.hero(t.heroId), xp = this.trainingXp(t);
    s.training = s.training.filter(x => x !== t);
    const lv = h ? E.Hero.addXp(h, xp) : 0; return { hero: h, xp, levels: lv };
  },
  trainingReady() { return E.G.s.training.some(t => this.trainingXp(t) >= 40); },
  /* Fortress upgrade (Command Hall) */
  upgradeCost() { const l = E.G.s.fortress.level; return { gold: 500 * l * l, mats: { iron: 10 * l, wood: 8 * l } }; },
  upgradeFortress() {
    const s = E.G.s, c = this.upgradeCost();
    if (s.fortress.level >= 5) return { ok: false, why: 'Bastion fully restored' };
    if (s.gold < c.gold) return { ok: false, why: 'Not enough gold' };
    if (!E.Inv.hasMats(c.mats)) return { ok: false, why: 'Missing materials' };
    E.Inv.spendGold(c.gold); E.Inv.spendMats(c.mats); s.fortress.level++; return { ok: true };
  },
  /* Events: called each town tick. Returns an event def when one should fire. */
  pollEvent() {
    const s = E.G.s, day = E.G.day(), h = E.Clock.hour();
    // timed: Blood Moon every 5th night at 21:00
    if (day % 5 === 0 && h >= 21 && s.events.lastRaidDay !== day) {
      s.events.lastRaidDay = day; return E.EVENTS.find(e => e.id === 'raid');
    }
    if (s.time >= s.events.next) {
      s.events.next = s.time + E.U.randInt(18, 36) * 60;
      const pool = E.EVENTS.filter(e => !e.special), tot = pool.reduce((a, e) => a + e.weight, 0);
      let r = Math.random() * tot; for (const e of pool) { r -= e.weight; if (r <= 0) return e; }
      return pool[0];
    }
    return null;
  },
  /* Quests */
  questState(q) { const s = E.G.s; return s.claimed.includes(q.id) ? 'claimed' : q.check(s) ? 'ready' : 'active'; },
  claimQuest(q) {
    const s = E.G.s; if (this.questState(q) !== 'ready') return false;
    s.claimed.push(q.id);
    if (q.reward.gold) E.Inv.addGold(q.reward.gold);
    for (const m in (q.reward.mats || {})) E.Inv.addMat(m, q.reward.mats[m]);
    return true;
  },
  currentQuest() { return E.QUESTS.find(q => this.questState(q) !== 'claimed'); },
  readyQuests() { return E.QUESTS.filter(q => this.questState(q) === 'ready').length; }
};
