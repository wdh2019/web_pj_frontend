<template>
	<div class="container">
		<div class="login form" v-show="name==='login'">
			<el-form id="loginForm" :model="loginForm" :rules="loginRules" ref="loginForm">
				<h3>登录</h3>
				<el-form-item prop="loginUsername">
					<div class="inputContainer">
						<input class="input" type="text" placeholder="请输入用户名" v-model="loginForm.loginUsername">
						<span class="left"></span>
						<span class="right"></span>
						<span class="top"></span>
						<span class="bottom"></span>
					</div>
				</el-form-item>
				<el-form-item prop="loginPassword">
					<div class="inputContainer">
						<input class="input" type="password" placeholder="请输入密码" v-model="loginForm.loginPassword">
						<span class="left"></span>
						<span class="right"></span>
						<span class="top"></span>
						<span class="bottom"></span>
					</div>
				</el-form-item>
				<el-form-item>
					<el-button class="solid_button" @click="login">登录</el-button>
				</el-form-item>
				<el-form-item>
					<el-button class="text_button" type="text"  @click="changeName('register')">未注册？点击此处</el-button>
				</el-form-item>
			</el-form>
		</div>
		<div class="register form" v-show="name==='register'">
			<el-form id="registerForm" :model="registerForm" :rules="registerRules" ref="registerForm">
				<h3>注册</h3>
				<el-form-item prop="registerUsername">
					<div class="inputContainer">
						<input class="input" type="text" placeholder="请输入用户名" v-model="registerForm.registerUsername">
						<span class="left"></span>
						<span class="right"></span>
						<span class="top"></span>
						<span class="bottom"></span>
					</div>
				</el-form-item>
				<el-form-item prop="registerPassword">
					<div class="inputContainer">
						<input class="input" type="password" placeholder="请输入密码" v-model="registerForm.registerPassword">
						<span class="left"></span>
						<span class="right"></span>
						<span class="top"></span>
						<span class="bottom"></span>
					</div>
				</el-form-item>
				<el-form-item>
					<el-button class="solid_button" @click="register">注册</el-button>
				</el-form-item>
				<el-form-item>
					<el-button  class="text_button" type="text" @click="changeName('login')">返回登录界面</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script>
	//import io from 'socket.io-client'
	//const socket = io('http://127.0.0.1:8081');
	var socket;
	export default{
		name:'login',
		data(){
			return{
				loginForm:{
					loginUsername:"",
					loginPassword:""
				},
				loginRules:{
					loginUsername:[
						{required: true, message: '请输入用户名', trigger: 'blur'}
					],
					loginPassword:[
						{required: true, message: '请输入密码', trigger: 'blur'}
					]
				},
				registerForm:{
					registerUsername:"",
					registerPassword:""
				},
				registerRules:{
					registerUsername:[
						{required: true, message: '请输入用户名', trigger: 'blur'}
					],
					registerPassword:[
						{required: true, message: '请输入密码', trigger: 'blur'}
					]
				},
				name:"",
				activeNames: ['1']
			}
		},
		methods:{
			changeName(newName){
				this.name = newName;
				this.$router.push({
					name: this.name,
				})
			},
			login(){
				this.$router.push("/home");
				this.$refs['loginForm'].validate((valid)=>{
					if (valid) {
						this.$axios.post('/login', {
							username: this.loginForm.loginUsername,
							password: this.loginForm.loginPassword
					})
						.then(resp => {
							if (resp.status === 200 && resp.data.message == "success") { //登录成功
								this.$store.commit('login', {
									username: this.loginForm.loginUsername
								});
								this.$router.push("/home");
							}
							else {
								this.$message({
									showClose: true,
									message: "登录失败",
									type: 'warning'
								});
								console.log(resp.data.message);
							}
					    })
						.catch(error => {
							console.log(error);
					    })
					}
				});
			},
			register(){
				this.$refs['registerForm'].validate((valid)=>{
					if (valid) {
						this.$axios.post('/register', {
							username: this.registerForm.registerUsername,
							password: this.registerForm.registerPassword
					})
						.then(resp => {
							if (resp.status === 200 && resp.data.message == "success") { //注册成功
								this.$store.commit('login', { // 保存username，和login一样
									username: this.registerForm.registerUsername
								});
								this.$router.push("/home");
							}
							else {
								this.$message({
									showClose: true,
									message: "注册失败",
									type: 'warning'
								});
								console.log(resp.data.message);
							}
					    })
						.catch(error => {
							console.log(error);
					    })
					}
				});
			},
		},
		mounted(){
			this.name = this.$route.name;
		},
	}
</script>
	
<style scoped>
	.container{
		margin:0;
		padding:0;
		width: 100%;
		height: 100%;
		background: url('../assets/login.jpg') no-repeat;
		background-size: cover;
		background-attachment: fixed;
	}
	.login.form, .register.form{
		width:300px;
		height:350px;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%,-50%);
		padding:10px 40px 0px 40px;
		background-color: rgba(0,0,0,0.3);
		border-radius: 15px;
		
		backdrop-filter: blur(3px);
		border-left: 2px solid rgba(0,0,0,0.5);
		border-top: 2px solid rgba(0,0,0,0.5);
		box-shadow: 2px 2px 10px #61dafb;
		text-align:center;
		color: rgb(255,255,255);
	}
	/* 输入框样式 */
	.inputContainer{
		margin-top: 10px;
		position: relative;
		height:40px;
	}
	.inputContainer .input{
		width:100%;
		height:100%;
		position: relative;
		outline:none;
		border: none;
		box-sizing: border-box;
		padding-left: 5px;
		background-color: inherit;
		caret-color: #61dafb;
		color: white
	}
	.inputContainer span{
		position: absolute;
		content: "";
		display:block;
		background-color: #61dafb;
		transition: transform .1s ease-in-out;
	}
	.inputContainer span.top, .inputContainer span.bottom{
		left: 0px;
		right: 0px;
		height: 2px;
	}
	.inputContainer span.left, .inputContainer span.right{
		top: 0px;
		bottom: 0px;
		width: 2px;
		transform: scaleY(0);
	}
	.inputContainer span.top{
		top: 0px;
		transform: scaleX(0);
		transform-origin: left center;
		transition-delay: .2s;
	}
	.inputContainer span.left{
		left: 0px;
		transform-origin: bottom center;
		transition-delay: .3s;
	}
	.inputContainer span.bottom{
		bottom: 0px;
	}
	.inputContainer span.right{
		right: 0px;
		transform-origin: top center;
		transition-delay: .1s;
	}
	.inputContainer .input:focus ~ .top{
		transform: scaleX(1);
		transform-origin: right center;
	}
	.inputContainer .input:focus ~ .right{
		transform: scaleY(1);
		transform-origin: bottom center;
	}
	.inputContainer .input:focus ~ .left{
		transform: scaleY(1);
		transform-origin: top center;
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
	
	.text_button{
		color:rgb(255,255,255);
	}
	.text_button:hover{
		color:#61dafb;
	}
	
</style>
