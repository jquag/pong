import Vue from 'vue'
import App from './App.vue'
import router from './router'
import PongHeader from './components/Header.vue'
import BasePage from './views/BasePage.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSquare, faCaretLeft, faAngleLeft, faTimes, faFrown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

Vue.config.productionTip = false;

library.add(faSquare, faCaretLeft, faAngleLeft, faTimes, faFrown);

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('pong-header', PongHeader);
Vue.component('base-page', BasePage)

new Vue({
  router,
  render: h => h(App),
  components: {
    PongHeader
  }
}).$mount('#app')
