import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
	  username: localStorage.getItem('username') || null,
	  token: localStorage.getItem('token') || null,
  },
  mutations: {
	  login(state, data){
		  localStorage.setItem('username', data.username);
		  localStorage.setItem('token', data.token);
		  state.username = data.username;
		  state.token = data.token;
	  },
	  logout(state){
		  localStorage.removeItem('username');
		  localStorage.removeItem('token');
		  state.username = null;
		  state.token = null;
	  }
  },
  getters: {},
  actions: {}
})
