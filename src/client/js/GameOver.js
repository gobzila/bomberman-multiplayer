class GameOver {
  constructor() {
    console.log('GameOver');
  }

  init(win) {
    console.log('GameOver - init', win);
    this.win = true ? win === true : false;
    this.pressed = false;
  }

  create() {
    console.log('GameOver - create');

    this.cameras.main.setBackgroundColor("#ffffff")

    const gameTitle = this.add.sprite(this.game.config.width / 2, 200, "gametitle");
    gameTitle.displayWidth = 700;
    gameTitle.displayHeight = 200;

    const win = this.add.sprite(this.game.config.width / 2, 400, this.win ? "win" : "lose");
    win.displayWidth = 300;
    win.displayHeight = 100;

    const playButton = this.add.image(this.game.config.width / 2, 550, "play-again");
    playButton.displayWidth = 300;
    playButton.displayHeight = 100;
    playButton.setInteractive();

    this.input.on('gameobjectdown', this.playTheGame);
  }

  playTheGame = () => {
    if (!this.pressed) {
      this.scene.start("TheGame");
      this.pressed = true;
    }
  }

}