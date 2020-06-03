const Util = require('./Util');

const typeMap = {
    register: handleRegister,
    'game-update': handleGameUpdate,
    'game-status': handleGameStatus
}

function handleGameStatus(msg, game) {
    game.status = msg.status;
}

function handleRegister(msg, game, gs, ws) {
    let playerNumber = undefined;
    if (!game.player1) {
        playerNumber = 1;
        game.player1 = { name: msg.playerName, defending: true };
    } else if (!game.player2) {
        playerNumber = 2;
        game.player2 = { name: msg.playerName, defending: false };
    } else {
        console.warn('everyone is already registered');
        return;
    }

    gs.playerName = msg.playerName;
    gs.playerNumber = playerNumber;

    if (game.player1 && game.player2 && game.status === 'waiting-for-player') {
        game.status = 'ready-to-start';
    }

    Util.sendWsJson(ws, { type: 'registration-confirmed', playerNumber, game });

    setupGameInterval(ws, game);
}

function setupGameInterval(ws, game) {
    ws.intervalHandle = setInterval(() => {
        Util.sendWsJson(ws, {type: 'game-update', game})
    }, 100);
}

function handleGameUpdate(msg, game, gs) {
    //TODO clean this up
    console.log('game update msg', msg);
    let player = null;
    let opponent = null;
    if (gs.playerNumber === 1) {
        player = game.player1;
        opponent = game.player2;
    } else {
        player = game.player2;
        opponent = game.player1;
    }
    player.position = msg.player.position;

    if (msg.playerPosessionChange) {
        player.defending = msg.player.defending;
        opponent.defending = !msg.player.defending;
    }

    if (msg.defendingPlayerNumber) {
        game.defendingPlayerNumber = msg.defendingPlayerNumber;
    }
    
    if (msg.puckPosition) {
        game.puck = msg.puckPosition;
    }

    if (msg.status) {
        game.status = msg.status;
    }

    if (msg.score) {
        game.score = msg.score;
    }
    console.log('game after update', game);
}

module.exports = function handle(code, ws, msg, games, gameSessions) {
    msg = JSON.parse(msg);

    const sessions = gameSessions[code];
    const game = games[code];
    handler = typeMap[msg.type]
    if (!game || !sessions || !handler) return;

    const gs = sessions.find(gs => gs.ws === ws);
    if (!gs) return;

    typeMap[msg.type](msg, game, gs, ws);
}