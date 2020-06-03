const express = require('express')
const Util = require('./Util');
const gameMessageHandler = require('./GameMessageHandler');

const port = 4000

const app = express()
var expressWs = require('express-ws')(app);

const gameSessions = {};
const games = {};

app.use(express.json());

app.post('/api/game', function(req, res) {
    //TODO validate request
    const game = {code: req.body.code, status: 'waiting-for-player', score: [0,0], defendingPlayerNumber: 1};
    if (games[game.code]) {
        res.status(400).json({message: 'game already exists'});
        return;
    }

    games[game.code] = game;
    gameSessions[game.code] = [];

    res.json({message: "created"});

    //TODO need a job to clean games without players
    setTimeout(() => {
        if (gameSessions[game.code].length === 0) {
            console.log('deleting game because it was never joined: ', game);
            delete games[game.code];
        }
    }, 10000)
});

expressWs.getWss().on('connection', (ws, req) => {
    const gameCode = Util.gameFromUrl(req.url);
    if (!gameCode) {
        ws.send(JSON.stringify({error: 'invalid connection'}));
        ws.close();
        return;
    }

    let game = games[gameCode];
    if (!game) {
        ws.send(JSON.stringify({error: 'invalid game'}));
        ws.close();
        return;
    }

    const sessions = gameSessions[gameCode];
    if (sessions.length === 2) {
        ws.send(JSON.stringify({error: 'game full'}));
        ws.close();
        return;
    }

    sessions.push({gameCode, ws})
});

expressWs.getWss().on('close', (ws, req) => {
    console.log('connection closed');
});

app.ws('/live/game/:name', function(ws, req) {
    console.log(`connection to ${req.params.name}`);
    const code = req.params.name;
    ws.on('open', function() {
        console.log('opened!!', msg)
    });
    ws.on('message', function(msg) {
        gameMessageHandler(code, ws, msg, games, gameSessions);
    });
    ws.on('close', function(msg) {
        console.log('closed!!', msg)
        const gs = gameSessions[code];
        if (gameSessions[code]) {
            gameSessions[code].filter(gs => gs.ws !== ws);
            clearInterval(gs.intervalHandle);
        }
    });
  });
  
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
