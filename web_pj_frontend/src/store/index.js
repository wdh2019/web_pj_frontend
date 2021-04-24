import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
	  username: sessionStorage.getItem('username') || null,
  },
  mutations: {
	  login(state, data){
		  sessionStorage.setItem('username', data.username);
		  state.username = data.username;
	  },
	  logout(state){
		  sessionStorage.removeItem('username');
		  state.username = null;
	  },
  },
  getters: {},
  actions: {}
})
