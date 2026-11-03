/* Tiny WebAudio synth: SFX + ambient dark pad. No audio files needed. */
E.Sfx = {
  ctx: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
  },
  tone(freq, dur, type = 'square', vol = 0.15, slide = 0, delay = 0) {
    if (!this.ctx) return;
    const v = vol * E.Settings.d.sfx; if (v <= 0.001) return;
    const t0 = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.ctx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  },
  play(n) {
    if (!this.ctx) return;
    switch (n) {
      case 'hover': this.tone(660, 0.04, 'triangle', 0.05); break;
      case 'click': this.tone(440, 0.08, 'square', 0.12, 220); break;
      case 'confirm': this.tone(523, 0.08, 'square', 0.12); this.tone(784, 0.12, 'square', 0.12, 0, 0.07); break;
      case 'error': this.tone(180, 0.18, 'sawtooth', 0.14, -60); break;
      case 'coin': this.tone(988, 0.07, 'square', 0.1); this.tone(1319, 0.14, 'square', 0.1, 0, 0.06); break;
      case 'hit': this.tone(140, 0.09, 'sawtooth', 0.12, -60); break;
      case 'crit': this.tone(220, 0.14, 'sawtooth', 0.16, -100); this.tone(900, 0.06, 'square', 0.08); break;
      case 'shoot': this.tone(900, 0.08, 'triangle', 0.08, -500); break;
      case 'magic': this.tone(300, 0.3, 'sine', 0.14, 500); break;
      case 'heal': this.tone(600, 0.1, 'sine', 0.12); this.tone(900, 0.2, 'sine', 0.12, 0, 0.08); break;
      case 'ult': this.tone(110, 0.5, 'sawtooth', 0.18, 300); this.tone(440, 0.4, 'square', 0.1, 400, 0.1); break;
      case 'warn': this.tone(300, 0.12, 'square', 0.1); this.tone(300, 0.12, 'square', 0.1, 0, 0.18); break;
      case 'levelup': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'square', 0.12, 0, i * 0.1)); break;
      case 'victory': [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.16, 0, i * 0.12)); break;
      case 'defeat': [330, 262, 196, 130].forEach((f, i) => this.tone(f, 0.3, 'sawtooth', 0.12, 0, i * 0.2)); break;
      case 'anvil': this.tone(1200, 0.06, 'square', 0.12); this.tone(800, 0.2, 'triangle', 0.1, 0, 0.04); break;
    }
  }
};

E.Music = {
  on: false, nodes: [],
  start() {
    if (this.on || !E.Sfx.ctx) return;
    const ctx = E.Sfx.ctx; this.on = true;
    this.master = ctx.createGain(); this.master.gain.value = E.Settings.d.music * 0.12; this.master.connect(ctx.destination);
    // slow minor drone: A1 + E2 + C3 with LFO breathing
    [55, 82.4, 130.8, 164.8].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain();
      o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f; g.gain.value = 0.25;
      l.frequency.value = 0.05 + i * 0.03; lg.gain.value = 0.18; l.connect(lg); lg.connect(g.gain);
      o.connect(g); g.connect(this.master); o.start(); l.start(); this.nodes.push(o, l);
    });
  },
  setVolume(v) { if (this.master) this.master.gain.value = v * 0.12; }
};
