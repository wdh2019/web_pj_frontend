<template>
	<div class="container">
    <div class="forms-container">
      <div class="login-register">
        <!-- 登录界面 -->
        <div class="login form" >
        	<el-form id="loginForm" :model="loginForm" :rules="loginRules" ref="loginForm">
        		<h3 class="title">登录</h3>
              <el-form-item prop="loginUsername">
                <div class="input-field">
                  <i class="el-icon-user"></i>
                  <input class="input" type="text" placeholder="用户名" v-model="loginForm.loginUsername">
                </div>
              </el-form-item>
        		<el-form-item prop="loginPassword">
              <div class="input-field">
                <i class="el-icon-lock"></i>
                <input class="input" type="password" placeholder="密码" v-model="loginForm.loginPassword">
              </div>
        		</el-form-item>
        		<el-form-item>
        			<el-button class="solid_button" @click="login" round type="primary">登录</el-button>
        		</el-form-item>
        	</el-form>
        </div>
        <!-- 注册界面 -->
        <div class="register form" >
        	<el-form id="registerForm" :model="registerForm" :rules="registerRules" ref="registerForm">
        		<h3 class="title">注册</h3>
        		<el-form-item prop="registerUsername">
              <div class="input-field">
                <i class="el-icon-user"></i>
                <input class="input" type="text" placeholder="用户名" v-model="registerForm.registerUsername">
              </div>
        		</el-form-item>
        		<el-form-item prop="registerPassword">
              <div class="input-field">
                <i class="el-icon-lock"></i>
                <input class="input" type="password" placeholder="密码" v-model="registerForm.registerPassword">
              </div>
        		</el-form-item>
            <el-form-item prop="registerAge">
              <div class="input-field">
                <i class="el-icon-info"></i>
                <input class="input" type="text" placeholder="年龄" v-model="registerForm.registerAge">
              </div>
            </el-form-item>
            <el-form-item prop="registerGender">
              <div class="input-field">
                <i class="el-icon-male"></i>
                <div class="select">
                 <div class="selectMain">
                    <input v-model="registerForm.registerGender" type="text" placeholder="性别" />
                    <img src="../assets/down-arrow.png" alt="" @click="openSelect()">
                  </div>
                  <div class="selectOptions" v-show="showOptions">
                    <ul>
                      <li @click="getValue(item.label, index)" v-for="(item, index) in genders" :label="item.label" :key="index" :value="item.value">{{item.label}}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </el-form-item>
        		<el-form-item>
        			<el-button class="solid_button" @click="register" round type="primary">注册</el-button>
        		</el-form-item>
        	</el-form>
        </div>
      </div>
    </div>

    <div class="panels-container">
      <div class="panel left-panel">
        <div class="content">
          <h2>未注册？</h2>
          <p>点击下面的注册按钮跳转到注册界面进行注册吧！</p>
          <button class="solid_button transparent" @click="changeMode('register')">注册</button>
        </div>

        <img src="../assets/toy.png" class="image" alt="">
      </div>
      <div class="panel right-panel">
        <div class="content">
          <h2>已注册？</h2>
          <p>点击下面的登录按钮跳转到登录界面进行登录吧！</p>
          <button class="solid_button transparent" @click="changeMode('login')" >登录</button>
        </div>

        <img src="../assets/toy.png" class="image" alt="">
      </div>
    </div>
	</div>
</template>

<script>
	export default{
		name:'login',
		data(){
      //验证是数字
      var isNum = (rule,value,callback)=>{
         const age= /^[0-9]*$/;
         if(!age.test(+value)){
           callback(new Error('年龄必须是数字'));
         }
         else{
           callback();
         }
      };
      //验证性别
      var isGender = (rule,value,callback)=>{
        if(value != '男' && value != '女'){
          callback(new Error('请选择正确的性别'));
        }
        else {
          callback();
        }
      }
			return{
        name:"",
        activeNames: ['1'],
        genders: [{value: 'male', label: '男'},{value: 'female', label: '女'}],
        showOptions: false,
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
					registerPassword:"",
          registerAge:"",
          registerGender:"",
				},
				registerRules:{
					registerUsername:[
						{required: true, message: '请输入用户名', trigger: 'blur'}
					],
					registerPassword:[
						{required: true, message: '请输入密码', trigger: 'blur'}
					],
          registerAge:[
            {required: true, message: '请输入年龄', trigger: 'blur'},
            {validator: isNum, trigger: 'blur'}
          ],
          registerGender:[
            {required: true, message: '请选择性别', trigger: 'blur'},
            {validator: isGender, trigger: 'blur'}
          ],
				},

			}
		},
		methods:{
      //在登录和注册间切换
			changeMode(newName){
				this.name = newName;
				this.$router.push({
					name: this.name,
				});
        let container = document.querySelector('.container');
        if(newName == 'register') container.classList.add(newName);
        else container.classList.remove('register');
			},
      //点击下箭头显示下拉列表
      openSelect(){
        this.showOptions = !this.showOptions;
      },
      getValue(value, index){
        this.registerForm.registerGender = value;
        this.showOptions = !this.showOptions;
      },
			login(){
				this.$refs['loginForm'].validate((valid)=>{
					if (valid) {
            if(this.loginForm.loginUsername === "admin" && this.loginForm.loginPassword === "123456"){
              this.$confirm('恭喜你发现管理员账号，是否登录以查看后台页面？', '这不是一个彩蛋',{
              	confirmButtonText: '确定',
                cancelButtonText: '取消',
              	type: 'success'
              })
              .then(()=>{
                this.$store.commit('login', {
                  userId: -1,
                	username: 'admin',
                  token: null
                });
                this.$router.push("/info");
              })
              .catch(()=>{
                  this.$axios.post('/login', {
                  	username: this.loginForm.loginUsername,
                  	password: this.loginForm.loginPassword
                  })
                  .then(resp => {
                  	if (resp.status === 200 && resp.data.message === "success") { //登录成功
                      console.log(resp);
                      let {user, token} = resp.data;
                      console.log('接收到登录用户信息',user);
                      this.$store.commit('login', {
                        userId: user.userId,
                  			username: this.loginForm.loginUsername,
                        token: token
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
              })
            }
            else{
              this.$axios.post('/login', {
              	username: this.loginForm.loginUsername,
              	password: this.loginForm.loginPassword
              })
              .then(resp => {
              	if (resp.status === 200 && resp.data.message === "success") { //登录成功
                  console.log(resp);
                  let {user, token} = resp.data;
                  console.log('接收到登录用户信息',user);
                  this.$store.commit('login', {
                    userId: user.userId,
              			username: this.loginForm.loginUsername,
                    token: token
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
					}
				});
			},
			register(){
				this.$refs['registerForm'].validate((valid)=>{
					if (valid) {
						this.$axios.post('/register', {
							username: this.registerForm.registerUsername,
							password: this.registerForm.registerPassword,
              gender: this.registerForm.registerGender,
              age: +this.registerForm.registerAge,
            })
						.then(resp => {
							if (resp.status === 200 && resp.data.message === "success") { //注册成功
								console.log(resp);
                let {user, token} = resp.data;
                console.log('接收到注册用户信息',user);
                this.$store.commit('login', {
									userId: user.userId,
									username: this.loginForm.loginUsername,
									token: token
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
      //每次加载页面后，都要判断当前是登录界面还是注册界面。若是注册界面，则在container加上register类，已显示注册界面。
      this.name = this.$route.name;
      if(this.name == 'register') document.querySelector('.container').classList.add('register');

      window.addEventListener('beforeunload', function(event){
        event.preventDefault();
        if(this.name == 'login'){
          console.log('now is login');
          this.$router.push({
            name: 'login'
          })
        }
        else if(this.name == 'register'){
          console.log('now is register');
          this.$router.push({
            name:'register'
          })
        }
      });
		},
	}
</script>

<style scoped>
  * {
    margin: 0;
    font-family: "microsoft yahei","microsoft sans serif",'Avenir', Helvetica, Arial, sans-serif;
  }

  input, button {
    font-family: "microsoft yahei","microsoft sans serif",'Avenir', Helvetica, Arial, sans-serif;
  }

  .container {
    position: relative;
    width: 100vw;
    min-height: 100vh;
    background-color: #fff;
    overflow: hidden;
  }

  .container:before {
    content: '';
    position: absolute;
    width: 300vw;
    height: 350vh;
    border-radius: 50%;
    background: linear-gradient(-45deg, #ffc0cb, #ffb6c1);
    top: -10%;
    right: 45%;
    transform: translateY(-50%);
    z-index: 6;
    transition: 1.8s ease-in-out;
  }

  .forms-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  .login-register {
    position: absolute;
    top: 50%;
    left: 75%;
    transform: translate(-50%, -50%);
    width: 50%;
    display: grid;
    grid-template-columns: 1fr;
    z-index: 5;
    transition: 1s 0.7s ease-in-out;
  }

  .form {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    grid-column: 1 / 2;
    grid-row: 1 / 2;
    transition: 0.2s 0.7s ease-in-out;
  }

  .login.form {
    z-index: 2;
  }

  .register.form {
    z-index: 1;
    opacity: 0;
  }

  .title {
    font-size: 2.2rem;
    color: #444;
    margin-bottom: 10px;
  }

  .el-form-item >>> .el-form-item__error {
    position: absolute;
    top: 2rem;
    right: -150%;
    color: #ff0000;
    font-weight: 500;
    font-size: 1rem;
    z-index: -1;
  }

  .input-field {
    width: 300px;
    height: 55px;
    background-color:  #f0f0f0;
    margin: 10px 0;
    border-radius: 55px;
    display: grid;
    grid-template-columns: 15% 85%;
    padding: 0 0.4rem;
    color: #acacac;
    position: relative;
  }

  .input-field i {
    text-align: center;
    line-height: 55px;
    color: #acacac;
    font-size: 1.1rem;
    z-index: 13;
  }

  .input-field input {
    background: none;
    outline: none;
    border: none;
    line-height: 1;
    font-weight: 600;
    font-size: 1.1rem;
    letter-spacing: 1px;
    color: #333;
  }

  .input-field input::placeholder .select .selectMain input::placeholder{
    color: #aaa;
    font-weight: 500;
  }

  /* 下拉框 */
  .input-field .select{
    align-items: center;
    text-align: center;
    justify-content: center;
    width: 100%;
    height: 55px;
    z-index: 12;
  }

  .input-field .select .selectMain{
    align-items: center;
    text-align: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 10;
  }

 .input-field .select .selectMain input{
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    appearance: none;
    line-height: 1;
    font-weight: 600;
    font-size: 1.1rem;
    letter-spacing: 1px;
    color: #333;
  }

  .input-field .select .selectMain img {
    width: 20px;
    height: 20px;
    position: absolute;
    top: 18px;
    right: 10px;
  }

  .input-field .select .selectMain img:hover {
    cursor: pointer;
  }

  .input-field .select .selectOptions {
    width: calc(100% - 2px);
    position: absolute;
    top: calc(100% - 30px);
    left: 0;
    border: 1px solid #f0f0f0;
    border-bottom-left-radius: 25px;
    border-bottom-right-radius: 25px;
    overflow: hidden;
    z-index: 9;
    margin: 0;
    transition: 0.4s 0.6s ease-in-out;
  }

  .input-field .select .selectOptions ul {
    width: 100%;
    list-style-type: none;
    text-align: start;
    padding: 2rem 10px 0 50px;
    background-color:#f0f0f0;


  }
  .input-field .select .selectOptions ul li {
    width: 100%;
    height: 30px;
    cursor: pointer;
    line-height: 1;
    font-weight: 600;
    font-size: 1.1rem;
    letter-spacing: 1px;
    color: #333;
  }

  .input-field .select .selectOptions ul li:hover {
    background-color: #f0f0f0;
  }

  .solid_button {
    border-radius:  49px;
    margin-top: 20px;
    padding: 15px 40px;
    font-weight: 600;
    font-size: 1rem;
    letter-spacing: 1px;
    z-index: -1;
  }


  .panels-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    text-align: center;
    z-index: 7;
  }

  .left-panel {
    padding: 3rem 17% 2rem 12%;
    pointer-events: all;
  }

  .right-panel {
    padding: 3rem 12% 2rem 12%;
    pointer-events: none;
  }

  .panel .content {
    color: #fff;
    transition: 0.9s 0.6s ease-in-out;
  }

  .panel h2 {
    font-size: 600;
    padding: 0.7rem 0;
  }

  .panel p {
    font-size: 0.95rem;
    padding: 0.7rem 0;
  }

  .solid_button.transparent {
    background: none;
    border: 2px solid #fff;
    width: 130px;
    font-weight: 600;
    font-size: 1rem;
    padding: 14px 30px;
    color: #fff;
  }

  .solid_button.transparent:hover {
    cursor: pointer;
  }

  .image {
    width: 100%;
    margin-top: 20vh;
    transition: 1.1s 0.4s ease-in-out;
  }

  .right-panel .content, .right-panel .image {
    transform: translateX(100vw);
  }

  /* 动画*/
  .container.register:before {
    background: linear-gradient(-45deg, #ffa500, #ffff00);
    transform: translate(100%, -50%);
    right: 52%;
  }

  .container.register .left-panel .image,
  .container.register .left-panel .content {
    transform: translateX(-100vw);
  }

  .container.register .right-panel .content {
    transform: translateX(0px);
  }

  .container.register .right-panel .image {
    transform: translateX(5vw);
  }


  .container.register .left-panel {
    pointer-events: none;
  }
  /* 恢复right-panel的鼠标点击事件*/
  .container.register .right-panel {
    pointer-events: all;
  }
  /* 移动注册界面*/
  .container.register .login-register {
    left: 25%;
  }

  /* 改变注册界面z-index，显示注册界面*/
  .container.register .login.form {
    z-index: 1;
    opacity: 0;
  }

  .container.register .register.form {
    z-index: 2;
    opacity: 1;
  }



</style>
