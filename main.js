/* Entry point: waits briefly for the web font, then boots Phaser at the 1280x720 reference resolution. */
E.bus = new Phaser.Events.EventEmitter();

E.start = function () {
  const panels = [E.EventPanel, E.BarracksPanel, E.InventoryPanel, E.BlacksmithPanel, E.RecruitPanel, E.TrainingPanel, E.CommandPanel, E.ExpeditionPanel, E.SavePanel, E.SettingsPanel, E.CreditsPanel];
  E.game = new Phaser.Game({
    type: Phaser.AUTO, width: E.W, height: E.H, parent: 'game', backgroundColor: '#05050c',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { pixelArt: false, antialias: true, roundPixels: true },
    input: { activePointers: 3 },
    scene: [E.BootScene, E.MenuScene, E.IntroScene, E.TownScene, E.FormationScene, E.BattleScene, ...panels]
  });
};

const wait = new Promise(res => {
  const done = () => res(); setTimeout(done, 1500);
  if (document.fonts && document.fonts.load) document.fonts.load('700 20px Cinzel').then(done, done); else done();
});
wait.then(() => E.start());
