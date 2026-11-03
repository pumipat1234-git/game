/* Single source of truth for progress. E.G.s is the live state object; it only reaches disk via manual save. */
E.G = {
  s: null,
  fresh() {
    return {
      version: 1, time: 8 * 60, gold: 700,
      mats: { iron: 8, wood: 8, bone: 0, crystal: 0, essence: 0 },
      gear: [], heroes: [], party: [],
      formation: { pos: {}, presets: [null, null, null] },
      fortress: { level: 1, taxPending: 0 },
      training: [], recruits: { day: 0, list: [] },
      cleared: {}, claimed: [],
      stats: { crafted: 0, promoted: 0, battlesWon: 0, raids: 0, upgrades: 0 },
      events: { next: 14 * 60 + 8 * 60, lastRaidDay: 0, seen: 0 },
      hintsSeen: {}
    };
  },
  newGame() {
    this.s = this.fresh(); const s = this.s;
    const prince = E.Hero.create('warrior', 'Kael', 1); prince.prince = true;
    const guard = E.Hero.create('guardian', 'Brenna', 1);
    s.heroes.push(prince, guard); s.party = [prince.id, guard.id];
    E.Inv.addGear('sword_0'); E.Inv.addGear('shield_0');
    E.Inv.equip(prince, s.gear[0].uid); E.Inv.equip(guard, s.gear[1].uid);
    E.Form.autoArrange(s.party.map(id => this.hero(id)), s.formation.pos);
    E.Town.refreshRecruits(true);
    s.events.next = s.time + 6 * 60; // first visitor arrives in-game ~6h in
    return s;
  },
  load(obj) {
    const base = this.fresh(); this.s = Object.assign(base, obj);
    this.s.stats = Object.assign(base.stats, obj.stats || {});
    this.s.events = Object.assign(base.events, obj.events || {});
    this.s.fortress = Object.assign(base.fortress, obj.fortress || {});
    return this.s;
  },
  serialize() { return JSON.parse(JSON.stringify(this.s)); },
  hero(id) { return this.s.heroes.find(h => h.id === id); },
  day() { return Math.floor(this.s.time / 1440) + 1; }
};
