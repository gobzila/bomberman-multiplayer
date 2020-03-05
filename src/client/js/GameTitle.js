class GameTitle {
  constructor() {
    console.log('GameTitle');
  }

  init() {
    this.pressed = false;
  }

  create() {
    console.log('GameTitle - create');

    this.cameras.main.setBackgroundColor("#ffffff")

    const gameTitle = this.add.sprite(this.game.config.width / 2, 300, "gametitle");
    gameTitle.displayWidth = 700;
    gameTitle.displayHeight = 200;

    const playButton = this.add.image(this.game.config.width / 2, 550, "play");
    playButton.displayWidth = 300;
    playButton.displayHeight = 100;
    playButton.setInteractive();

    this.input.on('gameobjectdown',this.playTheGame);
  }

  playTheGame = () => {
    if(!this.pressed){
      this.scene.start("TheGame");
      this.pressed = true;
    }
  }
}