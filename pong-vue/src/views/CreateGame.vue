<template>
  <base-page>
    <template #top>
      <div class="top-bar">
        <router-link to="/"><font-awesome-icon icon="angle-left"/> Cancel</router-link>
        <h2>Create a new game</h2>
      </div>
    </template>
    <div class="main">
      <form v-on:submit.prevent="createGame()">
        <label>Player name
          <input type="text" v-model="playerName"/>
        </label>
        <label>Game code
          <input type="text" v-model="gameCode"/>
          <a href="#" v-on:click.prevent="gameCode = suggest()">Suggest</a>
        </label>
        <div class="actions">
          <button type="submit">Create</button>
        </div>
      </form>
    </div>
  </base-page>
</template>

<script lang="ts">
import generateName from 'project-name-generator';
import Vue from 'vue';
import Component from 'vue-class-component';
import api from '@/services/api';

@Component
export default class CreateGame extends Vue {
  playerName: string = localStorage.getItem('playerName') || '';
  gameCode: string = this.suggest();
  submitting = false;

  suggest(): string {
      return generateName().raw.join('_');
  }

  createGame(): void {
    this.submitting = true;
    localStorage.setItem('playerName', this.playerName);
    api.createGame({code: this.gameCode}).then(() => {
      this.$router.push(`/game/${this.gameCode}`);
    })
  }
}
</script>

<style scoped>
.create-game {
  padding: 1rem;
}

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
