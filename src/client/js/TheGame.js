
var self;
class TheGame {
  constructor() {
    console.log('TheGame');
    
    this.id = null;
    this.map = null;
    this.blockLayer = null;
    this.groundLayer = null;
    this.bricksGroup = null;
    this.players = {};
    this.bombsGroup = null;
    this.explosionGroup = null;
    this.spaceEvent = true;
    this.socket = null;
  }

  create() {
    console.log('TheGame - create');

    self = this;

    this.cameras.main.setBackgroundColor('#ffffff')

    this.map = this.make.tilemap({ key: 'map' });
    const tiles = this.map.addTilesetImage('tiles2', 'tiles');

    this.groundLayer = this.map.createStaticLayer('Ground Layer', tiles, 0, 50);
    this.blockLayer = this.map.createStaticLayer('Block Layer', tiles, 0, 50);
    this.blockLayer.setCollisionByProperty({ collides: true });

    this.bombsGroup = this.physics.add.group();
    this.explosionGroup = this.physics.add.group();
    this.bricksGroup = this.physics.add.group();
    this.explosionSkillsGroup = this.physics.add.group();
    this.speedSkillsGroup = this.physics.add.group();
    this.bombSkillsGroup = this.physics.add.group();
    this.bombSkillsGroup = this.physics.add.group();
    this.speedSkillsGroup = this.physics.add.group();

    this.topImage = this.add.image(340, 25, 'grey');
    this.topImage.displayWidth = 680;
    this.topImage.displayHeight = 50;
    this.blackScoreText = this.add.text(50, 20, `White Player Score: 0`);
    this.whiteScoreText = this.add.text(400, 20, `Black Player Score: 0`);

    this.addExplosionsSkills();
    this.addBombSkills();
    this.addSpeedSkills();
    this.addBrikcs();
    this.waitingImage = this.add.image(340, 300, 'waiting');
    this.waitingImage.displayWidth = 400;
    this.waitingImage.displayHeight = 200;
    this.waitingImage.setDepth(1);

    this.socket = io();
    this.socket.emit('init')

    this.socket.on('id', function (id) {
      self.id = id;
    });

    this.socket.on('players', function (players) {
      if (Object.keys(players).length === 2) {
        self.waitingImage.destroy();
      }
      Object.keys(players).forEach(function (id) {
        if (!self.players[id]) {
          self.createPlayer(players[id]);
        }
      });
    });

    this.socket.on('playerMove', function ({ id, position }) {
      self.setPlayerPosition(self.players[id], position);
    });

    this.socket.on('createBomb', function ({ id, position }) {
      self.createBomb(self.players[id], position);
    });

    this.socket.on('reloadGame', function (players) {
      self.reloadGame(players);
    });

    this.socket.on('gameOver', function (id) {
      self.gameOver(id);
    });

    this.socket.on('playerDisconnect', function () {
      self.socket.disconnect();
      self.scene.start("GameTitle");
    });
  }

  update() {
    if (Object.keys(this.players).length !== 2) {
      return;
    }
    if (this.id && this.players[this.id]) {
      this.movePlayer(this.players[this.id]);
    }
    this.addKeyboardEvents();
  }

  addExplosionsSkills() {
    let skill = this.physics.add.sprite(140, 110, 'explosion-skill');
    skill.displayWidth = 36;
    skill.displayHeight = 36;
    this.explosionSkillsGroup.add(skill);
    let skill2 = this.physics.add.sprite(420, 190, 'explosion-skill');
    skill2.displayWidth = 36;
    skill2.displayHeight = 36;
    this.explosionSkillsGroup.add(skill2);
    let skill3 = this.physics.add.sprite(500, 350, 'explosion-skill');
    skill3.displayWidth = 36;
    skill3.displayHeight = 36;
    this.explosionSkillsGroup.add(skill3);
    let skill4 = this.physics.add.sprite(260, 430, 'explosion-skill');
    skill4.displayWidth = 36;
    skill4.displayHeight = 36;
    this.explosionSkillsGroup.add(skill4);
  }

  addBombSkills() {
    let skill = this.physics.add.sprite(140, 390, 'bomb-skill');
    skill.displayWidth = 36;
    skill.displayHeight = 36;
    this.bombSkillsGroup.add(skill);
    let skill2 = this.physics.add.sprite(300, 150, 'bomb-skill');
    skill2.displayWidth = 36;
    skill2.displayHeight = 36;
    this.bombSkillsGroup.add(skill2);
    let skill3 = this.physics.add.sprite(420, 350, 'bomb-skill');
    skill3.displayWidth = 36;
    skill3.displayHeight = 36;
    this.bombSkillsGroup.add(skill3);
    let skill4 = this.physics.add.sprite(500, 430, 'bomb-skill');
    skill4.displayWidth = 36;
    skill4.displayHeight = 36;
    this.bombSkillsGroup.add(skill4);
  }

  addSpeedSkills() {
    let skill = this.physics.add.sprite(540, 110, 'speed-skill');
    skill.displayWidth = 36;
    skill.displayHeight = 36;
    this.speedSkillsGroup.add(skill);
    let skill2 = this.physics.add.sprite(420, 430, 'speed-skill');
    skill2.displayWidth = 36;
    skill2.displayHeight = 36;
    this.speedSkillsGroup.add(skill2);
    let skill3 = this.physics.add.sprite(300, 350, 'speed-skill');
    skill3.displayWidth = 36;
    skill3.displayHeight = 36;
    this.speedSkillsGroup.add(skill3);
    let skill4 = this.physics.add.sprite(180, 270, 'speed-skill');
    skill4.displayWidth = 36;
    skill4.displayHeight = 36;
    this.speedSkillsGroup.add(skill4);
  }

  addBrikcs() {
    for (let i = 140; i <= 560; i += 40) {
      for (let j = 110; j <= 480; j += 40) {
        if (this.verifyNotBlock(i, j)) {
          let brick = this.physics.add.sprite(i, j, 'brick');
          brick.displayWidth = 40;
          brick.displayHeight = 40;
          brick.body.moves = false;
          this.physics.add.overlap(brick, this.explosionGroup, () => {
            this.bricksGroup.kill(brick);
            brick.disableBody(true, true);
          }, null, this);
          this.bricksGroup.add(brick);
        }
      }
    }
  }

  createPlayer(player) {
    this.players[player.id] = {
      color: player.color,
      id: player.id,
      sprite: null,
      bombsNo: 0,
      bombsMaxNo: 2,
      dead: false,
      score: player.score,
      velocity: 0,
      explosion: 1,
    }
    if (player.color === 'white') {
      this.players[player.id].sprite = this.physics.add.sprite(60, 110, 'player');
      this.whiteScoreText.setText(`White Player Score: ${player.score}`);
    } else {
      this.players[player.id].sprite = this.physics.add.sprite(620, 110, 'player', 1);
      this.blackScoreText.setText(`Black Player Score: ${player.score}`);
    }
    this.players[player.id].sprite.displayWidth = 26;
    this.players[player.id].sprite.displayHeight = 32;
    this.players[player.id].sprite.setCollideWorldBounds(true);

    this.physics.add.collider(this.players[player.id].sprite, this.blockLayer);
    this.physics.add.collider(this.players[player.id].sprite, this.bombsGroup);
    this.physics.add.collider(this.players[player.id].sprite, this.bricksGroup);
    this.physics.add.overlap(this.players[player.id].sprite, this.bombSkillsGroup, (_player, bombSkill) => {
      bombSkill.disableBody(true, true);
      this.bombSkillsGroup.kill(bombSkill);
      this.players[player.id].bombsMaxNo++;
    }, null, this);
    this.physics.add.overlap(this.players[player.id].sprite, this.speedSkillsGroup, (_player, speedSkill) => {
      speedSkill.disableBody(true, true);
      this.speedSkillsGroup.kill(speedSkill);
      this.players[player.id].velocity += 30;
    }, null, this);
    this.physics.add.overlap(this.players[player.id].sprite, this.explosionSkillsGroup, (_player, explosionSkill) => {
      explosionSkill.disableBody(true, true);
      this.explosionSkillsGroup.kill(explosionSkill);
      this.players[player.id].explosion++;;
    }, null, this);
    this.physics.add.overlap(this.players[player.id].sprite, this.explosionGroup, () => this.killPlayer(this.players[player.id]), null, this);

    if (player.color === 'white') {
      this.anims.create({
        key: `right-${player.id}`,
        frames: this.anims.generateFrameNumbers('player', { frames: [32, 40, 24] }),
        frameRate: 10,
      });

      this.anims.create({
        key: `left-${player.id}`,
        frames: this.anims.generateFrameNumbers('player', { frames: [56, 64, 48] }),
        frameRate: 10,
      });

      this.anims.create({
        key: `up-${player.id}`,
        frames: this.anims.generateFrameNumbers('player', { frames: [80, 88, 72] }),
        frameRate: 10,
      });

      this.anims.create({
        key: `down-${player.id}`,
        frames: this.anims.generateFrameNumbers('player', { frames: [8, 16, 0] }),
        frameRate: 10,
      });

      this.anims.create({
        key: `dead-${player.id}`,
        frames: this.anims.generateFrameNumbers('player', { frames: [96, 104, 112, 120, 128, 136, 144, 152] }),
        frameRate: 6,
      });
    } else {
      this.anims.create({
        key: `right-${player.id}`,
        frames: this.anims.generateFrameNumbers('player', { frames: [33, 41, 25] }),
        frameRate: 10,
      });

      this.anims.create({
        key: `left-${player.id}`,
        frames: this.anims.generateFrameNumbers('player', { frames: [57, 65, 49] }),
        frameRate: 10,
      });

      this.anims.create({
        key: `up-${player.id}`,
        frames: this.anims.generateFrameNumbers('player', { frames: [81, 89, 73] }),
        frameRate: 10,
      });

      this.anims.create({
        key: `down-${player.id}`,
        frames: this.anims.generateFrameNumbers('player', { frames: [9, 17, 1] }),
        frameRate: 10,
      });

      this.anims.create({
        key: `dead-${player.id}`,
        frames: this.anims.generateFrameNumbers('player', { frames: [97, 105, 113, 121, 129, 137, 145, 153] }),
        frameRate: 6,
      });
    }
  }

  movePlayer(player) {
    if (player.dead || !player.sprite.body) {
      return;
    }
    const cursors = this.input.keyboard.createCursorKeys();
    player.sprite.body.setVelocity(0);
    const left = cursors.left.isDown;
    const right = cursors.right.isDown;
    const up = cursors.up.isDown;
    const down = cursors.down.isDown;

    if (left) {
      player.sprite.body.setVelocityY(0);
      player.sprite.body.setVelocityX(-100 - player.velocity); // move left
      player.sprite.anims.play(`left-${player.id}`, true);
      this.socket.emit('playerMove', { x: player.sprite.x, y: player.sprite.y, direction: 'left' });
    }
    else if (right) {
      player.sprite.body.setVelocityY(0);
      player.sprite.body.setVelocityX(100 + player.velocity);
      player.sprite.anims.play(`right-${player.id}`, true);
      this.socket.emit('playerMove', { x: player.sprite.x, y: player.sprite.y, direction: 'right' });
    }
    else if (up) {
      player.sprite.body.setVelocityX(0);
      player.sprite.body.setVelocityY(-100 - player.velocity);
      player.sprite.anims.play(`up-${player.id}`, true);
      this.socket.emit('playerMove', { x: player.sprite.x, y: player.sprite.y, direction: 'up' });
    }
    else if (down) {
      player.sprite.body.setVelocityX(0);
      player.sprite.body.setVelocityY(100 + player.velocity);
      player.sprite.anims.play(`down-${player.id}`, true);
      this.socket.emit('playerMove', { x: player.sprite.x, y: player.sprite.y, direction: 'down' });
    }
  }

  setPlayerPosition(player, position) {
    if (player.dead) {
      return;
    }
    if (position.x < player.sprite.x) {
      player.sprite.x = position.x
      player.sprite.anims.play(`left-${player.id}`, true);
    } else if (position.x > player.sprite.x) {
      player.sprite.x = position.x
      player.sprite.anims.play(`right-${player.id}`, true);
    } else if (position.y < player.sprite.y) {
      player.sprite.y = position.y
      player.sprite.anims.play(`up-${player.id}`, true);
    } else if (position.y > player.sprite.y) {
      player.sprite.y = position.y
      player.sprite.anims.play(`down-${player.id}`, true);
    } else {
      player.sprite.anims.play(`${position.direction}-${player.id}`, true);
    }
  }

  addKeyboardEvents() {
    const space = this.input.keyboard.addKey('SPACE');
    if (space.isDown && this.spaceEvent) {
      this.putBomb(this.players[this.id])
      this.spaceEvent = false;
    }
    if (space.isUp) {
      this.spaceEvent = true;
    }
  }

  putBomb(player) {
    if (player.bombsNo >= player.bombsMaxNo) {
      return;
    }
    const x = Math.trunc(player.sprite.x / 40) * 40 + 20;
    const y = Math.trunc(player.sprite.y / 40) * 40 + 30;
    this.socket.emit('putBomb', { x: x, y: y });
  }

  createBomb(player, position) {
    const bomb = this.physics.add.sprite(position.x, position.y, 'bomb');
    player.bombsNo++;
    bomb.displayWidth = 30;
    bomb.displayHeight = 30;
    bomb.scrollFactor = 0;
    bomb.body.moves = false;
    this.bombsGroup.add(bomb);
    this.anims.create({
      key: 'bomb',
      frames: this.anims.generateFrameNumbers('bomb', { frames: [0, 1, 2] }),
      frameRate: 2,
      repeat: -1,
    });
    bomb.anims.play('bomb', true);

    this.physics.add.overlap(bomb, this.explosionGroup, () => this.expoitBomb(bomb, player), null, this);

    setTimeout(() => {
      this.expoitBomb(bomb, player);
    }, 2500);
  }

  expoitBomb(bomb, player) {
    if (bomb.body.enable) {
      bomb.disableBody(true, true);
      this.bombsGroup.kill(bomb);
      this.createExposion(bomb, player);
    }
  }

  createExposion(bomb, player) {
    const x = bomb.x;
    const y = bomb.y;
    const center = this.physics.add.sprite(x, y, 'explosion-center');
    this.explosionGroup.add(center);
    center.displayHeight = 40;
    center.displayWidth = 40;
    this.anims.create({
      key: 'e-center',
      frames: this.anims.generateFrameNumbers('explosion-center', { frames: [0, 1, 2, 3] }),
      frameRate: 8,
    });
    center.anims.play('e-center', true)

    for (let i = 1; i <= player.explosion; i++) {
      if (i === player.explosion) {
        if (this.verifyNotBlock(x - 60 - 40 * (i - 1), y - 30)) {
          const left = this.physics.add.sprite(x + 10 - 40 * i, y, 'explosion-left-end');
          this.explosionGroup.add(left);
          left.displayHeight = 40;
          left.displayWidth = 40;
          this.anims.create({
            key: 'e-left',
            frames: this.anims.generateFrameNumbers('explosion-left-end', { frames: [0, 1, 2, 3] }),
            frameRate: 8,
          });
          left.anims.play('e-left', true)
        } else {
          break;
        }
      } else {
        if (this.verifyNotBlock(x - 60 - 40 * (i - 1), y - 30)) {
          const left = this.physics.add.sprite(x - 40 * i, y, 'explosion-extension-horizontal');
          this.explosionGroup.add(left);
          left.displayHeight = 40;
          left.displayWidth = 60;
          this.anims.create({
            key: 'ext-left',
            frames: this.anims.generateFrameNumbers('explosion-extension-horizontal', { frames: [0, 1, 2, 3] }),
            frameRate: 8,
          });
          left.anims.play('ext-left', true)
        } else {
          break;
        }
      }
    }
    for (let i = 1; i <= player.explosion; i++) {
      if (i === player.explosion) {
        if (this.verifyNotBlock(x + 20 + 40 * (i - 1), y - 30)) {
          const right = this.physics.add.sprite(x - 10 + 40 * i, y, 'explosion-right-end');
          this.explosionGroup.add(right);
          right.displayHeight = 40;
          right.displayWidth = 40;
          this.anims.create({
            key: 'e-right',
            frames: this.anims.generateFrameNumbers('explosion-right-end', { frames: [0, 1, 2, 3] }),
            frameRate: 8,
          });
          right.anims.play('e-right', true)
        } else {
          break;
        }
      } else {
        if (this.verifyNotBlock(x + 20 + 40 * (i - 1), y - 30)) {
          const left = this.physics.add.sprite(x + 40 * i, y, 'explosion-extension-horizontal');
          this.explosionGroup.add(left);
          left.displayHeight = 40;
          left.displayWidth = 60;
          this.anims.create({
            key: 'ext-left',
            frames: this.anims.generateFrameNumbers('explosion-extension-horizontal', { frames: [0, 1, 2, 3] }),
            frameRate: 8,
          });
          left.anims.play('ext-left', true)
        } else {
          break;
        }
      }
    }

    for (let i = 1; i <= player.explosion; i++) {
      if (i === player.explosion) {
        if (this.verifyNotBlock(x - 20, y - 40 * i)) {
          const up = this.physics.add.sprite(x, y + 10 - 40 * i, 'explosion-up-end');
          this.explosionGroup.add(up);
          up.displayHeight = 40;
          up.displayWidth = 40;
          this.anims.create({
            key: 'e-up',
            frames: this.anims.generateFrameNumbers('explosion-up-end', { frames: [0, 1, 2, 3] }),
            frameRate: 8,
          });
          up.anims.play('e-up', true)
        } else {
          break;
        }
      } else {
        if (this.verifyNotBlock(x - 20, y - 40 * i)) {
          const up = this.physics.add.sprite(x, y - 40 * i, 'explosion-extension-vertical');
          this.explosionGroup.add(up);
          up.displayHeight = 60;
          up.displayWidth = 40;
          this.anims.create({
            key: 'ext-up',
            frames: this.anims.generateFrameNumbers('explosion-extension-vertical', { frames: [0, 1, 2, 3] }),
            frameRate: 8,
          });
          up.anims.play('ext-up', true)
        } else {
          break;
        }
      }
    }

    for (let i = 1; i <= player.explosion; i++) {
      if (i === player.explosion) {
        if (this.verifyNotBlock(x - 20, y + 10 + 40 * (i - 1))) {
          const down = this.physics.add.sprite(x, y - 10 + 40 * i, 'explosion-down-end');
          this.explosionGroup.add(down);
          down.displayHeight = 40;
          down.displayWidth = 40;
          this.anims.create({
            key: 'e-down',
            frames: this.anims.generateFrameNumbers('explosion-down-end', { frames: [0, 1, 2, 3] }),
            frameRate: 8,
          });
          down.anims.play('e-down', true)
        } else {
          break;
        }
      } else {
        if (this.verifyNotBlock(x - 20, y + 40 * i)) {
          const up = this.physics.add.sprite(x, y + 40 * i, 'explosion-extension-vertical');
          this.explosionGroup.add(up);
          up.displayHeight = 60;
          up.displayWidth = 40;
          this.anims.create({
            key: 'ext-up',
            frames: this.anims.generateFrameNumbers('explosion-extension-vertical', { frames: [0, 1, 2, 3] }),
            frameRate: 8,
          });
          up.anims.play('ext-up', true)
        } else {
          break;
        }
      }
    }
    setTimeout(() => {
      player.bombsNo--;
      this.explosionGroup.children.each(explosion => {
        explosion.disableBody(true, true);
        this.explosionGroup.kill(explosion);
      })
    }, 800)
  }

  verifyNotBlock(x, y) {
    if (x < 40 || y < 80 || y > 480 || x > 600) {
      return false
    }
    if ((Math.trunc(x / 40) % 2 === 0) && (Math.trunc(y / 40) % 2 === 1)) {
      return false;
    }
    return true;
  }

  removeExplosion(explosion) {
    explosion.disableBody(true, true);
    this.explosionGroup.kill(explosion);
  }

  killPlayer(player) {
    if (player.id === this.id && !player.dead) {
      this.socket.emit('playerDead', player.id);
    }
    player.dead = true;
    player.sprite.anims.play(`dead-${player.id}`, true);

  }

  reloadGame(players) {
    setTimeout(() => {
      Object.keys(self.players).forEach(function (id) {
        self.players[id].sprite.disableBody(true, true);
      });
      this.bricksGroup.children.each(brick => {
        brick.disableBody(true, true);
      });
      this.speedSkillsGroup.children.each(speedSkill => {
        speedSkill.disableBody(true, true);
      });
      this.bombSkillsGroup.children.each(bombSkill => {
        bombSkill.disableBody(true, true);
      });
      this.explosionSkillsGroup.children.each(explosionSkill => {
        explosionSkill.disableBody(true, true);
      });
      this.addExplosionsSkills();
      this.addBombSkills();
      this.addSpeedSkills();
      this.addBrikcs();
      Object.keys(players).forEach(function (id) {
        self.createPlayer(players[id]);
      });
    }, 2000);
  }

  updateverifyNotBlock() {
    this.blackScoreText = this.add.text(`White Player Score: ${this.whiteScore}`);
    this.whiteScoreText = this.add.text(400, 20, `Black Player Score: ${this.blackScore}`);
  }

  paused() {
    console.log('TheGame - paused');
  }

  resumed() {
    console.log('TheGame - resumed');
  }

  gameOver(id) {
    const win = id === this.id ? true : false;
    setTimeout(() => {
      Object.keys(self.players).forEach(function (id) {
        self.players[id].sprite.disableBody(true, true);
      });
      self.players = {};
      self.socket.disconnect()
      this.scene.start("GameOver", win);
    }, 2000);
  }

}
