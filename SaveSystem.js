/* Manual saves only (IndexedDB). No autosave anywhere in the code base. */
E.Save = {
  DB: 'eldoria-saves', STORE: 'slots', _db: null, mem: {}, // mem = fallback if IndexedDB is unavailable
  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((res, rej) => {
      try {
        const rq = indexedDB.open(this.DB, 1);
        rq.onupgradeneeded = () => rq.result.createObjectStore(this.STORE);
        rq.onsuccess = () => { this._db = rq.result; res(this._db); };
        rq.onerror = () => rej(rq.error);
      } catch (e) { rej(e); }
    });
  },
  _tx(mode, fn) {
    return this.open().then(db => new Promise((res, rej) => {
      const tx = db.transaction(this.STORE, mode), st = tx.objectStore(this.STORE), rq = fn(st);
      tx.oncomplete = () => res(rq && rq.result); tx.onerror = () => rej(tx.error);
    })).catch(() => fn === null ? null : this._fallback(mode, fn));
  },
  _fallback() { return Promise.resolve(null); },
  async list() {
    const out = [];
    for (let i = 0; i < E.SAVE_SLOTS; i++) out.push(await this.get(i));
    return out;
  },
  async get(i) {
    try { const r = await this._tx('readonly', st => st.get('slot' + i)); return r || this.mem['slot' + i] || null; }
    catch (e) { return this.mem['slot' + i] || null; }
  },
  meta(s) {
    const lead = s.party.map(id => s.heroes.find(h => h.id === id)).filter(Boolean);
    return {
      savedAt: Date.now(), day: Math.floor(s.time / 1440) + 1, gold: s.gold, heroes: s.heroes.length,
      maxLevel: Math.max(...s.heroes.map(h => h.level)), party: lead.map(h => h.cls),
      progress: Object.values(s.cleared).filter(c => c.boss).length
    };
  },
  async write(i) {
    const rec = { meta: this.meta(E.G.s), data: E.G.serialize() };
    this.mem['slot' + i] = rec;
    try { await this._tx('readwrite', st => st.put(rec, 'slot' + i)); } catch (e) { }
    return rec;
  },
  async load(i) { const r = await this.get(i); if (!r) return false; E.G.load(r.data); return true; },
  async remove(i) { delete this.mem['slot' + i]; try { await this._tx('readwrite', st => st.delete('slot' + i)); } catch (e) { } },
  async latest() {
    const l = await this.list(); let best = -1, t = 0;
    l.forEach((r, i) => { if (r && r.meta.savedAt > t) { t = r.meta.savedAt; best = i; } });
    return best;
  }
};
