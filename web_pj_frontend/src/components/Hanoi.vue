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
  props: ["socket", "controlLock"],
  data() {
    return {
      container: null,
      players: new Map(),
      playersInfo: new Map(),
      camera: null,
      scene: null,
      renderer: null,
      orbitControls: null,
      mobileControls: null,
      moveForward: false,
      moveLeft: false,
      moveBackward: false,
      moveRight: false,
      userId: this.$store.state.userId,
      userName: this.$store.state.userName,
      columns: [],
      diskModels: [],
      diskPositions: [],
      diskLocations: [],
      hold: -1,
      diskSelected: -1,
      columnNearBy: -1,
      diskCount: 3,
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
      let group = new Three.Group();
      loader.load("static/Gray rhino.glb", (mesh) => {
        mesh.scene.position.set(0, 0, 0);
        mesh.scene.scale.set(10, 10, 10);
        //    let AnimationAction=mixer.clipAction(mesh.animations[1]);
        //    AnimationAction.play();
        group.add(mesh.scene);
        group.position.set(0, 30, -500);
      });
      this.scene.add(group);
      // 将角色对应关系加到 players 和 playersInfo map 中
      this.players.set(this.userId, group);
      console.log(group);
      this.playersInfo.set(this.userId, this.userName);
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
      let that = this;
      let onKeyDown = function (e) {
        switch (e.key) {
          case "a":
            that.moveLeft = true;
            break;
          case "s":
            that.moveBackward = true;
            break;
          case "d":
            that.moveRight = true;
            break;
          case "w":
            that.moveForward = true;
            break;
          case "f":
            that.diskAction();
            break;
        }
      };
      let onKeyUp = function (e) {
        switch (e.key) {
          case "a":
            that.moveLeft = false;
            break;
          case "s":
            that.moveBackward = false;
            break;
          case "d":
            that.moveRight = false;
            break;
          case "w":
            that.moveForward = false;
            break;
        }
      };

      document.addEventListener("keydown", onKeyDown, false);
      document.addEventListener("keyup", onKeyUp, false);
    },

    //添加新的角色模型
    addModel(userId, userName, position) {
      //新增角色模型
      const loader = new GLTFLoader();
      let group = new Three.Group();
      loader.load("static/Gray rhino.glb", (mesh) => {
        mesh.scene.position.set(0, 0, 0);
        mesh.scene.scale.set(10, 10, 10);
        //    let AnimationAction=mixer.clipAction(mesh.animations[1]);
        //    AnimationAction.play();
        group.add(mesh.scene);
        group.position.set(...position);
      });
      this.scene.add(group);
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
      if (this.hold !== 3) return;
      if (
        this.diskPositions[this.diskSelected].location === 4 &&
        this.diskPositions[this.diskSelected].position === userId
      ) {
        this.hold = 1;
        this.dropObject(userId, this.diskSelected, this.columnNearBy);
        this.sendDisk();
      }
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
    handleMovePosition(userId, newPosition) {
      if (userId === this.userId) return;
      this.players
        .get(userId)
        .position.set(newPosition[0], newPosition[1], newPosition[2]);
      // console.log(this.players.get(userId).position);
    },
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
      this.judgeSuccess();
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
        let minNum = 4;
        for (let i = 0; i < this.diskCount; i++) {
          if (this.diskLocations[i] === this.columnNearBy) {
            minNum = i;
            break;
          }
        }
        console.log(this.diskLocations);
        if (minNum < this.diskSelected) {
          this.$message.warning("大盘子不得放在小盘子上方");
          return;
        }
        this.hold = -1;
        console.log(this.columnNearBy);
        this.dropDisk(this.userId, this.diskSelected, this.columnNearBy);
        this.sendDisk(
          this.diskSelected,
          this.diskPositions[this.diskSelected].x,
          this.diskPositions[this.diskSelected].y,
          this.diskPositions[this.diskSelected].z,
          this.diskLocations[this.diskSelected]
        );
      }
    },

    judgeDisk() {
      //判断是否在一根柱子边
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
      //已经拿着就返回拿着的盘子
      if (this.hold >= 0) {
        this.diskSelected = this.hold;
        return;
      }

      this.diskSelected = -1;

      for (let i = 0; i < this.diskCount; i++) {
        if (this.diskLocations[i] === this.columnNearBy) {
          this.diskSelected = i;
          break;
        }
      }
    },
    judgeSuccess() {
      for (let i = 0; i < this.diskCount; i++) {
        if (this.diskLocations[i] !== 2) return;
      }
      this.$message.success("成功啦！");
    },
  },
  mounted() {
    //this.diskModels = new Array(this.diskCount);
    this.container = document.getElementById("hanoi-scene");
    window.addEventListener("resize", this.onWindowResize);

    this.init();
  },
};
</script>

<style scoped>
.hanoi-container,
#hanoi-scene {
  height: 100%;
}
</style>
