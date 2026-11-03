/* Base class for modal panels launched on top of Town/Menu. Subclasses implement render(). */
E.PanelScene = class extends Phaser.Scene {
  constructor(key, title, w, h) { super(key); this.panelTitle = title; this.pw = w; this.ph = h; }
  init(data) { this.opts = data || {}; this.st = {}; this.closing = false; }
  create() {
    this.dim = this.add.rectangle(640, 360, 1280, 720, 0x03030a, 0.7).setInteractive().setAlpha(0);
    this.px = (E.W - this.pw) / 2; this.py = (E.H - this.ph) / 2;
    this.shell = this.add.container(0, 0);
    this.frame = E.UI.panel(this, this.px, this.py, this.pw, this.ph, this.panelTitle);
    this.shell.add(this.frame);
    this.content = this.add.container(this.px, this.py);
    this.closeBtn = E.UI.button(this, this.px + this.pw - 30, this.py + 28, 40, 34, '', () => this.close(), { icon: 'u_x', size: 12, sfx: 'click' });
    this.input.keyboard.on('keydown-ESC', () => this.close());
    this.tweens.add({ targets: this.dim, alpha: 0.7, duration: 150 });
    this.shell.setAlpha(0); this.content.setAlpha(0); this.closeBtn.setAlpha(0);
    this.tweens.add({ targets: [this.shell, this.content, this.closeBtn], alpha: 1, duration: 160 });
    this.render();
  }
  /* Add display objects to the content container (coordinates are panel-local). */
  put(...objs) { objs.forEach(o => this.content.add(o)); return objs[0]; }
  rerender() { this.content.removeAll(true); this.render(); }
  render() { }
  toast(msg, col) { E.UI.toast(this, msg, col); }
  goldBar(x = 24, y = 10) {
    const g = this.add.container(x, y);
    g.add(this.add.image(8, 12, 'u_coin').setScale(1.5)); g.add(E.UI.text(this, 24, 2, E.U.fmt(E.G.s.gold), { size: 18, color: E.CS.goldLight, bold: true, st: 2 }));
    return g;
  }
  close() {
    if (this.closing) return; this.closing = true; E.Sfx.play('click');
    this.scene.stop();
    const p = this.opts.parent; if (p) { this.scene.resume(p); }
    if (this.opts.onClose) this.opts.onClose();
  }
};
