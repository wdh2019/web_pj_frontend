<template>
  <div class="container">
    <div id="header">
    	<div class="userInfo"><i class="el-icon-user"></i> <span>管理员</span></div>
    	<div class="logout"><el-button class="solid_button" @click="logout">登出</el-button></div>
    </div>
    <div id="main">
      <div class="menuContainer">
        <div class="box">
          <h2>01</h2>
          <h3>所有用户</h3>
          <p>点击查看所有用户的基本信息</p>
        </div>
        <div class="box">
          <h2>02</h2>
          <h3>用户信息统计</h3>
          <p>点击查看所有用户的信息统计图</p>
        </div>
        <div class="box">
          <h2>03</h2>
          <h3>对局信息</h3>
          <p>点击查看所有对局的基本信息</p>
        </div>
      </div>
      <div class=""></div>
      <div class=""></div>
      <div class=""></div>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'infomation',
    data () {
      return {
        users:[
          { username:'wangdonghui1', age:18, gender:'男' },
          { username:'wangdonghui2', age:15, gender:'女' },
          { username:'wangdonghui3', age:27, gender:'女' },
          { username:'wangdonghui4', age:20, gender:'男' },
          { username:'wangdonghui5', age:40, gender:'男' },
          { username:'wangdonghui6', age:32, gender:'女' },
          { username:'wangdonghui7', age:10, gender:'男' },
          { username:'wangdonghui8', age:50, gender:'女' },
          { username:'wangdonghui0', age:12, gender:'女' },
          { username:'wangdonghui9', age:16, gender:'男' },
          { username:'wangdonghui12', age:17, gender:'女' },
          { username:'wangdonghui13', age:15, gender:'男' },
        ],
      }
    },
    methods:{
      logout(){
      	//关闭连接
      	this.$socket.close();
        //调用vuex mutations中logout方法
        this.$store.commit('logout');
        //重定向到登录界面
        this.$router.push('/login');
      }
    }
  }
</script>

<style scoped>
  * {
    margin: 0;
    font-family: "microsoft yahei","microsoft sans serif",'Avenir', Helvetica, Arial, sans-serif;
  }

  .container{
  	width: 100vw;
  	height: 100vh;
  }

  .container>div,h3 {
    margin: 0;
  }

  #header{
  	background-color: rgba(0,0,0,0.8);
  	color: white;
  	text-align: center;
    width: 100vw;
    height: 5vh;
    position: relative;
  }

  #header>div{
  	line-height: 3.125rem;
    display: inline-block;
  }

  #header .userInfo {
    position: absolute;
    right: 200px;
  }

  #header .logout{
    position: absolute;
    right: 10px;;
  }

  #main {
    box-sizing: border-box;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .menuContainer {
    width: 80%;
    padding-top: 30vh;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .menuContainer .box {
    position: relative;
    width: 300px;
    background-color: rgba(150,150,150,0.5);
    box-shadow: 0 15px 45px rgba(0,0,0,0.2);
    border-radius: 10px;
    border-top: rgba(0,0,0,0.5) 1px solid;
    border-left: rgba(0,0,0,0.5) 1px solid;
    margin: 20px 10px;
    padding: 120px 40px;
    line-height: 2;
    text-align: left;
    cursor: pointer;
  }

  /* hover时颜色 */
  .menuContainer .box:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #ff226d;
    border-radius: 10px;
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.3s;
  }

  .menuContainer .box:nth-of-type(2):before{
    background-color: #ffea02;
  }

  .menuContainer .box:nth-of-type(3):before {
    background-color: #3A8EE6;
  }
  /* menu hover动画 */
  .menuContainer .box:hover:before {
    border-radius: 10px;
    transform: scaleY(1);
    transform-origin: bottom;
    transition: transform 0.3s;
  }

  .menuContainer .box:hover:before .box {
    border-radius: 10px;
    border-top: rgba(255,255,0,0.5) 1px solid;
    border-left: rgba(255,255,0,0.5) 1px solid;
  }

  /* h2标题动画*/
  .menuContainer .box h2 {
    position: absolute;
    left: 40px;
    top: 35px;
    font-size: 4em;
    font-weight: 800;
    z-index: 1;
    opacity: 0.4;
    transition: 0.5s;
  }

  .menuContainer .box:hover h2 {
    opacity: 1;
    color: #fff;
    transform: translateY(-50px);
  }

  /* h3标题样式 */
  .menuContainer .box h3 {
    position: relative;
    font-size: 1.5em;
    z-index: 2;
    color: #333;
    transition: 0.5s;
  }

  .menuContainer .box:hover h3 {
    color: #fff;
    transform: translate(90px, -80px);
  }

  /* p文字样式*/
  .menuContainer .box p{
    position: relative;
    z-index: 2;
    color: #555;
    transition: 0.5s;
  }

  .menuContainer .box:hover p {
    color: #fff;
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
