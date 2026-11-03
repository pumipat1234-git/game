/* Core constants. Everything lives under the global namespace E. */
window.E = window.E || {};

E.W = 1280;               // reference resolution (landscape-first)
E.H = 720;
E.FONT = 'Cinzel, "Trajan Pro", Georgia, "Times New Roman", serif';
E.VERSION = '0.1.0';
E.SAVE_SLOTS = 6;
E.MAX_PARTY = 5;
E.MAX_LEVEL = 30;

/* Art-direction palette: dark blue / black / antique gold / purple magic */
E.C = {
  ink: 0x07070f, navy0: 0x0b0d1e, navy1: 0x141a38, navy2: 0x1f2850, navy3: 0x2c3870,
  gold: 0xd4a84a, goldLight: 0xf2d98a, goldDark: 0x8a6a2a,
  purple: 0x8a4be8, purpleLight: 0xc49bff, purpleDark: 0x3b1d73,
  red: 0xc0392b, redLight: 0xff6b5a, green: 0x4caf50, greenLight: 0x8be07a,
  blue: 0x3b82f6, blueLight: 0x8cc4ff, white: 0xf4efe0, grey: 0x7a7f94
};
E.CS = { // css strings
  text: '#e8dcc0', gold: '#d4a84a', goldLight: '#f2d98a', dim: '#8d8aa0', red: '#ff6b5a',
  green: '#8be07a', blue: '#8cc4ff', purple: '#c49bff', white: '#ffffff'
};

E.RARITY = [
  { name: 'Common',    color: 0xcfd2dc, css: '#cfd2dc' },
  { name: 'Uncommon',  color: 0x6ee06a, css: '#6ee06a' },
  { name: 'Rare',      color: 0x5aa8ff, css: '#5aa8ff' },
  { name: 'Epic',      color: 0xb36bff, css: '#b36bff' },
  { name: 'Legendary', color: 0xffc247, css: '#ffc247' }
];

E.MATS = {
  iron:    { name: 'Iron Ore',        icon: 'm_iron' },
  wood:    { name: 'Blackwood Plank', icon: 'm_wood' },
  bone:    { name: 'Bone Shard',      icon: 'm_bone' },
  crystal: { name: 'Frost Crystal',   icon: 'm_crystal' },
  essence: { name: 'Ember Essence',   icon: 'm_essence' }
};
