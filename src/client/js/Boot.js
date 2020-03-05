
class Boot {
  constructor() {
    console.log('Boot');
  }

  preload() {
    console.log('Boot - preload', this);

    this.cameras.main.setBackgroundColor("#ffffff")

    this.load.image('loading', 'assets/loading.jpg');
  }

  create() {
    console.log('Boot - create');
    
    this.add.sprite(this.game.config.width / 2, this.game.config.height / 2, "loading");
    this.scene.start('Preload');
  }
}