/* In-game clock. 1 real second in town = 6 game minutes (a day lasts ~4 real minutes). */
E.Clock = {
  RATE: 6,
  listeners: [],
  advance(min) {
    const s = E.G.s, d0 = Math.floor(s.time / 1440);
    s.time += min;
    const d1 = Math.floor(s.time / 1440);
    for (let d = d0 + 1; d <= d1; d++) E.Town.onNewDay(d + 1);
  },
  hour() { return (E.G.s.time % 1440) / 60; },
  /* 0 (day) .. 1 (deep night) */
  darkness() {
    const h = this.hour();
    if (h >= 7 && h < 18) return 0;
    if (h >= 18 && h < 21) return (h - 18) / 3;
    if (h >= 21 || h < 4) return 1;
    if (h >= 4 && h < 7) return 1 - (h - 4) / 3;
    return 0;
  },
  label() { const s = E.G.s; return 'Day ' + (Math.floor(s.time / 1440) + 1) + '  ' + E.U.clockStr(s.time); }
};
