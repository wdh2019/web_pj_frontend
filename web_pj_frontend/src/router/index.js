import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
	{
	  	path: '/',
	  	redirect: '/login'
	},
	{
		path: '/login',
		name: 'login',
		component: () => import('@/components/Login')
	},
	{
		path: '/register',
		name: 'register',
		component: () => import('@/components/Login')
	},
	{
		path: '/home',
		name: 'home',
		component: () => import('@/components/Home')
	},
  ]
})
