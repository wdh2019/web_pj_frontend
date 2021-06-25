<template>
  <div class="container">
    <div id="header">
    	<div class="userInfo"><i class="el-icon-user"></i> <span>管理员</span></div>
    	<div class="logout"><el-button class="solid_button" @click="logout">登出</el-button></div>
    </div>
    <div id="main">
      <div class="menuContainer">
        <div class="box" @click="getUsers()">
          <h2>01</h2>
          <h3>所有用户</h3>
          <p>点击查看所有用户的基本信息</p>
        </div>
        <div class="box" @click="getUserStatistics()">
          <h2>02</h2>
          <h3>用户信息统计</h3>
          <p>点击查看所有用户的信息统计图</p>
        </div>
        <div class="box" @click="getGames()">
          <h2>03</h2>
          <h3>对局信息</h3>
          <p>点击查看所有对局的基本信息</p>
        </div>
      </div>
      <div class="users infoContainer">
        <div class="backContainer">
          <i class="el-icon-arrow-left" @click="hideInfo(0)"></i>
          <button class="back-btn" @click="hideInfo(0)">返回</button>
        </div>
        <div class="tableContainer">
          <el-table :data="users" border>
              <el-table-column prop="username" label="用户名" width="200">
              </el-table-column>
              <el-table-column prop="age" label="年龄" width="150">
              </el-table-column>
              <el-table-column prop="gender" label="性别">
              </el-table-column>
          </el-table>
        </div>

      </div>
      <div class="userStatistics infoContainer">
        <div class="backContainer">
          <i class="el-icon-arrow-left" @click="hideInfo(1)"></i>
          <button class="back-btn" @click="hideInfo(1)">返回</button>
        </div>
        <div class="charts">
          <div class="age chart"></div>
          <div class="gender chart"></div>
        </div>
      </div>
      <div class="games infoContainer">
        <div class="backContainer">
          <i class="el-icon-arrow-left" @click="hideInfo(2)"></i>
          <button class="back-btn" @click="hideInfo(2)">返回</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import * as echarts from 'echarts';

  export default {
    name: 'infomation',
    data () {
      return {
        users:[],
        statistics: null,
        ageDistribution:[], //年龄分布数组
        genderDistribution:[], //性别分布数组
        games:[],
        infos:[], //存放三个详细信息区域的dom对象
      }
    },
    methods:{
      //获取所有用户信息数据
      getUsers(){
        if(this.users.length == 0){
          this.$axios.get('/users')
          .then(resp => {
            console.log("接收到用户信息回应体",resp);
            console.log("其中的用户信息",resp.data);
            resp.data.forEach((item, index)=>{
              this.$set(this.users, index, item);
            });
            console.log(this.users);
            this.showInfo(0);

          })
          .catch(err => {
            console.log(err);
          })
        }
        else{
          console.log(this.users);
          this.showInfo(0);
        }
      },
      //绘制饼状图
      drawBarChart(dom, title, legend, series){
        var myChart = echarts.init(dom);
        var option;

        option = {
          title: title,
          tooltip: {
            trigger: 'item'
          },
          legend: legend,
          series: series,
        }
        option && myChart.setOption(option);
      },
      //绘制年龄和性别饼状图
      drawBarChartsForAgeAndGender(){
        let ageDom = document.querySelector('.age');
        let ageTitle = {
            text: '用户年龄分布',
            left: 'center'
        };
        let ageLegend = {
            orient: 'vertical',
            left: 'left',
            width: '500px',
            height: '500px',
        };
        let ageSeries = [
          {
            name: '年龄',
            type: 'pie',
            radius: '50%',
            data: this.ageDistribution,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
          }
        ];
        let genderDom = document.querySelector('.gender');
        let genderTitle = {
            text: '用户性别分布',
            left: 'center'
        };
        let genderLegend = {
            orient: 'vertical',
            left: 'left',
            width: '500px',
            height: '500px',
        };
        let genderSeries = [
          {
            name: '性别',
            type: 'pie',
            radius: '50%',
            data: this.genderDistribution,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
          }
        ];
        this.drawBarChart(ageDom, ageTitle, ageLegend, ageSeries);
        this.drawBarChart(genderDom, genderTitle, genderLegend, genderSeries);
      },
      //绘制用户信息的统计图
      getUserStatistics(){
        console.log(!this.statistics);
        if(!this.statistics){
          this.$axios.get('/statistics')
          .then(resp => {
            console.log("接收到用户信息统计回应体",resp);
            console.log("其中的信息",resp.data);
            this.statistics = resp.data;
            //计算年龄分布
            this.statistics.ageDistribution.forEach((item, index)=>{
              let name = index * 10 + "-" + (index+1) * 10 + "岁";
              if(this.statistics.ageDistribution[index] > 0)
                this.ageDistribution.push({value: this.statistics.ageDistribution[index], name: name});
            });
            //计算性别分布
            let maleProportion = this.statistics.maleProportion;
            this.genderDistribution.push({value: maleProportion, name: '男性'});
            this.genderDistribution.push({value: (1 - maleProportion), name: '女性'});

            console.log(this.ageDistribution);
            console.log(this.genderDistribution);
            this.drawBarChartsForAgeAndGender();
            this.showInfo(1);
          })
          .catch(err => {
            console.log(err);
          })
        }
        else{
          console.log(this.statistics);
          this.drawBarChartsForAgeAndGender();
          this.showInfo(1);
        }
      },
      //获取对局信息数据
      getGames(){
        this.$axios.get('/users')
        .then(resp => {
          console.log("接收到对局信息回应体",resp);
          console.log("其中的对局信息",resp.data);
          this.games = resp.data.games;
           this.showInfo(2);
        })
        .catch(err => {
          console.log(err);
        })
      },
      //隐藏当前详细信息，返回菜单
      hideInfo(index){
        this.infos[index].classList.remove('show');
        //显示菜单
        document.querySelector('.menuContainer').classList.remove('hide');
      },
      //展示信息
      showInfo(index){
        this.infos[index].classList.add('show');
        //隐藏菜单
        document.querySelector('.menuContainer').classList.add('hide');
      },
      logout(){
      	//关闭连接
      	this.$socket.close();
        //调用vuex mutations中logout方法
        this.$store.commit('logout');
        //重定向到登录界面
        this.$router.push('/login');
      }
    },
    mounted() {
      this.infos.push(document.querySelector('.users'));
      this.infos.push(document.querySelector('.userStatistics'));
      this.infos.push(document.querySelector('.games'));
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
    overflow: hidden;
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
    padding: 0 200px;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .menuContainer {
    width: 100%;
    padding-top: 30vh;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    transform: translateY(0);
    transition: transform 0.5s ease-in-out;
  }

  .menuContainer.hide {
    transform: translateY(-120%);
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

  /* 具体信息区域样式 */
  .infoContainer {
    position: absolute;
    top: 0;
    width: 80%;
    height: 100%;
    transition: transform 0.5s ease-in-out;
    transform: translateY(1000px);
  }

  .infoContainer.show {
    transform: translateY(0);
  }

  .infoContainer .backContainer {
    position: absolute;
    left:0;
    top: 1em;
  }

  .infoContainer .backContainer i {
    cursor: pointer;
    transform: translateX(5px);
  }

  .infoContainer .backContainer .back-btn {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
  }

  .users .tableContainer {
    width: 500px;
    max-height: 500px;
    overflow: auto;
    transform: translate(500px,200px);
  }

  /* 统计图表样式*/
  .charts {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding-top: 100px;
  }
  .chart {
    width: 500px;
    height: 600px;
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
