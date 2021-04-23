import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
	  username: sessionStorage.getItem('username') || null,
	  hasSocket: sessionStorage.getItem('hasSocket') || null,
	  socket: null,
  },
  mutations: {
	  login(state, data){
		  sessionStorage.setItem('username', data.username);
		  state.username = data.username;
		  state.token = data.token;
	  },
	  logout(state){
		  sessionStorage.removeItem('username');
		  state.username = null;
		  state.token = null;
	  },
	  setSocket(state, socket){
		  sessionStorage.setItem('hasSocket',true);
		  state.socket = socket;
	  },
	  removeSocket(state){
		  sessionStorage.removeItem('hasSocket');
		  state.socket = null;
	  }
  },
  getters: {},
  actions: {}
})
