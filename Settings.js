/* User settings (not game progress). Stored in localStorage; progress is manual-save only (IndexedDB). */
E.Settings = {
  KEY: 'eldoria.settings.v1',
  d: { music: 0.4, sfx: 0.7, damageNumbers: true, screenShake: true, tipsShown: false },
  load() {
    try { const r = localStorage.getItem(this.KEY); if (r) Object.assign(this.d, JSON.parse(r)); } catch (e) { /* storage unavailable */ }
  },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.d)); } catch (e) { } },
  set(k, v) { this.d[k] = v; this.save(); if (k === 'music' && E.Music) E.Music.setVolume(v); }
};
E.Settings.load();
