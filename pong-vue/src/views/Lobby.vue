<template>
  <base-page>
    <template #top>
      <h2>Welcome to the lobby</h2>
    </template>
    <div class="buttons">
      <router-link to="/create-game" tag="button" class="big">Create game</router-link>
      <router-link to="/join-game" tag="button" class="big">Join game</router-link>
    </div>
  </base-page>
</template>

<script>
export default {
}
</script>

<style scoped>
  .lobby {
    padding: 1rem;
    /* text-align: center; */
  }

  .buttons {
    margin-top: 100px;
    display: grid;
    grid-template-columns: auto auto;
    grid-column-gap: calc(var(--space)*4);
    justify-content: center;
  }
</style>
