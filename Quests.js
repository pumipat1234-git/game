/* Main story quests. Checked against live state; reward is claimed in the Command Hall. */
E.QUESTS = [
  { id: 'q1', title: 'Rally the Guard', desc: 'Recruit heroes until you command 3 fighters. Visit the Recruitment Hall.',
    check: s => s.heroes.length >= 3, prog: s => Math.min(3, s.heroes.length) + ' / 3', reward: { gold: 250 } },
  { id: 'q2', title: 'A Full Banner', desc: 'Field a party of 5 heroes.',
    check: s => s.party.length >= 5, prog: s => s.party.length + ' / 5', reward: { gold: 300, mats: { iron: 6 } } },
  { id: 'q3', title: 'Forge the First Blade', desc: 'Craft any piece of equipment at the Blacksmith.',
    check: s => s.stats.crafted >= 1, prog: s => Math.min(1, s.stats.crafted) + ' / 1', reward: { gold: 200, mats: { wood: 6 } } },
  { id: 'q4', title: 'Into the Cursed Forest', desc: 'Win a battle in an expedition (Expedition Gate).',
    check: s => s.stats.battlesWon >= 1, prog: s => Math.min(1, s.stats.battlesWon) + ' / 1', reward: { gold: 300 } },
  { id: 'q5', title: 'Slay the Blighted Guardian', desc: 'Defeat the boss of The Cursed Forest.',
    check: s => !!(s.cleared.forest && s.cleared.forest.boss), prog: s => (s.cleared.forest && s.cleared.forest.boss) ? '1 / 1' : '0 / 1', reward: { gold: 800, mats: { bone: 10 } } },
  { id: 'q6', title: 'Rise Through the Ranks', desc: 'Promote a hero to a higher tier at the Barracks.',
    check: s => s.stats.promoted >= 1, prog: s => Math.min(1, s.stats.promoted) + ' / 1', reward: { gold: 700, mats: { crystal: 6 } } },
  { id: 'q7', title: 'Break the Northern Seal', desc: 'Defeat the Frostbound Warden in the Northern Frontier.',
    check: s => !!(s.cleared.frost && s.cleared.frost.boss), prog: s => (s.cleared.frost && s.cleared.frost.boss) ? '1 / 1' : '0 / 1', reward: { gold: 2000, mats: { crystal: 10 } } },
  { id: 'q8', title: 'Quench the Caldera', desc: 'Defeat the Cinder Colossus in the Ashen Mountains.',
    check: s => !!(s.cleared.ash && s.cleared.ash.boss), prog: s => (s.cleared.ash && s.cleared.ash.boss) ? '1 / 1' : '0 / 1', reward: { gold: 4000, mats: { essence: 12 } } },
  { id: 'q9', title: 'Close the Rift', desc: 'Destroy Vael, the Abyssal Sovereign.',
    check: s => !!(s.cleared.abyss && s.cleared.abyss.boss), prog: s => (s.cleared.abyss && s.cleared.abyss.boss) ? '1 / 1' : '0 / 1', reward: { gold: 8000, mats: { essence: 20, crystal: 15 } } },
  { id: 'q10', title: 'Reclaim the Crown', desc: 'Defeat the Hollow King and retake the Royal Capital.',
    check: s => !!(s.cleared.capital && s.cleared.capital.boss), prog: s => (s.cleared.capital && s.cleared.capital.boss) ? '1 / 1' : '0 / 1', reward: { gold: 20000 } }
];
