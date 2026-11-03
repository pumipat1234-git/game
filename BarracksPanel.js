/* Barracks: roster, character sheet, skills, equipment, promotion, party membership. */
E.BarracksPanel = class extends E.PanelScene {
  constructor() { super('Barracks', 'Barracks — Heroes', 1200, 650); }
  init(d) { super.init(d); this.st = { page: 0, sel: E.G.s.heroes[0] && E.G.s.heroes[0].id, pick: null }; }
  get hero() { return E.G.hero(this.st.sel); }
  render() {
    const s = E.G.s, st = this.st, per = 8;
    this.put(this.goldBar(1000, 10));
    // ---- roster list ----
    this.put(E.UI.text(this, 24, 62, 'Roster ' + s.heroes.length + '/' + E.Town.maxRoster() + '   Party ' + s.party.length + '/' + E.MAX_PARTY, { size: 15, color: E.CS.dim }));
    this.put(E.UI.pager(this, 24, 612, st, s.heroes.length, per, () => this.rerender()));
    s.heroes.slice(st.page * per, st.page * per + per).forEach((h, i) => {
      const y = 92 + i * 62, inParty = s.party.includes(h.id), sel = h.id === st.sel;
      const row = this.put(E.UI.frame(this, 24, y, 340, 56, sel ? 'ui_row_s' : 'ui_row'));
      row.setInteractive({ useHandCursor: true }).on('pointerdown', () => { st.sel = h.id; st.pick = null; E.Sfx.play('click'); this.rerender(); });
      this.put(E.UI.portrait(this, 30, y + 2, h.cls, 44));
      this.put(E.UI.text(this, 90, y + 8, h.name + (h.prince ? ' ♛' : ''), { size: 18, bold: true, color: sel ? E.CS.goldLight : E.CS.text }));
      this.put(E.UI.text(this, 90, y + 32, 'Lv ' + h.level + ' ' + E.Hero.title(h), { size: 13, color: E.CS.blue }));
      if (inParty) this.put(E.UI.text(this, 350, y + 28, 'PARTY', { size: 12, bold: true, color: E.CS.green, ox: 1, oy: 0.5, st: 2 }));
    });
    const h = this.hero; if (!h) return;
    if (st.pick) return this.renderPicker(h);
    this.renderSheet(h);
  }
  renderSheet(h) {
    const s = E.G.s, st = this.st, cls = E.CLASSES[h.cls], S = E.Hero.stats(h), X = 390;
    // portrait + animated sprite
    this.put(E.UI.frame(this, X, 70, 210, 250, 'ui_slot'));
    const sp = this.add.sprite(X + 105, 280, 'hero_' + h.cls).setScale(6.4).setOrigin(0.5, 0.92); sp.play('idle_' + h.cls);
    sp.setInteractive({ useHandCursor: true }).on('pointerdown', () => { sp.play('atk_' + h.cls); E.Sfx.play('hit'); sp.once('animationcomplete', () => sp.play('idle_' + h.cls)); });
    this.put(sp);
    this.put(E.UI.text(this, X + 105, 306, 'click to preview attack', { size: 10, color: E.CS.dim, ox: 0.5 }));
    // name / level / xp
    const nx = X + 230;
    this.put(E.UI.text(this, nx, 70, h.name + (h.prince ? '  ♛ Prince' : ''), { size: 28, bold: true, color: E.CS.goldLight, st: 3 }));
    this.put(E.UI.text(this, nx, 106, 'Lv ' + h.level + '  ·  ' + E.Hero.title(h) + '  ·  ' + cls.role + '  ·  Tier ' + (h.tier + 1), { size: 16, color: E.CS.blue }));
    const need = E.Hero.xpNeed(h.level), maxed = h.level >= E.MAX_LEVEL;
    this.put(E.UI.bar(this, nx, 134, 300, 18, maxed ? 1 : h.xp / need, E.C.purple, maxed ? 'MAX' : h.xp + ' / ' + need + ' XP'));
    this.put(E.UI.text(this, nx + 320, 135, 'Power ' + E.Hero.power(h), { size: 16, bold: true, color: E.CS.goldLight }));
    const rows = [['u_heart', 'HP', S.hp], ['u_atk', 'ATK', S.atk], ['u_def', 'DEF', S.def], [null, 'SPD', S.spd], [null, 'RANGE', S.range], [null, 'CRIT', Math.round(S.crit * 100) + '%']];
    rows.forEach((r, i) => this.put(E.UI.statRow(this, nx + (i % 2) * 230, 170 + Math.floor(i / 2) * 26, r[0], r[1], (typeof r[2] === 'number' ? E.U.fmt(r[2]) : r[2]), 200)));
    // equipment slots
    this.put(E.UI.text(this, nx, 256, 'Equipment', { size: 15, bold: true, color: E.CS.goldLight }));
    E.SLOTS.forEach((sl, i) => {
      const uid = h.equip[sl], g = uid && E.Inv.gearByUid(uid), x = nx + i * 150;
      const slot = this.put(E.UI.slot(this, x, 280, 64, g ? E.Items.icon(g) : null, g ? E.Items.rarity(g).color : null, null, false));
      if (!g) this.put(E.UI.text(this, x + 32, 312, E.SLOT_NAMES[sl], { size: 10, color: E.CS.dim, ox: 0.5, oy: 1 }));
      slot.setInteractive({ useHandCursor: true }).on('pointerdown', () => { st.pick = sl; E.Sfx.play('click'); this.rerender(); });
      this.put(E.UI.text(this, x + 72, 282, g ? E.Items.name(g) : '— empty —', { size: 12, bold: true, color: g ? E.Items.rarity(g).css : E.CS.dim, wrap: 76 }));
      if (g) this.put(E.UI.text(this, x + 72, 322, E.Items.statLine(E.Items.stats(g)).replace(/  /g, '\n'), { size: 11, color: E.CS.dim, ls: 1 }));
    });
    // skills
    this.put(E.UI.text(this, X, 350, 'Skills', { size: 15, bold: true, color: E.CS.goldLight }));
    const skills = [['skill', 'Active · ' + cls.skill.cd + 's cooldown', cls.skill.desc, true], ['ult', 'Ultimate · unlocks at Lv ' + cls.ult.unlock, cls.ult.desc, E.Hero.ultUnlocked(h)]];
    skills.forEach((k, i) => {
      const y = 374 + i * 62, name = E.Hero.skillName(h, k[0]);
      this.put(E.UI.frame(this, X, y, 770, 56, 'ui_row'));
      this.put(E.UI.text(this, X + 12, y + 6, (k[3] ? '◆ ' : '🔒 ') + name, { size: 16, bold: true, color: k[3] ? E.CS.purple : E.CS.dim }), E.UI.text(this, X + 330, y + 8, k[1], { size: 12, color: E.CS.dim }));
      this.put(E.UI.text(this, X + 12, y + 30, k[2] + (h.tier ? '  (Power +' + h.tier * 25 + '%)' : ''), { size: 12, color: k[3] ? E.CS.text : E.CS.dim, wrap: 740 }));
    });
    // promotion
    const req = E.Hero.promoReq(h), can = E.Hero.canPromote(h);
    this.put(E.UI.frame(this, X, 504, 770, 82, 'ui_panel2', 10));
    if (!req) this.put(E.UI.text(this, X + 20, 530, '★ Maximum tier reached: ' + E.Hero.title(h), { size: 18, bold: true, color: E.CS.goldLight }));
    else {
      const mats = Object.keys(req.mats).map(m => req.mats[m] + ' ' + E.MATS[m].name + ' (' + (s.mats[m] || 0) + ')').join(', ');
      this.put(E.UI.text(this, X + 14, 512, 'Promote to ' + E.CLASSES[h.cls].titles[h.tier + 1], { size: 17, bold: true, color: E.CS.goldLight }));
      this.put(E.UI.text(this, X + 14, 538, 'Requires Lv ' + req.level + '  ·  ' + E.U.fmt(req.gold) + 'g  ·  ' + mats + '\n+' + Math.round((E.TIER_MULT[h.tier + 1] / E.TIER_MULT[h.tier] - 1) * 100) + '% stats and stronger skills', { size: 12, color: can.ok ? E.CS.green : E.CS.dim, wrap: 560, ls: 3 }));
      this.put(E.UI.button(this, X + 670, 545, 170, 44, 'Promote', () => {
        if (E.Hero.promote(h)) { E.Sfx.play('levelup'); this.toast(h.name + ' is now a ' + E.Hero.title(h) + '!'); this.rerender(); } else E.Sfx.play('error');
      }, { size: 18, skin: can.ok ? 'g' : 'n', disabled: !can.ok, sfx: 'confirm' }));
    }
    // party toggle
    const inParty = s.party.includes(h.id);
    this.put(E.UI.button(this, X + 130, 612, 250, 38, inParty ? 'Remove from Party' : 'Add to Party', () => {
      if (inParty) { if (s.party.length <= 1) { this.toast('The party needs at least one hero', E.CS.red); E.Sfx.play('error'); return; } s.party = s.party.filter(id => id !== h.id); }
      else { if (s.party.length >= E.MAX_PARTY) { this.toast('Party is full (5)', E.CS.red); E.Sfx.play('error'); return; } s.party.push(h.id); }
      E.Form.sanitize(s); this.rerender();
    }, { size: 16 }));
    this.put(E.UI.button(this, X + 420, 612, 250, 38, 'Edit Formation', () => { this.scene.stop(); this.scene.stop('Town'); this.scene.start('Formation', { mode: 'edit' }); }, { size: 16, icon: 'u_party' }));
  }
  renderPicker(h) {
    const st = this.st, slot = st.pick, X = 390, per = 6;
    this.put(E.UI.text(this, X, 70, E.SLOT_NAMES[slot] + ' — ' + h.name, { size: 22, bold: true, color: E.CS.goldLight }));
    const list = E.G.s.gear.filter(g => E.Items.slot(g) === slot && E.Inv.canEquip(h, g)).sort((a, b) => E.Items.rarity(b).color - E.Items.rarity(a).color || b.lvl - a.lvl);
    if (h.equip[slot]) this.put(E.UI.button(this, X + 560, 82, 200, 38, 'Unequip', () => { E.Inv.unequip(h, slot); st.pick = null; E.Sfx.play('click'); this.rerender(); }, { size: 16 }));
    this.put(E.UI.button(this, X + 680, 612, 180, 38, 'Back', () => { st.pick = null; this.rerender(); }, { size: 16 }));
    this.put(E.UI.pager(this, X, 612, st, list.length, per, () => this.rerender()));
    if (!list.length) this.put(E.UI.text(this, X, 130, 'No compatible ' + E.SLOT_NAMES[slot].toLowerCase() + ' in storage.\nCraft one at the Blacksmith or win drops in dungeons.' + (slot === 'weapon' ? '\n(' + E.CLASSES[h.cls].name + ' uses: ' + Object.values(E.EQUIP).filter(e => e.cls === h.cls).map(e => e.name).join(', ') + ')' : ''), { size: 17, color: E.CS.dim, ls: 8 }));
    list.slice(st.page * per, st.page * per + per).forEach((g, i) => {
      const y = 130 + i * 74, cur = h.equip[slot] === g.uid, other = E.Inv.equippedBy(g.uid), r = E.Items.rarity(g);
      this.put(E.UI.frame(this, X, y, 770, 66, cur ? 'ui_row_s' : 'ui_row'));
      this.put(E.UI.slot(this, X + 8, y + 5, 56, E.Items.icon(g), r.color));
      this.put(E.UI.text(this, X + 78, y + 10, E.Items.name(g), { size: 18, bold: true, color: r.css }), E.UI.text(this, X + 78, y + 38, r.name + '  ·  ' + E.Items.statLine(E.Items.stats(g)) + (other && !cur ? '   (on ' + other.name + ')' : ''), { size: 13, color: E.CS.dim }));
      this.put(E.UI.button(this, X + 690, y + 33, 130, 42, cur ? 'Equipped' : 'Equip', () => { E.Inv.equip(h, g.uid); E.Sfx.play('confirm'); st.pick = null; this.rerender(); }, { size: 16, skin: 'g', disabled: cur }));
    });
  }
};
