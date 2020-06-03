<template>
  <base-page>
    <template #top>
      <div class="top-bar">
        <router-link to="/"><font-awesome-icon icon="angle-left"/> Cancel</router-link>
        <h2>Join a game</h2>
      </div>
    </template>
    <div class="main">
      <form v-on:submit.prevent="joinGame()">
        <label>Player name
          <input type="text" v-model="playerName"/>
        </label>
        <label>Game code
          <input type="text" v-model="gameCode"/>
        </label>
        <div class="actions">
          <button type="submit">Join</button>
        </div>
      </form>
    </div>
  </base-page>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import api from '@/services/api';

@Component
export default class JoinGame extends Vue {
  playerName: string = localStorage.getItem('playerName') || '';
  submitting = false;
  gameCode = '';

  joinGame(): void {
    this.submitting = true;
    localStorage.setItem('playerName', this.playerName);
    //TODO: check if the game is joinable first
    this.$router.push(`/game/${this.gameCode}`);
  }
}
</script>

<style scoped>
.top-bar {
  display: grid;
  grid-template-columns: auto auto;
  grid-column-gap: calc(var(--space)*3);
  justify-content: start;
  align-items: center;
}

.main {
  margin: auto;
  width: 500px;
}

form {
  margin-top: 4rem;
}

</style>
