<template>
  <base-page no-padding>
    <template #top>
      <div class="game-info">
        <div class="player one">
          <div v-if="player1">{{player1.name}}</div>
          <div v-else>--</div>
        </div>
        <div class="status">
          <div class="quit"><router-link to="/" class="red">Quit game</router-link></div>
          <div v-if="status === 'loading'">Loading...</div>
          <div v-else-if="status === 'error'">
            Failed to load the game <font-awesome-icon icon='frown'/>
          </div>
          <div v-else-if="status === 'waiting-for-player'">
            Waiting for another player...
          </div>
          <div v-else-if="status === 'ready-to-start'">
            <div v-if="playerNumber === 1"><button class="mt1" v-on:click="startGame()">Start</button></div>
            <div v-else>Waiting for player 1 to start the game...</div>
          </div>
          <div v-else>
            <div class="score">
              <div>{{score[0]}}</div>
              <div>&mdash;</div>
              <div>{{score[1]}}</div>
            </div>
          </div>
        </div>
        <div class="player two">
          <div v-if="player2">{{player2.name}}</div>
          <div v-else>--</div>
        </div>
      </div>
    </template>
    <div v-if="showInstructions" class="instructions">
      <div class="join-message" v-if="!(player1 && player2)">
        <p class="label">Join with code</p>
        <p>{{code}}</p>
      </div>
      <div class="controls">
        <p class="label">Controls</p>
        <div><span class="key">wheel</span> : <span class="key-map"> up/down</span></div>
        <div><span class="key">j</span> : <span class="key-map"> down</span></div>
        <div><span class="key">k</span> : <span class="key-map"> up</span></div>
        <div><span class="key">G</span> : <span class="key-map"> bottom</span></div>
        <div><span class="key">gg</span> : <span class="key-map"> top</span></div>
      </div>
    </div>
    <canvas id="game-canvas" v-bind:width="canvasWidth" v-bind:height="canvasHeight"></canvas>
  </base-page>
</template>


<script lang="ts">

import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import GameEngine, {GameType} from '@/services/GameEngine';

@Component
export default class Game extends Vue {
  code = '';
  playerNumber = 0;
  player1 = null;
  player2 = null;
  status = 'loading';
  gameEngine?: GameEngine;
  canvasHeight = 594;
  canvasWidth = 1000;
  ws?: WebSocket;
  score: [number, number] = [0,0];

  get showInstructions() {
    return this.status === 'waiting-for-player' || this.status === 'ready-to-start';
  }

  destroyed() {
    console.log('component is destroyed')
    if (this.ws) {
      console.log('closing the web socket');
      this.ws.close();
    }
    if (this.gameEngine) {
      console.log('stopping the game listeners');
      this.gameEngine.stop();
    }
  }

  created() {
    this.code = this.$route.params.code;

    const myName = localStorage.getItem('playerName') || 'anonymous';

    //TODO eventually I think the game engine should deal with the web socket
    const websocket = new WebSocket(`ws://localhost:4000/live/game/${this.code}`);
    this.ws = websocket;
    websocket.onopen = () => {
      websocket.send(JSON.stringify({type: 'register', playerName: myName}))
    };
    websocket.onclose = () => {
      console.log('closed!!!!');
    };

    websocket.onerror = (err) => {
      console.log(err);
    }

    websocket.onmessage = (evt) => {
      const message = JSON.parse(evt.data);
      // console.log('message', message);
      if (message.error) {
        console.log(message);
        this.status = 'error';
        return;
      }

      if (message.type === 'registration-confirmed') {
        console.log('registration confirmation', message);
        this.playerNumber = message.playerNumber;
        this.setupGame(message.game);
      }

      if (message.type === 'game-update') {
        this.status = message.game.status;
        this.score = message.game.score;
        if (message.game.player1) {
          this.player1 = message.game.player1;
        }
        if (message.game.player2) {
          this.player2 = message.game.player2;
        }
        this.gameEngine!.updateGame(message.game);
      }
    }
  }

  setupGame(game: any) {
    const canvas = document.getElementById('game-canvas')! as HTMLCanvasElement;
    this.gameEngine = new GameEngine(canvas, game as GameType, this.playerNumber, this.handleGameCanvasChange);
  }

  handleGameCanvasChange(evt) {
    this.score = evt.score;
    if (this.ws) {
      this.ws.send(JSON.stringify({type: 'game-update', ...evt}));
    }
  }

  startGame() {
    if (this.ws) {
      this.ws.send(JSON.stringify({type: 'game-status', status: 'ready-to-start-point', playerNumberToStart: this.playerNumber}));
    }
  }
}
</script>


<style scoped>
  .game-info {
    padding: 1rem;
    height: 70px;
    display: grid;
    grid-template-columns: .25fr .5fr .25fr;
  }

  .player {
    font-size: 2rem;
    align-self: center;
  }

  .player.one {
    justify-self: start;
  }

  .player.two {
    justify-self: end;
  }

  .status {
    justify-self: center;
    text-align: center;
    color: var(--color-orange);
  }

  .quit {
    margin-bottom: var(--space);
  }

  .quit a {
    color: var(--color-red);
  }

  .code a {
    margin-right: var(--space);
  }

  .instructions{
    width: 1000px;
    position: absolute;
    top: 100;
    margin-top: 4rem;
    color: var(--color-gray-light);
    text-align: center;
    font-size: 2rem;
  }

  .instructions .label {
    color: var(--color-gray);
  }

  .instructions p {
    margin: 0;
  }

  .join-message {
    margin-bottom: 2rem;
  }

  .controls .key {
    width: 84px;
    display: inline-block;
    text-align: right;
  }

  .controls .key-map {
    display: inline-block;
    width: 125px;
    text-align: left;
  }

  canvas {
    background: black;
  }

  .score {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-column-gap: 10px;
    font-size: 31px;
  }

</style>
