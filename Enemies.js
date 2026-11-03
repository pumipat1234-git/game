/* Base enemy archetypes at power 1. Dungeons scale them and re-skin with a palette. */
E.ENEMIES = {
  wolf:   { shape: 'wolf',   hp: 120, atk: 18, def: 4,  spd: 135, range: 42,  cd: 0.9, scale: 2.7, ranged: false },
  thorn:  { shape: 'thorn',  hp: 190, atk: 15, def: 8,  spd: 66,  range: 48,  cd: 1.3, scale: 2.9, ranged: false },
  skel:   { shape: 'skel',   hp: 100, atk: 23, def: 3,  spd: 76,  range: 250, cd: 1.5, scale: 3.0, ranged: true, proj: 'arrow' },
  knight: { shape: 'knight', hp: 560, atk: 34, def: 24, spd: 66,  range: 52,  cd: 1.4, scale: 3.4, ranged: false, elite: true },
  shaman: { shape: 'shaman', hp: 400, atk: 30, def: 10, spd: 62,  range: 230, cd: 1.8, scale: 3.1, ranged: true, proj: 'orb', healer: true, elite: true }
};

/* Boss template; every dungeon names / scales its own. Attacks are telegraphed. */
E.BOSS_BASE = { shape: 'boss', hp: 3400, atk: 42, def: 26, spd: 46, range: 92, cd: 1.9, scale: 3.4, radius: 70 };
