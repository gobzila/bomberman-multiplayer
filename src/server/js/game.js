var players = {};
var playersCount = 0;
var blackScore = 0;
var whiteScore = 0;


const config = {
  type: Phaser.HEADLESS,
  autoFocus: false,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

function preload() { }

function create() {
  io.on('connection', function (socket) {
    socket.on('disconnect', function () {
      if (players[socket.id]) {
        console.log('player disconnected: ', socket.id)
        delete players[socket.id];
        playersCount--;
        console.log('players number: ',playersCount)
        socket.broadcast.emit('playerDisconnect', socket.id);
      }
    });
    socket.on('init', function () {
      // Object.keys(playerss).forEach(function (id) {
      //   if (playerss[id] === players[socket.id]) {
      //     player = playerss[id];
      //   }
      // });
      if (playersCount >= 2) {
        return;
      }
      playersCount++;
      console.log('players number: ',playersCount)
      socket.emit('id', socket.id);
      players[socket.id] = {
        id: socket.id,
        color: playersCount === 2 ? 'black' : 'white',
        score: 0,
      };
      console.log('player connected: ', socket.id)
      socket.broadcast.emit('players', players);
      socket.emit('players', players);
    });
    socket.on('playerInput', function (inputData) {
      // update all
      socket.broadcast.emit('playerInput', { id: socket.id, inputData: inputData });
      // send
      socket.emit('playerInput', { id: socket.id, inputData: inputData });
    });
    socket.on('playerMove', function (position) {
      // update all
      socket.broadcast.emit('playerMove', { id: socket.id, position: position });
    });
    socket.on('putBomb', function (position) {
      // update all
      socket.broadcast.emit('createBomb', { id: socket.id, position: position });
      // send
      socket.emit('createBomb', { id: socket.id, position: position });
    });
    socket.on('playerDead', function (playerId) {
      let player = {};
      Object.keys(players).forEach(function (id) {
        if (playerId !== id) {
          players[id].score++;
          player = players[id];
        }
      });
      if (player.score === 3) {
        socket.broadcast.emit('gameOver', player.id);
        socket.emit('gameOver', player.id);
      } else {
        socket.broadcast.emit('reloadGame', players);
        socket.emit('reloadGame', players);
      }
    });
  });
}

function update() { }

function addPlayer(self, playerInfo) {
  console.log('user connected');
  const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  player.setDrag(100);
  player.setAngularDrag(100);
  player.setMaxVelocity(200);
  player.playerId = playerInfo.playerId;
  self.players.add(player);
}

function removePlayer(self, playerId) {
  console.log('user disconnected')
  self.players.getChildren().forEach((player) => {
    if (playerId === player.playerId) {
      player.destroy();
    }
  });
}

const game = new Phaser.Game(config);

window.gameLoaded();
