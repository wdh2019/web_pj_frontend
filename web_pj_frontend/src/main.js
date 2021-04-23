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
//axios 配置
// Axios挂载到Vue原型，全局可以使用this.$axios访问
Vue.prototype.$axios = axios
axios.defaults.baseURL = 'http://localhost:8080/api'
axios.defaults.withCredentials = true
axios.defaults.headers.post['Content-Type'] = "application/json;charset=UTF-8"
//将SocketIO挂载到Vue原型
Vue.prototype.$io = SocketIO

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
