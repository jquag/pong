import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Lobby from '../views/Lobby.vue'
import CreateGame from '../views/CreateGame.vue'
import Game from '../views/Game.vue'
import JoinGame from '../views/JoinGame.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Lobby',
    component: Lobby
  },
  {
    path: '/create-game',
    name: 'CreateGame',
    component: CreateGame
  },
  {
    path: '/join-game',
    name: 'JoinGame',
    component: JoinGame
  },
  {
    path: '/game/:code',
    name: 'Game',
    component: Game
  }
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
