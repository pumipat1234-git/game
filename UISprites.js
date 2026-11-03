/* 9-slice UI frames in dark-blue / antique-gold. Used by E.UI components. */
E.UISprites = {
  build(scene) {
    const PG = E.PG, S = PG.sh;
    const frame = (key, w, h, o) => {
      const [c, ctx] = PG.canvas(w, h), P = PG.pen(ctx);
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, o.top); g.addColorStop(1, o.bot); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      P(0, 0, w, 1, '#07070f'); P(0, h - 1, w, 1, '#07070f'); P(0, 0, 1, h, '#07070f'); P(w - 1, 0, 1, h, '#07070f');
      P(1, 1, w - 2, 2, o.gold); P(1, h - 3, w - 2, 2, o.goldDark); P(1, 1, 2, h - 2, o.gold); P(w - 3, 1, 2, h - 2, o.goldDark);
      P(3, 3, w - 6, 1, o.hi); P(3, 3, 1, h - 6, o.hi);
      if (o.corner) for (const [x, y] of [[0, 0], [w - 7, 0], [0, h - 7], [w - 7, h - 7]]) { P(x, y, 7, 7, '#07070f'); P(x + 1, y + 1, 5, 5, o.cornerCol); P(x + 2, y + 2, 3, 3, o.gold); P(x + 3, y + 3, 1, 1, '#fff6c0'); }
      PG.register(scene, key, c);
    };
    const gold = '#d4a84a', gd = '#8a6a2a';
    frame('ui_panel', 48, 48, { top: '#1a2145', bot: '#0b0d1e', gold, goldDark: gd, hi: '#3a4690', corner: true, cornerCol: gd });
    frame('ui_panel2', 32, 32, { top: '#12183a', bot: '#080a18', gold: gd, goldDark: '#5a4420', hi: '#242c5c', corner: false });
    frame('ui_btn_n', 32, 24, { top: '#2c3870', bot: '#141a38', gold, goldDark: gd, hi: '#4a58a8', corner: false });
    frame('ui_btn_h', 32, 24, { top: '#4a3a90', bot: '#241a5a', gold: '#f2d98a', goldDark: gold, hi: '#8a78e0', corner: false });
    frame('ui_btn_p', 32, 24, { top: '#0e1230', bot: '#1a2250', gold: gd, goldDark: '#5a4420', hi: '#1a2250', corner: false });
    frame('ui_btn_d', 32, 24, { top: '#22222c', bot: '#14141c', gold: '#4a4a56', goldDark: '#2e2e38', hi: '#2e2e38', corner: false });
    frame('ui_btn_g', 32, 24, { top: '#3a5a2a', bot: '#1a3014', gold: '#9ae080', goldDark: '#4a8a3a', hi: '#5a8a46', corner: false });
    frame('ui_slot', 24, 24, { top: '#0a0c1c', bot: '#14183a', gold: gd, goldDark: '#4a3a1a', hi: '#0a0c1c', corner: false });
    frame('ui_slot_s', 24, 24, { top: '#2a2260', bot: '#18144a', gold: '#f2d98a', goldDark: gold, hi: '#5a48b0', corner: false });
    frame('ui_row', 24, 24, { top: '#161c40', bot: '#0e1230', gold: '#3a3a5a', goldDark: '#262640', hi: '#1c2450', corner: false });
    frame('ui_row_s', 24, 24, { top: '#3a2c70', bot: '#241a50', gold, goldDark: gd, hi: '#5a48b0', corner: false });
    const [c, x] = PG.canvas(2, 2); x.fillStyle = '#fff'; x.fillRect(0, 0, 2, 2); PG.register(scene, 'px', c);
  }
};
