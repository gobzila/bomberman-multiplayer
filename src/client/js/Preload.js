class Preload {
  constructor() {
    console.log('Preload');
  }

  preload() {
    console.log('Preload - preload', this);

    this.load.image('gametitle', 'assets/gametitle.png');
    this.load.image('play', 'assets/play.png');
    this.load.image('play-again', 'assets/play-again.png');

    this.load.tilemapTiledJSON('map', 'assets/tilemap2.json');
    this.load.image('tiles', 'assets/tiles2.png');
    this.load.image('waiting', 'assets/waiting.png');
    this.load.image('win', 'assets/win.png');
    this.load.image('lose', 'assets/lose.png');
    this.load.image('grey', 'assets/grey.png');
    this.load.image('brick', 'assets/brick.png');

    this.load.image('explosion-skill', 'assets/explosion-skill.png');
    this.load.image('bomb-skill', 'assets/bomb-skill.png');
    this.load.image('speed-skill', 'assets/speed-skill.png');

    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 24, frameHeight: 24 });
    this.load.spritesheet('bomb', 'assets/bomb.png', { frameWidth: 18, frameHeight: 18 });
    this.load.spritesheet('explosion-center', 'assets/explosion/explosion-center.png', { frameWidth: 18, frameHeight: 18 });
    this.load.spritesheet('explosion-left-end', 'assets/explosion/explosion-left-lenght.png', { frameWidth: 18, frameHeight: 18 });
    this.load.spritesheet('explosion-right-end', 'assets/explosion/explosion-right-lenght.png', { frameWidth: 18, frameHeight: 18 });
    this.load.spritesheet('explosion-up-end', 'assets/explosion/explosion-upper-lenght.png', { frameWidth: 18, frameHeight: 18 });
    this.load.spritesheet('explosion-down-end', 'assets/explosion/explosion-lower-lenght.png', { frameWidth: 18, frameHeight: 18 });
    this.load.spritesheet('explosion-extension-vertical', 'assets/explosion/explosion-extension-vertical.png', { frameWidth: 18, frameHeight: 18 });
    this.load.spritesheet('explosion-extension-horizontal', 'assets/explosion/explosion-extension-horizontal.png', { frameWidth: 18, frameHeight: 18 });
  }

  create() {
    console.log('Preload - create');
    this.scene.start('GameTitle');
  }
}