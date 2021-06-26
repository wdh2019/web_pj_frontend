<template>
  <div class="hanoi-container">
    <div id="hanoi-scene"></div>
  </div>
</template>

<script>
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import SkyUtils from "./SkyUtils";

export default {
  name: "Hanoi",
  //从父组件获取建立的socket链接
  props: ["socket"],
  data() {
    return {
      container: null,
      //记录用户id和对应物件组的map
      players: new Map(),
      //记录用户id和用户名字的map
      playersInfo: new Map(),
      camera: null,
      scene: null,
      renderer: null,
      //用于摄像机变化
      orbitControls: null,
      //用于移动的状态参量
      moveForward: false,
      moveLeft: false,
      moveBackward: false,
      moveRight: false,
      userId: this.$store.state.userId,
      userName: this.$store.state.userName,
      columns: [],
      //记录盘子模型
      diskModels: [],
      //盘子位置{x:,y:,z:}
      diskPositions: [],
      //盘子在哪根柱子上，以柱子的索引记录，3表示在人身上
      diskLocations: [],
      //自己有没有拿着盘子+拿着哪个盘子
      hold: -1,
      //记录会交互的盘子
      diskSelected: -1,
      //记录相近的柱子索引
      columnNearBy: -1,
      //盘子数
      diskCount: 3,
      controlLock: false, //移动锁，false为可以移动，true为不可以移动
    };
  },
  methods: {
    init() {
      this.initScene();
      this.initBase();
      this.render();
      this.initOrbitControls();
      this.initMovementControl();
    },

    //初始化场景
    initScene() {
      //获得容器
      this.container = document.getElementById("hanoi-scene");

      //新建场景和摄像机
      this.scene = new Three.Scene();
      this.camera = new Three.PerspectiveCamera(
        70,
        this.container.clientWidth / this.container.clientHeight,
        1,
        10000
      );
      this.camera.position.set(-125, 500, -700);
      this.camera.lookAt(this.scene.position);

      //建立渲染器
      this.renderer = new Three.WebGLRenderer({ antialias: true });
      this.renderer.setSize(
        this.container.clientWidth,
        this.container.clientHeight
      );
      this.container.appendChild(this.renderer.domElement);

      //添加天空盒
      let skyBox = SkyUtils.createSky();
      this.scene.add(skyBox);

      //点光源
      let point = new Three.PointLight(0xffffff);
      point.position.set(-200, 100, -300);
      this.scene.add(point);

      //环境光
      let ambientLight = new Three.AmbientLight(0xffffff);
      this.scene.add(ambientLight);
    },

    //初始化渲染的要素
    initBase() {
      // hanoi 柱子
      for (let i = 0; i < 3; i++) {
        let column = new Three.Mesh(
          new Three.CylinderGeometry(3, 3, 160, 100),
          new Three.MeshLambertMaterial({ color: 0x754e2f })
        );
        column.position.set(-200 + i * 200, 110, 100);
        this.scene.add(column);
        this.columns.push(column);
      }

      //模型加载器
      const loader = new GLTFLoader();
      let that = this;

      //场景模型
      loader.load("static/Sports Stadium.glb", (mesh) => {
        mesh.scene.scale.set(70, 50, 70);
        that.scene.add(mesh.scene);
      });
      //圆盘
      for (let i = 0; i < this.diskCount; i++) {
        let disk = new Three.Mesh(
          new Three.CylinderGeometry(20 + i * 10, 20 + i * 10, 10, 200),
          new Three.MeshLambertMaterial({ color: 0x76bf66 })
        );
        disk.position.set(-200, 55000 - i * 10, 100);
        this.diskModels.push(disk);
        this.diskPositions.push(disk.position);
        this.diskLocations.push(0);
        this.scene.add(disk);
      }
      //渲染自己的模型
      this.addModel(this.userId, this.userName, [0, 30, -500]);
    },

    //渲染循环
    render() {
      let that = this;
      requestAnimationFrame(this.render);
      this.renderer.render(this.scene, this.camera);
      if (!this.players.has(this.userId)) return;
      //if (that.moveLock) return;
      //根据状态参量，设置模型位置，达到移动的效果
      if (this.moveForward) {
        this.players.get(this.userId).position.z += 5;
      }
      if (this.moveBackward) {
        this.players.get(this.userId).position.z -= 5;
      }
      if (this.moveLeft) {
        this.players.get(this.userId).position.x += 5;
      }
      if (this.moveRight) {
        this.players.get(this.userId).position.x -= 5;
      }
      //需要更新位置信息，需要发送socket信息
      if (
        this.moveLeft ||
        this.moveRight ||
        this.moveBackward ||
        this.moveForward
      )
        this.sendPosition();
      if (this.hold >= 0) {
        this.sendDisk(
          this.hold,
          this.players.get(this.userId).position.x,
          100,
          this.players.get(this.userId).position.z,
          this.diskLocations[this.hold]
        );
      }
    },

    onKeyDown(e) {
      if (!this.controlLock) {
        switch (e.key) {
          case "a":
            this.moveLeft = true;
            break;
          case "s":
            this.moveBackward = true;
            break;
          case "d":
            this.moveRight = true;
            break;
          case "w":
            this.moveForward = true;
            break;
          case "f":
            this.diskAction();
            break;
          case "t":
            this.players.forEach((element) => {
              console.log(element.position);
            });
        }
      }
    },

    onKeyUp(e) {
      if (!this.controlLock) {
        switch (e.key) {
          case "a":
            this.moveLeft = false;
            break;
          case "s":
            this.moveBackward = false;
            break;
          case "d":
            this.moveRight = false;
            break;
          case "w":
            this.moveForward = false;
            break;
        }
      }
    },

    //鼠标控制视角
    initOrbitControls() {
      this.orbitControls = new OrbitControls(
        this.camera,
        this.renderer.domElement
      );
      this.orbitControls.enableZoom = false;
    },

    //监听键盘，根据按键更改状态参量，以在render里更新渲染
    initMovementControl() {
      document.addEventListener("keydown", this.onKeyDown, false);
      document.addEventListener("keyup", this.onKeyUp, false);
    },

    //添加新的角色模型
    addModel(userId, userName, position) {
      //新增角色模型
      const loader = new GLTFLoader();
      const textLoader = new Three.FontLoader();
      let group = new Three.Group();
      loader.load("static/Gray rhino.glb", (mesh) => {
        mesh.scene.position.set(0, 0, 0);
        mesh.scene.scale.set(10, 10, 10);
        //    let AnimationAction=mixer.clipAction(mesh.animations[1]);
        //    AnimationAction.play();
        group.add(mesh.scene);
        group.position.set(...position);
        this.scene.add(group);
      });

      textLoader.load("static/Bauhaus 93_Regular.json", (font) => {
        let textGeometry = new Three.TextGeometry(userId + "", {
          font: font,
          size: 10,
          height: 5,
          bevelThickness: 1,
          bevelSize: 8,
        });
        let textMesh = new Three.Mesh(
          textGeometry,
          new Three.MeshLambertMaterial({ color: 0xaf32e8 })
        );
        textMesh.scale.set(-3, 3, 1);
        textMesh.position.set(0, 150, 0);
        group.add(textMesh);
      });

      // 将角色对应关系加到 players 和 playersInfo map 中
      this.players.set(userId, group);
      this.playersInfo.set(userId, userName);
    },

    //新人加入场景的事件
    handleJoinIn(userId, userName) {
      this.addModel(userId, userName, [0, 30, -500]);
    },

    //监听事件，在窗口大小改变的时候改变canvas大小
    onWindowResize() {
      if (this.camera != null) {
        this.camera.aspect =
          this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(
          this.container.clientWidth,
          this.container.clientHeight
        );
      }
    },

    //监听人离开，map中删除
    handlelLogout(userId) {
      this.scene.remove(this.players.get(userId));
      delete this.players[userId];
      delete this.playersInfo[userId];

    },

    //处理自己登出，将map清空，会在logout时被父组件调用
    handleLeave() {
      this.players = new Map();
      this.playersInfo = new Map();
    },

    //监听盘子的移动
    handleMoveDisk(id, position, location) {
      this.diskPositions[id] = {
        x: position[0],
        y: position[1],
        z: position[2],
      };
      this.diskModels[id].position.set(...position);
      this.diskLocations[id] = location;
    },
    //监听角色的移动
    handleMovePosition(userId, newPosition) {
      if (userId === this.userId) return;
      this.players
        .get(userId)
        .position.set(newPosition[0], newPosition[1], newPosition[2]);
      // console.log(this.players.get(userId).position);
    },
    //处理在连接前就存在的角色形象
    handleUsersPosition(userId, userName, userPosition) {
      if (userId === this.userId) return;
      this.addModel(userId, userName, userPosition);

      // console.log(this.players.get(userId).position);
    },

    //移动发送位置信息
    sendPosition() {
      //发送socket消息
      this.socket.emit("updatePosition", {
        userId: this.userId,
        username: this.userName,
        messageType: "updatePosition",
        message:
          this.players.get(this.userId).position.x +
          "," +
          this.players.get(this.userId).position.y +
          "," +
          this.players.get(this.userId).position.z,
      });
    },

    //盘子移动信息
    sendDisk(id, x, y, z, location) {
      //发送socket消息
      this.socket.emit("updateDisk", {
        id: id,
        position: x + "," + y + "," + z,
        location: location,
      });
    },

    // 抬起盘子
    liftDisk(userId, num) {
      //将盘子添加到角色的物件组中，方便位置管理，为此先删除页面上原有的模型
      this.scene.remove(this.diskModels[num]);
      this.diskModels[num].position.set(0, 70, 0);
      this.players.get(userId).add(this.diskModels[num]);
      this.columnNearBy = this.diskLocations[num];
      //3 表示抬起了
      this.diskLocations[num] = 3;
      this.diskPositions[num] = {
        x: this.players.get(userId).position.x,
        y: 100,
        z: this.players.get(userId).position.z,
      };
    },

    //放下盘子
    dropDisk(userId, num, column) {
      let count = 1;
      for (let i = 0; i < this.diskCount; i++) {
        if (i === num) continue;
        if (this.diskLocations[i] === column) count++;
      }
      this.diskModels[num].position.set(
        -200 + column * 200,
        35 + count * 10,
        100
      );
      this.players.get(userId).remove(this.diskModels[num]);
      this.scene.add(this.diskModels[num]);
      this.diskLocations[num] = column;
      this.diskPositions[num] = this.diskModels[num].position;
      
    },

    //互动检测
    diskAction() {
      this.judgeDisk();
      if (this.diskSelected < 0 || this.columnNearBy < 0) return;
      if (this.hold < 0) {
        this.hold = this.diskSelected;
        this.liftDisk(this.userId, this.diskSelected);
        this.sendDisk(
          this.diskSelected,
          this.diskPositions[this.diskSelected].x,
          this.diskPositions[this.diskSelected].y,
          this.diskPositions[this.diskSelected].z,
          this.diskLocations[this.diskSelected]
        );
        return;
      } else {
        //判断盘子是否可以放置
        //即判断columnNearBy最上面的柱子是否是index小，小则说明是小盘子
        let minNum = 4;
        for (let i = 0; i < this.diskCount; i++) {
          if (this.diskLocations[i] === this.columnNearBy) {
            minNum = i;
            break;
          }
        }
        if (minNum < this.diskSelected) {
          this.$message.warning("大盘子不得放在小盘子上方");
          return;
        }
        this.hold = -1;
        this.dropDisk(this.userId, this.diskSelected, this.columnNearBy);
        this.sendDisk(
          this.diskSelected,
          this.diskPositions[this.diskSelected].x,
          this.diskPositions[this.diskSelected].y,
          this.diskPositions[this.diskSelected].z,
          this.diskLocations[this.diskSelected]
        );
        this.judgeSuccess();
      }
    },
    //更新columnNearBy 和 diskSelected的值
    judgeDisk() {
      //判断是否在一根柱子附近
      this.columnNearBy = -1;
      for (let i = 0; i < 3; i++) {
        if (
          Math.abs(this.players.get(this.userId).position.x + 200 - i * 200) <
            80 &&
          Math.abs(this.players.get(this.userId).position.z - 100) < 80
        ) {
          this.columnNearBy = i;
          break;
        }
      }

      //找到会操作到的盘子
      //已经拿着，就返回拿着的盘子
      if (this.hold >= 0) {
        this.diskSelected = this.hold;
        return;
      }

      this.diskSelected = -1;
      //找到柱子最上面的盘子
      for (let i = 0; i < this.diskCount; i++) {
        if (this.diskLocations[i] === this.columnNearBy) {
          this.diskSelected = i;
          break;
        }
      }
    },
    judgeSuccess() {
      //判断是否全部完成
      for (let i = 0; i < this.diskCount; i++) {
        if (this.diskLocations[i] !== 2) return;
      }
      this.socket.emit("success", "success");
      let that = this;
       setTimeout(function(){
         that.reset()}
         , 3000);
      
    },
    //重置人和盘子
    reset() {
      this.players.forEach((element) => {
        element.position.set(0, 30, -500);
      });
      for (let i = 0; i < this.diskCount; i++) {
        this.diskModels[i].position.set(-200, 55 - i * 10, 100);
        this.diskPositions[i] = this.diskModels[i].position;
        this.diskLocations[i] = 0;
      }
      this.hold = -1;
      this.diskSelected = -1;
      this.columnNearBy = -1;
    },
  },
  mounted() {
    //this.diskModels = new Array(this.diskCount);
    this.container = document.getElementById("hanoi-scene");
    window.addEventListener("resize", this.onWindowResize);
    this.init();
    //通过总线监听lockControl事件，获取值
    this.$bus.$on("lockControl", (val) => {
      this.controlLock = val;
    });
  },
  destroyed() {
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("resize,", this.onWindowResize);
    this.$bus.$off("lockControl");
  },
};
</script>

<style scoped>
.hanoi-container,
#hanoi-scene {
  height: 100%;
}
</style>
