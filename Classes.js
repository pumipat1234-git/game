/* The five hero classes. Growth values are fractions of the base stat gained per level. */
E.CLASSES = {
  guardian: {
    name: 'Guardian', role: 'Tank', tex: 'hero_guardian', melee: true, color: 0x4aa3a0,
    base: { hp: 700, atk: 28, def: 38, spd: 72, range: 52, cd: 1.4, crit: 0.03 },
    grow: { hp: 0.10, atk: 0.06, def: 0.06 },
    titles: ['Guardian', 'Bulwark Knight', 'Citadel Lord'],
    skill: { id: 'roar', names: ['Bulwark Roar', 'Iron Roar', 'Citadel Roar'], cd: 12, desc: 'Taunts nearby enemies and cuts damage taken by 45% for 5s.' },
    ult: { id: 'aegis', names: ['Bastion Aegis', 'Bastion Aegis', 'Aegis Eternal'], unlock: 5, desc: 'Shields the whole party for 8s (absorbs 28% of each ally\'s max HP).' },
    blurb: 'Stands at the front and holds the line.'
  },
  warrior: {
    name: 'Warrior', role: 'Melee DPS', tex: 'hero_warrior', melee: true, color: 0xc0392b,
    base: { hp: 520, atk: 44, def: 24, spd: 92, range: 54, cd: 1.0, crit: 0.1 },
    grow: { hp: 0.09, atk: 0.07, def: 0.05 },
    titles: ['Warrior', 'Blademaster', 'Dread Champion'],
    skill: { id: 'cleave', names: ['Crescent Cleave', 'Crescent Cleave', 'Eclipse Cleave'], cd: 8, desc: 'A sweeping arc hitting every nearby enemy for 170% ATK.' },
    ult: { id: 'tempest', names: ['Blade Tempest', 'Blade Tempest', 'Tempest of Ruin'], unlock: 5, desc: 'Whirls through enemies: 6 strikes of 95% ATK in a wide area.' },
    blurb: 'A swift blade that cuts through packs.'
  },
  mage: {
    name: 'Mage', role: 'Ranged Magic', tex: 'hero_mage', melee: false, color: 0x8a4be8,
    base: { hp: 380, atk: 58, def: 12, spd: 70, range: 235, cd: 1.5, crit: 0.08 },
    grow: { hp: 0.08, atk: 0.08, def: 0.04 },
    titles: ['Mage', 'Arcanist', 'Void Sage'],
    skill: { id: 'voidbolt', names: ['Void Bolt', 'Void Burst', 'Void Cataclysm'], cd: 8, desc: 'Hurls a void orb that explodes for 210% ATK in an area.' },
    ult: { id: 'abyssrain', names: ['Abyssal Rain', 'Abyssal Rain', 'Rain of Ruin'], unlock: 5, desc: 'Calls 8 meteors onto the battlefield (140% ATK each, area).' },
    blurb: 'Devastating area spells from afar.'
  },
  archer: {
    name: 'Archer', role: 'Ranged DPS', tex: 'hero_archer', melee: false, color: 0x4caf50,
    base: { hp: 420, atk: 41, def: 16, spd: 86, range: 275, cd: 0.95, crit: 0.18 },
    grow: { hp: 0.08, atk: 0.07, def: 0.04 },
    titles: ['Archer', 'Ranger', 'Shadow Hunter'],
    skill: { id: 'pierce', names: ['Piercing Shot', 'Piercing Shot', 'Gale Piercer'], cd: 7, desc: 'A shot that pierces every enemy in a line for 185% ATK.' },
    ult: { id: 'arrowstorm', names: ['Arrow Storm', 'Arrow Storm', 'Storm of a Thousand'], unlock: 5, desc: 'A volley that hits every enemy on the field for 160% ATK.' },
    blurb: 'Fast, accurate and deadly at range.'
  },
  cleric: {
    name: 'Cleric', role: 'Healer', tex: 'hero_cleric', melee: false, color: 0xe8d38a,
    base: { hp: 450, atk: 32, def: 18, spd: 74, range: 215, cd: 1.5, crit: 0.04 },
    grow: { hp: 0.09, atk: 0.07, def: 0.05 },
    titles: ['Cleric', 'Priest', 'Saint of Dawn'],
    skill: { id: 'mend', names: ['Mending Light', 'Radiant Mend', 'Dawnbringer Mend'], cd: 7, desc: 'Heals the most wounded ally for 260% ATK (and nearby allies for half).' },
    ult: { id: 'sanctuary', names: ['Sanctuary', 'Sanctuary', 'Last Dawn'], unlock: 5, desc: 'Heals the whole party for 45% max HP and raises one fallen hero.' },
    blurb: 'Keeps the party alive in long fights.'
  }
};
E.CLASS_ORDER = ['guardian', 'warrior', 'mage', 'archer', 'cleric'];

E.TIER_MULT = [1, 1.3, 1.7];
E.PROMO = [
  null,
  { level: 10, gold: 600,  mats: { bone: 12, iron: 10 } },     // Tier 1 -> 2
  { level: 20, gold: 2500, mats: { essence: 15, crystal: 10 } } // Tier 2 -> 3
];

E.NAMES = {
  guardian: ['Brenna', 'Dorian', 'Hild', 'Torvald', 'Maren', 'Osric'],
  warrior: ['Aldric', 'Selene', 'Roderick', 'Kaelin', 'Ysolde', 'Garrick'],
  mage: ['Lyra', 'Evander', 'Mirelle', 'Zephyr', 'Isolde', 'Corvin'],
  archer: ['Fenwick', 'Rowan', 'Thalia', 'Wren', 'Lucan', 'Sable'],
  cleric: ['Elowen', 'Cassian', 'Ambrose', 'Seraphine', 'Odette', 'Bram']
};
