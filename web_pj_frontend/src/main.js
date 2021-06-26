// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
import SocketIO from 'socket.io-client'
import App from './App'
import {router} from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Vuex from 'vuex'
import axios from 'axios'
import store from './store'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(Vuex)
Vue.prototype.$bus = new Vue();// 兄弟组件通信的总线实例
//axios 配置
// Axios挂载到Vue原型，全局可以使用this.$axios访问
Vue.prototype.$axios = axios
axios.defaults.baseURL = '/api'
axios.defaults.withCredentials = true
axios.defaults.headers.post['Content-Type'] = "application/json;charset=UTF-8"

axios.interceptors.response.use(
  response => {
    if (response.data.hasOwnProperty("state")) {
      const stateCode = response.data.state;
      if (stateCode === 401) {
        router.replace('/login')
      }
    }
    return response
  },
)


const options = {
	autoConnect: false,
	transports: ['websocket','xhr-polling','jsonp-polling']
}
Vue.use(
	new VueSocketIO({
		//debug: true,
		//connection: 'http://localhost:8081',
		connection: 'http://118.195.186.183:8081',
		options:options,
	})
)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
