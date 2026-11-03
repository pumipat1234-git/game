/* Equipment is generated from (type x tier). An owned item is {uid, key:'sword_0', lvl:0}. */
E.TIERS = [
  { name: 'Iron',        rarity: 0, mult: 1.0, mats: { iron: 6, wood: 3 },                gold: 60 },
  { name: 'Steel',       rarity: 1, mult: 1.8, mats: { iron: 10, bone: 8 },               gold: 240 },
  { name: 'Frostsilver', rarity: 2, mult: 3.0, mats: { crystal: 10, iron: 10 },           gold: 700 },
  { name: 'Emberforged', rarity: 3, mult: 4.6, mats: { essence: 10, crystal: 6, iron: 12 }, gold: 1800 },
  { name: 'Abyssal',     rarity: 4, mult: 6.8, mats: { essence: 14, crystal: 12 },        gold: 4500 }
];

E.EQUIP = {
  sword:  { name: 'Sword',  slot: 'weapon',    cls: 'warrior',  icon: 'i_sword',  base: { atk: 16 } },
  shield: { name: 'Aegis',  slot: 'weapon',    cls: 'guardian', icon: 'i_shield', base: { def: 12, atk: 6, hp: 30 } },
  staff:  { name: 'Staff',  slot: 'weapon',    cls: 'mage',     icon: 'i_staff',  base: { atk: 20 } },
  bow:    { name: 'Bow',    slot: 'weapon',    cls: 'archer',   icon: 'i_bow',    base: { atk: 17 } },
  mace:   { name: 'Mace',   slot: 'weapon',    cls: 'cleric',   icon: 'i_mace',   base: { atk: 14, hp: 30 } },
  armor:  { name: 'Armor',  slot: 'armor',     cls: null,       icon: 'i_armor',  base: { def: 10, hp: 60 } },
  ring:   { name: 'Ring',   slot: 'accessory', cls: null,       icon: 'i_ring',   base: { atk: 8 } },
  amulet: { name: 'Amulet', slot: 'accessory', cls: null,       icon: 'i_amulet', base: { hp: 90 } },
  charm:  { name: 'Charm',  slot: 'accessory', cls: null,       icon: 'i_charm',  base: { def: 7 } }
};
E.SLOTS = ['weapon', 'armor', 'accessory'];
E.SLOT_NAMES = { weapon: 'Weapon', armor: 'Armor', accessory: 'Accessory' };
E.MAX_UPGRADE = 5;

E.Items = {
  key: (type, tier) => type + '_' + tier,
  parse(key) { const [type, tier] = key.split('_'); return { type, tier: +tier, def: E.EQUIP[type], t: E.TIERS[+tier] }; },
  name(g) { const p = this.parse(g.key); return p.t.name + ' ' + p.def.name + (g.lvl ? ' +' + g.lvl : ''); },
  icon(g) { return this.parse(g.key).def.icon; },
  rarity(g) { return E.RARITY[this.parse(g.key).t.rarity]; },
  slot(g) { return this.parse(g.key).def.slot; },
  stats(g) { // {atk,def,hp}
    const p = this.parse(g.key), out = { atk: 0, def: 0, hp: 0 };
    const m = p.t.mult * (1 + 0.12 * (g.lvl || 0));
    for (const k in p.def.base) out[k] = Math.round(p.def.base[k] * m);
    return out;
  },
  statLine(st) {
    const parts = [];
    if (st.atk) parts.push('ATK +' + st.atk); if (st.def) parts.push('DEF +' + st.def); if (st.hp) parts.push('HP +' + st.hp);
    return parts.join('  ');
  },
  sellPrice(g) { const p = this.parse(g.key); return Math.round((p.t.gold * 0.35 + 10) * (1 + 0.4 * (g.lvl || 0)) * (p.def.slot === 'accessory' ? 0.8 : 1)); },
  recipe(key) {
    const p = this.parse(key), f = p.def.slot === 'armor' ? 1.25 : p.def.slot === 'accessory' ? 0.7 : 1;
    const mats = {}; for (const m in p.t.mats) mats[m] = Math.max(1, Math.round(p.t.mats[m] * f));
    return { gold: Math.round(p.t.gold * f), mats };
  },
  upgradeCost(g) {
    const p = this.parse(g.key), n = (g.lvl || 0) + 1;
    return { gold: Math.round(80 * n * (p.tier + 1) * (1 + p.tier * 0.4)), mats: { iron: 3 * n + p.tier * 3 } };
  },
  allKeys() { const k = []; for (let t = 0; t < E.TIERS.length; t++) for (const ty in E.EQUIP) k.push(this.key(ty, t)); return k; },
  random(tier, slotFilter) {
    const types = Object.keys(E.EQUIP).filter(t => !slotFilter || E.EQUIP[t].slot === slotFilter);
    return this.key(E.U.pick(types), tier);
  }
};
