<template>
  <div id="chatRoom">
    <h2 class="title">聊天室</h2>
    <div class="mainContainer">

    </div>
    <div class="inputContainer">
      <el-form>
        <el-input type="textarea" placeholder="请输入文字" v-model="chatInput" @keyup.enter.native="submitChatInput($event)"/>
      </el-form>
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
      //提交聊天内容
      submitChatInput(event){
        event.preventDefault();
        if(!this.chatInput) return false;
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

        return false;
      }
    },
    watch:{
      chatData: {  //监听chatData属性
        handler(newV, oldV){
          console.log(newV, oldV);
          let {userId, username, messageType, message} = newV;
          if(newV){
            let chatMain = document.getElementsByClassName('mainContainer')[0];
            let template = document.createElement('div');
            let node = document.createElement('p');
            template.style.textAlign = "left";
            //template.style.whiteSpace = "nowrap";
            template.style.overflow = "hidden";
            template.style.textOverflow = "ellipsis";
            node.style.margin = "0";
            if(messageType == 'Broadcast') {
              node.innerHTML = `<span class='strong'>广播</span>: ${message}`;
            }
            else if(messageType == 'Chat'){
              node.innerHTML = `<span class='strong'>${username}</span>: ${message}`;
            }
            template.appendChild(node);
            chatMain.appendChild(template);
          }
        },
        deep: true
      }
    },
    mounted() {
      /* 调试聊天室消息*/
      // let newV = {
      //   userId: 111,
      //   username: 'wangdonghui',
      //   messageType: 'Chat',
      //   message: 'helloworld!asfsafsfaasfasadfa',
      // }
      // let {userId, username, messageType, message} = newV;
      // console.log(newV);
      // let chatMain = document.getElementsByClassName('mainContainer')[0];
      // let template = document.createElement('div');
      // let node = document.createElement('p');
      // template.style.textAlign = "left";
      // //template.style.whiteSpace = "nowrap";
      // template.style.overflow = "hidden";
      // template.style.textOverflow = "ellipsis";
      // node.style.margin = "0";
      // if(messageType == 'Broadcast') {
      //   node.innerHTML = `<span class='strong'>广播</span>: ${message}`;
      // }
      // else if(messageType == 'Chat'){
      //   node.innerHTML = `<span class='strong'>${username}</span>: ${message}`;
      // }
      // template.appendChild(node);
      // chatMain.appendChild(template);
    }

  }
</script>

<style scoped>
  * {
    margin: 0;
    padding: 0;
  }

  #chatRoom {
    width: 30vw;
    height: 32vh;
    min-width: 150px;
    min-height: 200px;
    background-color: lightgray;
    position: fixed;
    left: 0;
    bottom: 0;
  }

  .title {
    background-color: yellow;
    height: 10%;
  }

  .mainContainer {
    height: 75%;
    min-height: 50%;
    padding: 5px;
    background-color: #606266;
    overflow-y: auto;
    color: white
  }

  .inputContainer {
    height: 15%;
    min-height: 10%;
    background-color: #3A8EE6;
  }

</style>
