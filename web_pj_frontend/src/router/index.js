import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'

Vue.use(Router)

//解决路由跳转相同地址时报错
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
};

export const router = new Router({
  routes: [
	{
	  	path: '/',
	  	redirect: '/login',
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
		component: () => import('@/components/Home'),
		meta: {
		  requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
		},
	},
  ]
})

// 前端登录拦截
router.beforeEach(function (to, from, next) {
	if (to.matched.some(record => record.meta.requireAuth)) {
		if (store.state.username) {
			next();
		}
		else {
			next({
			path: '/login',
			// query: {redirect: to.fullPath} // 登录成功之后重新跳转到该路由
			});
		}
	}
	else {
		next()
	}
	
	if (to.fullPath === "/" || to.fullPath === "/login") {
		if (sessionStorage.getItem('username')) {
			next({
			path: from.fullPath
			});
		} 
		else {
			next();
		}
	}

});

