<template>
  <div class="container">
    <div id="header">
      <div class="userInfo">
        <i class="el-icon-user"></i> <span>用户{{ username }}</span>
      </div>
      <div class="logout">
        <el-button class="solid_button" @click="logout">登出</el-button>
      </div>
    </div>
    <div id="main">
      <chat-room :chatData="chatData" :socket="socket"></chat-room>
      <hanoi :socket="socket" ref="hanoi"></hanoi>
    </div>
  </div>
</template>
<script>
import * as Three from "three";
import chatRoom from "./ChatRoom.vue";
import hanoi from "./Hanoi.vue";

export default {
  name: "home",
  components: { chatRoom, hanoi },
  data() {
    return {
      // 用户名
      username: null,
      // socket对象，传入聊天室子组件, 和汉诺塔界面子组件
      socket: null,
      // 聊天数据对象，传入聊天室子组件
      chatData: {},
      //判断是否可以操作角色，用于输入聊天还是操作游戏的切换
      controlLock: false,
    };
  },
  methods: {
    // init() {
    // 	let container = document.getElementById('main')
    // 	this.camera = new Three.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.01, 10)
    // 	this.camera.position.z = 0.6
    // 	this.scene = new Three.Scene()
    // 	let geometry = new Three.BoxGeometry(0.2, 0.2, 0.2)
    // 	let material = new Three.MeshNormalMaterial()
    // 	this.mesh = new Three.Mesh(geometry, material)
    // 	this.scene.add(this.mesh)

    // 	this.renderer = new Three.WebGLRenderer({ antialias: true })
    // 	this.renderer.setSize(container.clientWidth, container.clientHeight)
    // 	container.appendChild(this.renderer.domElement)
    // 	},
    // animate() {
    // 	requestAnimationFrame(this.animate)
    // 	this.mesh.rotation.x += 0.01
    // 	this.mesh.rotation.y += 0.02
    // 	this.renderer.render(this.scene, this.camera)
    // },
    // //窗口改变大小时触发
    // onWindowResize(){
    // 	if(this.camera!=null){
    // 		let container = document.getElementById('main');
    // 		this.camera.aspect = container.clientWidth / container.clientHeight;
    // 		this.camera.updateProjectionMatrix();
    // 		this.renderer.setSize(container.clientWidth, container.clientHeight);
    // 	}
    // },
    logout() {
      //关闭连接
      this.$socket.close();
      this.$refs.hanoi.handleLeave();
      this.sockets.unsubscribe("connect");
      this.sockets.unsubscribe("disconnect");
      this.sockets.unsubscribe("connected");
      this.sockets.unsubscribe("disconnected");
      this.sockets.unsubscribe("movePosition");
      this.sockets.unsubscribe("usersPosition");
      this.sockets.unsubscribe("logout");
      this.sockets.unsubscribe("moveDisk");
      this.sockets.unsubscribe("updateChat");
      this.sockets.unsubscribe("chessPosition");
      //调用vuex mutations中logout方法
      this.$store.commit("logout");
      //重定向到登录界面
      this.$router.push("/login");
    },
  },
  mounted() {
    //打开vue-socket.io
    // 第一次登录时连接socket，后续刷新不连接
    this.$socket.open();
    console.log("open");

    //第一次打开进入，发送参加
    this.$socket.emit("joinIn", {
      userId: this.$store.state.userId,
      username: this.$store.state.username,
      messageType: "JoinIn",
      message: "0,30,-500",
    });

    //socket传入子组件chatRoom
    this.socket = this.$socket;
    console.log(this.$socket);

    this.username = this.$store.state.username;
    var _this = this;
    //刷新页面则重定向到登录页面
    window.addEventListener("beforeunload", (e) => {
      _this.logout();
    });

    //socket订阅事件
    this.sockets.subscribe("connect", () => {
      console.log("Socket连接成功");
    });
    this.sockets.subscribe("disconnect", () => {
      console.log("Socket断开连接");
    });
    this.sockets.subscribe("connected", (data) => {
      console.log("接收到connected事件");
      if (data.message === "success") {
        // _this.init();
        // _this.animate();
      } else {
        console.log("未接收到connected事件");
      }
    });
    this.sockets.subscribe("disconnected", (data) => {
      console.log("接收到disconnected事件");
    });

    //订阅别人的移动信息
    this.sockets.subscribe("movePosition", (data) => {
      console.log("接收到位置信息的更新");
      data = JSON.parse(data);
      let newPosition = data.message.split(",");
      newPosition.forEach((element) => {
        element = parseInt(element);
      });

      this.$refs.hanoi.handleMovePosition(data.userId, newPosition);
    });

    //向新建立的链接发送已经链接的人的信息，每次发一个
    this.sockets.subscribe("usersPosition", (data) => {
      console.log("接收到已有位置信息的更新");
      console.log(data);
      data = JSON.parse(data);
      let newPosition = data.message.split(",");
      newPosition.forEach((element) => {
        element = parseInt(element);
      });

      this.$refs.hanoi.handleUsersPosition(
        data.userId,
        data.username,
        newPosition
      );
    });

    this.sockets.subscribe("logout", (data) => {
      data = JSON.parse(data);
      this.$refs.hanoi.handlelLogout(data.userId);
    });

    this.sockets.subscribe("moveDisk", (data) => {
      data = JSON.parse(data);
      let newPosition = data.position.split(",");
      newPosition.forEach((element) => {
        element = parseInt(element);
      });
      this.$refs.hanoi.handleMoveDisk(data.id, newPosition, data.location);
    });

    this.sockets.subscribe("chessPosition", (data) => {
      data = JSON.parse(data);
      let newPosition = data.position.split(",");
      newPosition.forEach((element) => {
        element = parseInt(element);
      });
      this.$refs.hanoi.handleMoveDisk(data.id, newPosition, data.location);
    });

    //订阅聊天室事件
    this.sockets.subscribe("updateChat", (data) => {
      console.log("接收到聊天事件updateChat");
      this.chatData = JSON.parse(data);
      console.log(this.chatData);
      this.$refs.hanoi.handleJoinIn(
        this.chatData.userId,
        this.chatData.username
      );
      console.log("在父组件home中，聊天数据是", this.chatData);
    });
  },
  beforeDestroy() {
    this.$socket.close();
    this.sockets.unsubscribe("connect");
    this.sockets.unsubscribe("disconnect");
    this.sockets.unsubscribe("connected");
    this.sockets.unsubscribe("disconnected");
    this.sockets.unsubscribe("movePosition");
    this.sockets.unsubscribe("usersPosition");
    this.sockets.unsubscribe("logout");
    this.sockets.unsubscribe("moveDisk");
    this.sockets.unsubscribe("updateChat");
    this.sockets.unsubscribe("chessPosition");
  },
};
</script>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
}
.container > div,
h3 {
  margin: 0;
}
#header {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  width: 100vw;
  height: 5vh;
  position: relative;
}
#header > div {
  line-height: 3.125rem;
  display: inline-block;
}
#header .userInfo {
  position: absolute;
  right: 200px;
}
#header .logout {
  position: absolute;
  right: 10px;
}
#main {
  width: 100vw;
  height: 95vh;
}
/* 按钮样式 */
.el-button.solid_button {
  position: relative;
  background: linear-gradient(90deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4);
  background-size: 400%;
  border-radius: 15px;
  border: none;
  color: rgb(255, 255, 255);
  z-index: 1;
}
.el-button.solid_button::before {
  content: "";
  position: absolute;
  left: -5px;
  right: -5px;
  top: -5px;
  bottom: -5px;
  background: linear-gradient(90deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4);
  background-size: 400%;
  border-radius: 15px;
  filter: blur(8px);
  z-index: -1;
}
.el-button.solid_button:hover::before {
  animation: sun 8s infinite;
}
.el-button.solid_button:hover {
  animation: sun 8s infinite;
}
@keyframes sun {
  100% {
    background-position: -400% 0;
  }
}
</style>
