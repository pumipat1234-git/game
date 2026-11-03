/* Random town events. Each choice's do(s) returns {text, battle?}. */
E.EVENTS = [
  { id: 'merchant', title: 'Wandering Merchant', weight: 3,
    text: 'A cloaked trader rolls a creaking cart up to the gate. "Fine ore for a fine price, Your Highness."',
    choices: [
      { label: 'Buy iron bundle (120g)', cond: s => s.gold >= 120, do: s => { E.Inv.spendGold(120); E.Inv.addMat('iron', 12); return { text: 'You acquire 12 Iron Ore.' }; } },
      { label: 'Buy bone & wood (90g)', cond: s => s.gold >= 90, do: s => { E.Inv.spendGold(90); E.Inv.addMat('bone', 6); E.Inv.addMat('wood', 6); return { text: 'You acquire 6 Bone Shards and 6 Blackwood Planks.' }; } },
      { label: 'Send him away', do: () => ({ text: 'The merchant tips his hood and trundles on.' }) }
    ] },
  { id: 'refugees', title: 'Refugees at the Gate', weight: 3,
    text: 'A column of hollow-eyed survivors begs shelter behind the Bastion walls.',
    choices: [
      { label: 'Take them in (-60g)', cond: s => s.gold >= 60, do: s => { E.Inv.spendGold(60); const g = E.U.randInt(120, 260); E.Inv.addGold(g); E.Inv.addMat('wood', 4); return { text: 'They repay your kindness with labour: +' + g + ' gold and 4 planks.' }; } },
      { label: 'Turn them away', do: () => ({ text: 'The gates stay shut. The column drifts into the dark.' }) }
    ] },
  { id: 'smith', title: 'The Smith\'s Discovery', weight: 2,
    text: 'The old smith found a seam of ore beneath the forge floor, and asks for a few hands to dig it out.',
    choices: [
      { label: 'Dig it out', do: s => { const n = E.U.randInt(6, 12); E.Inv.addMat('iron', n); return { text: 'The team hauls up ' + n + ' Iron Ore.' }; } }
    ] },
  { id: 'bard', title: 'Traveling Bard', weight: 2,
    text: 'A bard sings of the old kings and the dawn to come. Morale in the barracks lifts.',
    choices: [
      { label: 'Tip her (-40g)', cond: s => s.gold >= 40, do: s => { E.Inv.spendGold(40); s.heroes.forEach(h => E.Hero.addXp(h, 25 + h.level * 4, true)); return { text: 'Inspired, every hero gains experience.' }; } },
      { label: 'Listen quietly', do: () => ({ text: 'A pleasant evening. Nothing more.' }) }
    ] },
  { id: 'relic', title: 'A Cursed Relic', weight: 2,
    text: 'Scouts drag in a pulsing, purple-veined relic found near the treeline. It hums at you.',
    choices: [
      { label: 'Study it (risky)', do: s => { if (Math.random() < 0.5) { const g = E.U.randInt(250, 500); E.Inv.addGold(g); E.Inv.addMat('essence', 3); return { text: 'It shatters into coin and 3 Ember Essence. +' + g + 'g.' }; } const l = Math.min(s.gold, 100); E.Inv.spendGold(l); return { text: 'It lashes out and scorches the vault. -' + l + ' gold.' }; } },
      { label: 'Bury it', do: () => ({ text: 'You have it sealed beneath the flagstones.' }) }
    ] },
  { id: 'raid', title: 'Blood Moon Raid!', weight: 0, special: true,
    text: 'The moon turns red. Creatures of the Abyss pour toward the walls!',
    choices: [
      { label: 'Defend the walls!', do: () => ({ text: 'To arms!', battle: true }) },
      { label: 'Pay them off (-250g)', cond: s => s.gold >= 250, do: s => { E.Inv.spendGold(250); return { text: 'The tribute is taken. The horde withdraws... for now.' }; } },
      { label: 'Hide and wait', do: s => { const l = Math.min(s.gold, 150); E.Inv.spendGold(l); return { text: 'The raiders loot the storehouse. -' + l + ' gold.' }; } }
    ] }
];
