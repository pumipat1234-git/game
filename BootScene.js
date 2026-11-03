/* Generates every placeholder texture + animation once, then opens the title screen. */
E.BootScene = class extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    const t0 = performance.now();
    E.UISprites.build(this); E.IconSprites.build(this); E.HeroSprites.build(this); E.MonsterSprites.build(this); E.TownSprites.build(this);
    for (const cls of E.CLASS_ORDER) {
      this.anims.create({ key: 'idle_' + cls, frames: ['idle0', 'idle1'].map(f => ({ key: 'hero_' + cls, frame: f })), frameRate: 2.2, repeat: -1 });
      this.anims.create({ key: 'walk_' + cls, frames: ['walk0', 'walk1', 'walk2', 'walk3'].map(f => ({ key: 'hero_' + cls, frame: f })), frameRate: 9, repeat: -1 });
      this.anims.create({ key: 'atk_' + cls, frames: ['atk0', 'atk1', 'atk2'].map(f => ({ key: 'hero_' + cls, frame: f })), frameRate: 9, repeat: 0 });
    }
    E.bootMs = Math.round(performance.now() - t0);
    const el = document.getElementById('boot'); if (el) { el.classList.add('hide'); setTimeout(() => el.remove(), 600); }
    this.scene.start('Menu');
  }
};
