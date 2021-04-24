<template>
	<div class="container">
		<el-row id="header">
			<span>欢迎{{username}}</span>
			<el-button class="solid_button" @click="logout">登出</el-button>
		</el-row>
		<h3 id="warning" v-if="success===true"></h3>
		<div id="main"></div>
	</div>
</template>
<script>
	import * as Three from 'three'

	export default {
		name: 'home',
		data () {
			return {
			camera: null,
			scene: null,
			renderer: null,
			mesh: null,
			username: null,
			success: false,
		}
		},
	methods: {
		init() {
			let container = document.getElementById('main')
			this.camera = new Three.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.01, 10)
			this.camera.position.z = 0.6
			this.scene = new Three.Scene()
			let geometry = new Three.BoxGeometry(0.2, 0.2, 0.2)
			let material = new Three.MeshNormalMaterial()
			this.mesh = new Three.Mesh(geometry, material)
			this.scene.add(this.mesh)

			this.renderer = new Three.WebGLRenderer({ antialias: true })
			this.renderer.setSize(container.clientWidth, container.clientHeight)
			container.appendChild(this.renderer.domElement)
			},
		animate() {
			requestAnimationFrame(this.animate)
			this.mesh.rotation.x += 0.01
			this.mesh.rotation.y += 0.02
			this.renderer.render(this.scene, this.camera)
		},
		logout(){
			//关闭连接
			this.$socket.close();
			//清除socket变量
			this.$store.commit('removeSocket');
			//调用vuex mutations中logout方法
			this.$store.commit('logout');
			//重定向到登录界面
			this.$router.push('/login');
		}
	},
	mounted(){
		this.username = this.$store.state.username;
		//刷新页面则重定向到登录页面
		window.addEventListener('beforeunload', e => {
			this.logout();
		})
		//打开vue-socket.io
		this.$socket.open()
	},
	sockets:{
		connect: function(){
			console.log('Socket 连接成功');
		},
		disconnect: function(){
			console.log('Socket 断开连接');
		},
		connected: function(data){
			console.log('Socket connected');
			if(data.message === "success"){
				this.success = true;
				this.init();
				this.animate();
			}
			else{
				document.querySelector('#warning').innerHTML = '与服务器连接失败';
			}
		},
		disconnected: function(data){
			console.log(data.message);
		}
	},
	beforeDestroy(){
		this.logout();
	}

}
</script>

<style scoped>
	.container{
		width: 100%;
		height: 100%;
	}
	#header{
		background-color: rgba(0,0,0,0.8);
		color: white;
		text-align: right;
	}
	#warning{
		text-align: center;
	}
	#main {
		width: 100%;
		height: 100%;
	}
	/* 按钮样式 */
	.el-button.solid_button{
		position: relative;
		background: linear-gradient(90deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4);
		background-size: 400%;
		border-radius: 15px;
		border:none;
		color: rgb(255,255,255);
		z-index:1;
	}
	.el-button.solid_button::before{
		content:"";
		position: absolute;
		left:-5px;
		right:-5px;
		top:-5px;
		bottom:-5px;
		background: linear-gradient(90deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4);
		background-size: 400%;
		border-radius: 15px;
		filter: blur(8px);
		z-index:-1;
	}
	.el-button.solid_button:hover::before{
		animation: sun 8s infinite;
	}
	.el-button.solid_button:hover{
		animation: sun 8s infinite;
	}
	@keyframes sun{
		100%{
			background-position:-400% 0;
		}
	}
</style>
