<template>
  <div>
    <div class="expandAside">
      <button class="expand-btn" @click="expandChatRoom">聊天室</button>
      <i class="el-icon-arrow-right"></i>
    </div>

    <div id="chatRoom">
      <button class="hide-btn" @click="hideChatRoom"><i class="el-icon-arrow-left"></i></button>
      <div class="mainContainer">

      </div>
      <div class="inputContainer">
        <el-form>
          <el-input type="textarea" placeholder="请输入文字" v-model="chatInput" @keyup.enter.native="submitChatInput"/>
          <button class="submit-btn" @click="submitChatInput">发送</button>
        </el-form>

      </div>
    </div>
  </div>

</template>

<script>
  export default {
    name: 'chatRoom',
    props:['socket','chatData'], //从父组件传入socket对象和聊天室信息对象data
    data () {
      return {
        chatInput:'',
      }
    },
    methods: {
      //展开聊天室
      expandChatRoom(){
        this.$bus.$emit('lockControl', true); //向Hanoi组件发送lockControl事件，发送值为true，表示聊天时不能移动
        document.getElementById('chatRoom').classList.add('show');
        document.querySelector('div.expandAside').classList.add('hide');
      },
      //收回聊天框
      hideChatRoom(){
        this.$bus.$emit('lockControl', false); //向Hanoi组件发送lockControl事件，发送值为false，表示关闭聊天可以移动
        document.getElementById('chatRoom').classList.remove('show');
        document.querySelector('div.expandAside').classList.remove('hide');
      },
      //提交聊天内容
      submitChatInput(){
        if(this.chatInput){
          let userId = sessionStorage.getItem('userId');
          let username = sessionStorage.getItem('username');
          if(this.socket) {
            this.socket.emit('receiveChat', {
              userId: userId,
              username: username,
              messageType: "Chat",
              message: this.chatInput,
            });
            this.chatInput = "";
          }
        }
      }
    },
    watch:{
      chatData: {  //监听chatData属性
        handler(newV, oldV){
          console.log("聊天室子组件接收到了父组件home的聊天数据",newV);
          if(newV){
            let chatMain = document.getElementsByClassName('mainContainer')[0];
            let {userId, username, messageType, message} = newV;
            let template = document.createElement('div');
            let node = document.createElement('p');
            template.style.textAlign = "left";
            template.style.overflow = "hidden";
            template.style.textOverflow = "ellipsis";
            node.style.margin = "0";
            if(messageType == 'Broadcast') {
              node.innerHTML = `<span class='strong'>[世界]广播</span>: ${message}`;
            }
            else if(messageType == 'Chat'){
              node.innerHTML = `<span class='strong'>[用户]${username}</span>: ${message}`;
            }
            else {
              console.log(messageType);
              console.log(node.innerHTML,template.innerHTML);
            }

            template.appendChild(node);
            chatMain.appendChild(template);
          }
        },
        deep: true
      }
    },

  }
</script>

<style scoped="chat">
  * {
    margin: 0;
    padding: 0;
  }

  #chatRoom button.hide-btn {
    position: absolute;
    left:0;
    top: -18px;
    cursor: pointer;
  }

  .expandAside {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 5rem;
    height: 50px;
    transition: 0.4s 0.2s ease-in-out;
  }

  .expandAside button.expand-btn {
    width: 100%;
    height: 100%;
    z-index: 1;
    text-align: left;
    padding-left: 1rem;
    border: none;
    border-top-right-radius: 44px;
    border-bottom-right-radius: 44px;
    background-color:  #f0f0f0;
    cursor: pointer;
    pointer-events: all;
  }

  .expandAside i{
    z-index: 2;
    position: absolute;
    right: 8px;
    top: 18px;
    cursor: pointer;
    pointer-events: none;
  }

  .expandAside.hide {
    transform: translateX(-100%);
  }

  #chatRoom {
    width: 25vw;
    height: 32vh;
    min-width: 150px;
    min-height: 200px;
    position: fixed;
    left: 0;
    bottom: 1.6rem;
    transform: translateX(-100%);
    transition: 0.6s 0.4s ease-in-out;
  }

  #chatRoom.show {
    transform: translateX(0);
  }

  .title {
    background-color: yellow;
    height: 10%;
  }

  .mainContainer {
    height: 85%;
    min-height: 50%;
    padding: 0.5rem;
    background-color: rgba(65, 63, 63, 0.6);
    overflow-y: auto;
    color: white
  }

  /* >>>可以穿透scoped */
  .mainContainer >>> div:not(:first-of-type) {
    margin-top: 0.5rem;
  }

  .mainContainer >>> span.strong {
    font-weight: 600;
  }

  .inputContainer {
    height: 15%;
    min-height: 10%;
  }

  .inputContainer .el-form {
    width: 100%;
    display: grid;
    grid-template-columns: 90% 10%;
  }

  .inputContainer .el-from .el-textarea {
    height: 100%;
    max-height: 100%;
    overflow: auto;
  }

  .inputContainer .el-form button.submit-btn{
    text-align: center;
    padding: 0 0.2rem;
    border: none;
    border-radius: 5px;
    background-color: rgb(60,150,250,1);
    color: white;
    cursor: pointer;
  }
</style>
