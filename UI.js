/* Reusable UI components (all real, interactive objects built from 9-slice frames). */
E.UI = {
  text(scene, x, y, str, o = {}) {
    const t = scene.add.text(x, y, String(str), {
      fontFamily: E.FONT, fontSize: (o.size || 16) + 'px', color: o.color || E.CS.text, fontStyle: o.bold ? 'bold' : 'normal',
      align: o.align || 'left', wordWrap: o.wrap ? { width: o.wrap } : undefined, stroke: '#05050c', strokeThickness: o.st || 0, lineSpacing: o.ls || 3
    });
    t.setOrigin(o.ox !== undefined ? o.ox : 0, o.oy !== undefined ? o.oy : 0); t.setResolution(2); return t;
  },
  icon(scene, x, y, key, scale = 2) { return scene.add.image(x, y, key).setScale(scale); },
  /* Interactive 9-slice button. Returns a container with setEnabled/setLabel. */
  button(scene, x, y, w, h, label, cb, o = {}) {
    const c = scene.add.container(x, y), skin = o.skin || 'n';
    const bg = scene.add.nineslice(0, 0, 'ui_btn_' + skin, undefined, w, h, 10, 10, 8, 8);
    c.add(bg);
    let ix = 0;
    if (o.icon) { const ic = scene.add.image(-w / 2 + 6 + (o.iconScale || 2) * 8, 0, o.icon).setScale(o.iconScale || 2); c.add(ic); ix = (o.iconScale || 2) * 8 / 2 + 3; c.ic = ic; }
    const t = E.UI.text(scene, ix, 0, label, { size: o.size || 16, color: o.color || E.CS.goldLight, ox: 0.5, oy: 0.5, bold: true, st: 2 });
    c.add(t); c.label = t; c.bg = bg; c.enabled = true; c.skin = skin; c.sel = false;
    c.setSize(w, h); c.setInteractive({ useHandCursor: true });
    const tex = k => bg.setTexture('ui_btn_' + k);
    const base = () => c.enabled ? (c.sel ? 'h' : skin) : 'd';
    c.on('pointerover', () => { if (!c.enabled) return; tex('h'); scene.tweens.add({ targets: c, scaleX: 1.04, scaleY: 1.04, duration: 90 }); E.Sfx.play('hover'); });
    c.on('pointerout', () => { tex(base()); scene.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 90 }); c.pressed = false; });
    c.on('pointerdown', () => { if (!c.enabled) { E.Sfx.play('error'); return; } c.pressed = true; tex('p'); c.setScale(0.96); });
    c.on('pointerup', () => {
      if (!c.enabled || !c.pressed) return; c.pressed = false; tex('h'); c.setScale(1.04);
      E.Sfx.play(o.sfx || 'click'); scene.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 120, ease: 'Back.Out' });
      cb && cb(c);
    });
    c.setEnabled = v => { c.enabled = v; tex(base()); t.setAlpha(v ? 1 : 0.5); if (c.ic) c.ic.setAlpha(v ? 1 : 0.5); if (!v) c.input.cursor = 'default'; else c.input.cursor = 'pointer'; return c; };
    c.setSelected = v => { c.sel = v; tex(base()); return c; };
    c.setLabel = s => t.setText(s);
    if (o.disabled) c.setEnabled(false);
    return c;
  },
  /* 9-slice panel with title. Origin is top-left. */
  panel(scene, x, y, w, h, title, o = {}) {
    const c = scene.add.container(x, y);
    c.add(scene.add.nineslice(0, 0, o.light ? 'ui_panel2' : 'ui_panel', undefined, w, h, 14, 14, 14, 14).setOrigin(0));
    if (title) {
      c.add(E.UI.text(scene, 24, 14, title, { size: o.titleSize || 22, color: E.CS.goldLight, bold: true, st: 3 }));
      const ln = scene.add.rectangle(24, 46, w - 48, 2, E.C.goldDark).setOrigin(0); c.add(ln);
      c.add(scene.add.rectangle(24 + 6, 46, 40, 2, E.C.goldLight).setOrigin(0));
    }
    c.w = w; c.h = h; return c;
  },
  frame(scene, x, y, w, h, key = 'ui_slot', insets = 6) { return scene.add.nineslice(x, y, key, undefined, w, h, insets, insets, insets, insets).setOrigin(0); },
  /* Horizontal bar with frame */
  bar(scene, x, y, w, h, pct, col, label) {
    const c = scene.add.container(x, y);
    const bg = scene.add.rectangle(0, 0, w, h, 0x05050c).setOrigin(0).setStrokeStyle(1, E.C.goldDark);
    const fill = scene.add.rectangle(1, 1, Math.max(0, (w - 2) * E.U.clamp(pct, 0, 1)), h - 2, col).setOrigin(0);
    const hi = scene.add.rectangle(1, 1, Math.max(0, (w - 2) * E.U.clamp(pct, 0, 1)), Math.max(1, (h - 2) / 3), 0xffffff, 0.22).setOrigin(0);
    c.add([bg, fill, hi]);
    if (label) c.add(E.UI.text(scene, w / 2, h / 2, label, { size: Math.min(14, h), ox: 0.5, oy: 0.5, bold: true, st: 3 }));
    return c;
  },
  portrait(scene, x, y, cls, size = 64, sel = false) {
    const c = scene.add.container(x, y);
    c.add(E.UI.frame(scene, 0, 0, size + 8, size + 8, sel ? 'ui_slot_s' : 'ui_slot', 6));
    c.add(scene.add.image(4, 4, 'port_' + cls).setOrigin(0).setDisplaySize(size, size)); return c;
  },
  /* Item slot: icon + rarity border + optional count. */
  slot(scene, x, y, size, icon, rarityCol, count, sel) {
    const c = scene.add.container(x, y);
    c.add(E.UI.frame(scene, 0, 0, size, size, sel ? 'ui_slot_s' : 'ui_slot', 6));
    if (rarityCol !== undefined && rarityCol !== null) c.add(scene.add.rectangle(2, 2, size - 4, size - 4).setOrigin(0).setStrokeStyle(2, rarityCol, 0.9));
    if (icon) c.add(scene.add.image(size / 2, size / 2, icon).setScale(Math.floor((size - 8) / 16)));
    if (count !== undefined && count !== null) c.add(E.UI.text(scene, size - 3, size - 2, count, { size: 13, ox: 1, oy: 1, bold: true, st: 3 }));
    c.setSize(size, size); c.w = size; return c;
  },
  toast(scene, msg, col = E.CS.goldLight) {
    const t = E.UI.text(scene, 640, 640, msg, { size: 20, color: col, bold: true, ox: 0.5, oy: 0.5, st: 4 });
    const w = t.width + 40, bg = scene.add.nineslice(640, 640, 'ui_panel2', undefined, w, 44, 12, 12, 12, 12);
    const c = scene.add.container(0, 0, [bg, t]).setDepth(100000).setAlpha(0);
    scene.tweens.add({ targets: c, alpha: 1, y: -14, duration: 200 });
    scene.tweens.add({ targets: c, alpha: 0, delay: 1800, duration: 400, onComplete: () => c.destroy() });
    return c;
  },
  /* Blocking confirm/alert dialog. buttons: [{label, cb, skin}] */
  modal(scene, title, msg, buttons) {
    const c = scene.add.container(0, 0).setDepth(200000);
    const dim = scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.65).setInteractive(); c.add(dim);
    const w = 560, h = 230, p = E.UI.panel(scene, 640 - w / 2, 360 - h / 2, w, h, title); c.add(p);
    c.add(E.UI.text(scene, 640, 345, msg, { size: 17, ox: 0.5, oy: 0.5, wrap: w - 60, align: 'center' }));
    const n = buttons.length, bw = 170, gap = 20, x0 = 640 - (n * bw + (n - 1) * gap) / 2 + bw / 2;
    buttons.forEach((b, i) => c.add(E.UI.button(scene, x0 + i * (bw + gap), 360 + h / 2 - 42, bw, 42, b.label, () => { c.destroy(); b.cb && b.cb(); }, { skin: b.skin })));
    c.alpha = 0; scene.tweens.add({ targets: c, alpha: 1, duration: 120 });
    return c;
  },
  statRow(scene, x, y, icon, label, value, w = 200) {
    const c = scene.add.container(x, y);
    if (icon) c.add(scene.add.image(8, 9, icon).setScale(1.25));
    c.add(E.UI.text(scene, icon ? 24 : 0, 0, label, { size: 15, color: E.CS.dim }));
    c.add(E.UI.text(scene, w, 0, value, { size: 15, ox: 1, bold: true }));
    return c;
  },
  /* Pager: returns {page, items, controls} helper state; caller re-renders on change. */
  pager(scene, x, y, st, total, per, onChange) {
    const pages = Math.max(1, Math.ceil(total / per)); st.page = E.U.clamp(st.page || 0, 0, pages - 1);
    const c = scene.add.container(x, y);
    const prev = E.UI.button(scene, 0, 0, 44, 30, '', () => { st.page--; onChange(); }, { icon: 'u_up', size: 12 });
    const next = E.UI.button(scene, 54, 0, 44, 30, '', () => { st.page++; onChange(); }, { icon: 'u_down', size: 12 });
    prev.setEnabled(st.page > 0); next.setEnabled(st.page < pages - 1);
    c.add([prev, next, E.UI.text(scene, 112, 0, (st.page + 1) + ' / ' + pages, { size: 14, color: E.CS.dim, oy: 0.5 })]);
    return c;
  }
};
