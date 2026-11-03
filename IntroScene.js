E.IntroScene = class extends Phaser.Scene {
  constructor() { super('Intro'); }
  create() {
    this.page = 0;
    this.pages = [
      'For a thousand years the Aurelian kings held the Abyss at bay.\n\nThen, in a single blood-red night, the Royal Capital of ELDORIA fell.',
      'You are Prince Kael — last of your line.\n\nYou escaped the burning gates with a handful of loyal knights, and fled north to The Last Bastion: a crumbling border fort at the edge of the Blackwood.',
      'Rebuild the Bastion. Gather heroes. Forge arms.\n\nAnd reclaim Eldoria region by region — beginning with the Cursed Forest, where the first guardian has begun to rot.'
    ];
    this.add.image(0, 0, 'arena_abyss').setOrigin(0).setScale(2).setTint(0x403060);
    this.add.rectangle(0, 0, E.W, E.H, 0x000000, 0.55).setOrigin(0);
    const hero = this.add.sprite(1040, 560, 'hero_warrior').setScale(9).setOrigin(0.5, 0.92); hero.play('idle_warrior');
    this.txt = E.UI.text(this, 120, 240, '', { size: 28, wrap: 780, ls: 8, st: 3 });
    this.next = E.UI.button(this, 900, 640, 220, 50, 'Next', () => this.advance(), { size: 20, sfx: 'confirm' });
    E.UI.button(this, 1160, 640, 160, 50, 'Skip', () => this.finish(), { size: 18 });
    this.show();
  }
  show() {
    const s = this.pages[this.page]; this.txt.setText(''); let i = 0;
    if (this.ev) this.ev.remove();
    this.ev = this.time.addEvent({ delay: 22, repeat: s.length - 1, callback: () => { i++; this.txt.setText(s.slice(0, i)); } });
    this.next.setLabel(this.page === this.pages.length - 1 ? 'Begin' : 'Next');
  }
  advance() { if (this.ev && this.ev.getRepeatCount() > 0) { this.ev.remove(); this.txt.setText(this.pages[this.page]); return; } if (++this.page >= this.pages.length) this.finish(); else this.show(); }
  finish() { this.scene.start('Town'); }
};
