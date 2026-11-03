/* Dungeons: 4 stages each (monsters -> mixed -> elite -> boss). Stages are repeatable. No stamina. */
E.DUNGEONS = [
  {
    id: 'forest', name: 'The Cursed Forest', region: 'Blackwood Forest', pal: 'forest', power: 1.0, recLv: 1,
    gearTier: 0, gold: [45, 80], xp: 70, unlock: null, mapPos: [0.30, 0.64],
    mats: { wood: [2, 5], bone: [1, 3], iron: [1, 3] },
    names: { wolf: 'Blighted Wolf', thorn: 'Thornling', skel: 'Bone Archer', knight: 'Cursed Knight', shaman: 'Hollow Shaman' },
    boss: { name: 'The Blighted Guardian', atk: ['Root Slam', 'Thorn Lance', 'Grasping Roots'] },
    desc: 'The first wound of the Abyss. Ancient guardians of Blackwood have rotted from within.',
    stages: [
      { name: 'Forest Outskirts', waves: [['wolf', 3], ['thorn', 1]] },
      { name: 'The Hollow Path', waves: [['wolf', 2], ['skel', 2], ['thorn', 2]] },
      { name: 'Elder Grove', waves: [['knight', 1], ['wolf', 3], ['skel', 2]] },
      { name: 'Heart of the Curse', boss: true, waves: [['wolf', 2], ['skel', 1]] }
    ]
  },
  {
    id: 'frost', name: 'Frostgate Pass', region: 'Northern Frontier', pal: 'frost', power: 2.7, recLv: 10,
    gearTier: 2, gold: [160, 260], xp: 260, unlock: 'forest', mapPos: [0.62, 0.17],
    mats: { crystal: [2, 5], iron: [3, 6], bone: [1, 3] },
    names: { wolf: 'Rime Wolf', thorn: 'Frozen Husk', skel: 'Frostbound Archer', knight: 'Winter Knight', shaman: 'Hoarfrost Shaman' },
    boss: { name: 'The Frostbound Warden', atk: ['Glacial Slam', 'Ice Lance', 'Shatterfield'] },
    desc: 'The northern gate has frozen shut, sealing a legion of the fallen behind ice.',
    stages: [
      { name: 'Frozen Road', waves: [['wolf', 4], ['skel', 2]] },
      { name: 'Broken Watchtower', waves: [['thorn', 3], ['skel', 3], ['wolf', 2]] },
      { name: 'Ice Barracks', waves: [['knight', 2], ['shaman', 1], ['wolf', 3]] },
      { name: 'The Warden\'s Gate', boss: true, waves: [['wolf', 2], ['shaman', 1]] }
    ]
  },
  {
    id: 'ash', name: 'Cinder Wastes', region: 'Ashen Mountains', pal: 'ash', power: 5.2, recLv: 18,
    gearTier: 3, gold: [380, 560], xp: 650, unlock: 'frost', mapPos: [0.80, 0.55],
    mats: { essence: [2, 5], iron: [4, 8], crystal: [1, 3] },
    names: { wolf: 'Cinder Hound', thorn: 'Magma Husk', skel: 'Ashen Archer', knight: 'Slag Knight', shaman: 'Emberpriest' },
    boss: { name: 'The Cinder Colossus', atk: ['Magma Slam', 'Lava Lance', 'Eruption'] },
    desc: 'The mountains burn with Abyssal fire. Something huge sleeps in the caldera.',
    stages: [
      { name: 'Smoldering Trail', waves: [['wolf', 4], ['skel', 3]] },
      { name: 'Slag Quarry', waves: [['thorn', 4], ['skel', 3], ['wolf', 2]] },
      { name: 'Forge of Cinders', waves: [['knight', 2], ['shaman', 2], ['wolf', 3]] },
      { name: 'The Caldera', boss: true, waves: [['wolf', 3], ['shaman', 1]] }
    ]
  },
  {
    id: 'abyss', name: 'The Rift of Ruin', region: 'The Abyss', pal: 'abyss', power: 8.5, recLv: 24,
    gearTier: 4, gold: [800, 1200], xp: 1300, unlock: 'ash', mapPos: [0.86, 0.84],
    mats: { essence: [4, 8], crystal: [3, 7], iron: [5, 9] },
    names: { wolf: 'Void Stalker', thorn: 'Rift Tendril', skel: 'Hollow Archer', knight: 'Abyss Knight', shaman: 'Void Cultist' },
    boss: { name: 'Vael, the Abyssal Sovereign', atk: ['Void Slam', 'Rift Lance', 'Collapse'] },
    desc: 'The wound in the world itself. Whatever crowns itself here must be destroyed.',
    stages: [
      { name: 'Edge of the Rift', waves: [['wolf', 5], ['skel', 3]] },
      { name: 'Crawling Dark', waves: [['thorn', 4], ['skel', 4], ['wolf', 3]] },
      { name: 'Cultist Sanctum', waves: [['knight', 3], ['shaman', 2], ['wolf', 3]] },
      { name: 'The Sovereign\'s Throne', boss: true, waves: [['wolf', 3], ['shaman', 2]] }
    ]
  },
  {
    id: 'capital', name: 'The Fallen Throne', region: 'Royal Capital', pal: 'capital', power: 11, recLv: 28,
    gearTier: 4, gold: [1400, 2000], xp: 2400, unlock: 'abyss', mapPos: [0.45, 0.36],
    mats: { essence: [6, 10], crystal: [5, 9], iron: [6, 10] },
    names: { wolf: 'Gilded Hound', thorn: 'Thronebound Husk', skel: 'Royal Revenant', knight: 'Hollow Guard', shaman: 'Chancellor Shade' },
    boss: { name: 'The Hollow King', atk: ['Crown Slam', 'Scepter Lance', 'Court of Ashes'] },
    desc: 'Your father\'s throne room. Reclaim the crown, and end the Abyss for good.',
    stages: [
      { name: 'Ruined Gates', waves: [['wolf', 5], ['skel', 4]] },
      { name: 'Gallery of Kings', waves: [['thorn', 4], ['skel', 4], ['knight', 1]] },
      { name: 'Court of Ashes', waves: [['knight', 3], ['shaman', 3], ['wolf', 3]] },
      { name: 'The Fallen Throne', boss: true, waves: [['knight', 2], ['shaman', 2]] }
    ]
  }
];

E.Dungeons = {
  get(id) { return E.DUNGEONS.find(d => d.id === id); },
  stageMult: [1, 1.2, 1.5, 2.4],
  isUnlocked(d, s) { return !d.unlock || !!(s.cleared[d.unlock] && s.cleared[d.unlock].boss); },
  stageUnlocked(d, idx, s) { const c = s.cleared[d.id]; return this.isUnlocked(d, s) && (idx === 0 || (c && c.stages >= idx)); },
  /* A Blood-Moon raid on the Bastion, built as a temporary dungeon/stage. */
  raid(day) {
    const p = Math.max(1, 0.8 + day * 0.18);
    return {
      id: 'raid', name: 'Defend the Bastion', region: 'The Last Bastion', pal: 'forest', power: p, recLv: 1, gearTier: 0,
      gold: [60 + day * 12, 100 + day * 20], xp: 60 + day * 8, unlock: null, mats: { iron: [2, 4], bone: [1, 3] },
      names: { wolf: 'Abyss Hound', thorn: 'Rift Husk', skel: 'Void Archer', knight: 'Abyss Marauder', shaman: 'Void Cultist' },
      boss: { name: '', atk: [] }, desc: '',
      stages: [{ name: 'Blood Moon Raid', waves: [['wolf', 3 + Math.min(4, Math.floor(day / 4))], ['skel', 2], ['thorn', 1], ...(day > 6 ? [['knight', 1]] : [])] }]
    };
  }
};
