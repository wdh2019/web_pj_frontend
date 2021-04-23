<template>
	<div class="out">
		<el-row id="header">
			<span>欢迎{{username}}</span>
			<el-button type="primary" @click="logout">登出</el-button>
		</el-row>
		<div id="container"></div>
	</div>
</template>
<script>
import * as Three from 'three'
import store from '../store'
const socket = store.state.socket;

export default {
  name: 'home',
  data () {
    return {
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
	  username: null,
	  
    }
  },
  methods: {
    init() {
      let container = document.getElementById('container')
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
		socket.close();
		//清除socket变量
		this.$store.commit('removeSocket');
		//调用vuex mutations中logout方法
		this.$store.commit('logout');
		//重定向到登录界面
		this.$router.push('/');
	}
  },
  mounted () {
    this.init()
    this.animate()
  }
}
</script>

<style scoped>
.out{
	width: 100%;
	height: 100%;
	text-align: right;
	color: white;
}
#header{
	background-color: rgba(0,0,0,0.8);
}
#container {
	width: 100%;
    height: 100%;
}
</style>