<template>
  <div id="app">
    <pong-header/>
    <div v-if="error">{{error}}</div>
    <div v-else-if="loading">Loading...</div>
    <div v-else class="content">
      <router-view/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import config from './services/config';

@Component
export default class HelloWorld extends Vue {
  loading = true;
  error = '';

  created() {
    config.load().then(success => {
      if (success) {
        this.loading = false;
        console.log('config loaded', config.apiRoot);
      } else {
        throw new Error('failed to load config');
      }
    }).catch(err => {
      this.loading = false;
      this.error = 'Failed to load the application';
    });
  }
}
</script>

<style>

body {
  --color-gray-light: #929692;
  --color-gray: #5c615c;
  --color-gray-dark: #333533;
  --color-text: #fbefef;
  --color-yellow: #fcfe7c;
  --color-yellow-dark: #b8ba36;
  --color-green: #98fa80;
  --color-orange: #feb952;
  --color-red: #fe6d6d;

  --space: 5px;

  overscroll-behavior: none;
  scroll-behavior: smooth;
}

h1, h2, h3, h4, h5 {
  margin: 0;
}

button {
  border: none;
  border-radius: 3px;
  padding: var(--space) calc(var(--space)*2);
  background: var(--color-green);
  color: var(--color-gray-dark);
  font-size: 1rem;
  cursor: pointer;
}

button.big {
  font-size: 2rem;
  padding: calc(var(--space)*3) calc(var(--space)*4);
}

a {
  color: var(--color-green);
  text-decoration: none;
  border-bottom: 1px solid var(--color-green)
}

a.red {
  color: var(--color-red);
  border-color: var(--color-red);
}

form {
  padding: 2rem;
  background: var(--color-gray);
  border-radius: 10px;
}

form button[type="submit"] {
  margin-top: 1rem;
}

input {
  background: var(--color-gray-dark);
  border: 2px solid var(--color-gray-light);
  padding: calc(var(--space)*1);
  border-radius: 3px;
  color: white;
  font-size: 1rem;
}

input:focus {
  border-color: white;
}

label {
  display: block;
  margin-bottom: calc(var(--space)*3);
}

label > input {
  margin: 0 calc(var(--space)*2);
}

.mt1 {
  margin-top: var(--space);
}
.mr1 {
  margin-right: var(--space);
}

.mx1 {
  margin-right: var(--space);
  margin-left: var(--space);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 1000px;
  height: 700px;
  margin: auto;
}

#app .content {
  background: var(--color-gray-dark);
  color: var(--color-text);
  width: 100%;
  height: 100%;
}

</style>
