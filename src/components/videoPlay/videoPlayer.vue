<template>
  <div
    id="commonVideoPlayer"
    v-show="props.playVideoList.length"
    class="video-player-container"
    @mouseout.capture="showControlBar"
  >
    <!-- 播放器 -->
    <div
      class="players-container"
      :style="{ height: windowHeight - 163 + 'px !important' }"
      @mousemove.prevent="showControlBar"
    >
      <div class="center-player" id="centerPlayer">
        <div class="player-con">
          <div id="video0" class="each-player full-player">
            <template v-if="props.playVideoList[0]"> </template>
          </div>
        </div>
      </div>
    </div>
    <!-- 播放器控制条 -->
    <transition name="el-zoom-in-bottom">
      <div
        class="controls-container"
        id="controlBar"
        v-show="data.isShowControlBar"
        @mouseover.capture="stillShowControlBar"
      >
        <ControlBar
          ref="controlBar"
          :config="data.playerConfig"
          :isLive="props.isLive"
          @play="play"
          @pause="pause"
          @setVolume="setVolume"
          @playRate="playRate"
          @fullScreen="toggleFullScreen"
          @changeTime="changeTime"
        ></ControlBar>
      </div>
    </transition>
  </div>
</template>

<script setup>
import playerjs from './js/player';
import ControlBar from './components/control-bar.vue';
import { utilsTime } from '../../utils/utilsTime';
import posterImg from '../../static/homePage/cs1.jpg';
import {
  onMounted,
  reactive,
  nextTick,
  onBeforeUnmount,
  defineProps,
  computed,
  ref,
} from 'vue';

const props = defineProps({
  playVideoList: {
    type: Array,
    default: () => [
      {
        source: '',
        size: 0,
        rate: '0', // 倍速
        fileUrl:
          'http://zonekeyvideo.oss-cn-hangzhou.aliyuncs.com/9532072548461-%E8%B8%A2%E8%B8%8F.mp4',
        camera: '小猴跳舞.mp4',
        showFlag: true,
      },
    ],
  },
  isLive: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['totalTime', 'currentTime']);
const data = reactive({
  errorFlag: false,
  posterImg: posterImg,
  refreshFlag: true, // 是否显示暂停图标
  isShowControlBar: true,
  controlBarTimer: null,
  playerConfig: {
    // 播放器基础配置信息
    duration: 0, // 视频总时长
    currentTime: 0, // 播放进度
    playbackRate: 1, // 初始播放倍速
    volume: 0.6, // 默认初始音量为60%
    pauseFlag: false, // 是否暂停中
    fullScreenFlag: false, // 当前是否处于全屏模式
    isMockClip: false, // 是否处于视频截取状态
    filmMode: false, // 是否存在电影模式
    doubleScreenMode: false, // 是否存在双屏模式
    startTime: 0, // 直播开始时间
  },
});
let windowHeight = ref(0);
function resizeHandle() {
  windowHeight.value = window.innerHeight;
}
function playInit() {
  if (props.playVideoList.length === 0) return false;
  nextTick(() => {
    createPlayer();
  });
}
/* 实例化播放器对象 */
function createPlayer(obj = {}, type) {
  data.playerList = [];
  // 遍历创建播放器对象
  props.playVideoList.forEach((video, index) => {
    if (video.showFlag) {
      const mediaData = Object.assign(
        {
          wrapperId: 'video' + index,
          url: video.fileUrl,
          poster: data.posterImg,
          showError: true,
          videoType: data.videoType,
        },
        obj
      ); // obj放到后面防止事件循环机制导致每次的fileUrl获取是最后面的一个
      data.playerList[index] = playerjs.createPlayer(mediaData);
    } else {
      data.playerList[index] = null;
    }
  });
  if (props.isLive) {
    nextTick(() => {
      if (data.playerList[0]) bindPlayerEvent(data.playerList[0]);
    });
  } else {
    if (data.playerList[0]) bindPlayerEvent(data.playerList[0]);
  }
}
function bindPlayerEvent(player) {
  player.listen('fullScreen', setFullScreen);
  player.listen('timeupdate', setCurrentTime);
  player.listen('play', play);
  player.listen('pause', pause);
  player.muted = false;
  player.volume = data.playerConfig.volume;
  if (props.isLive) {
    player.listen('canplay', () => {
      setDuration();
      player.muted = false;
      player.volume = data.playerConfig.volume;
      refreshPlayer(); // 刷新当前页面时，加个样式。
    });
    setDuration();
  } else {
    player.listen('ended', handlePlayEnd);
    player.listen('media_info', checkAudioStatus);
    // player.listen('error', haddlePlayerError);
    player.listen('canplay', () => {
      refreshPlayer(); // 刷新当前页面时，加个样式。
    });
  }
}
// 播放
function play() {
  if (data.refreshFlag) {
    const vDom = document.getElementById('video0');
    data.playerList[0].cleanRestart(vDom);
    data.refreshFlag = false;
  }
  data.playerConfig.pauseFlag = false;
  data.playerList.forEach((player, index) => {
    if (player) player.play();
  });
}
// 暂停
function pause() {
  data.playerList.forEach((player) => {
    // 全部暂停
    if (player) player.pause();
  });
  const vDom = document.getElementById('video0');
  data.playerList[0].showRestart(vDom, data.play);
  data.playerConfig.pauseFlag = true;
  data.refreshFlag = true;
}
/* 获取当前音量 */
function setVolume(volume) {
  data.playerConfig.volume = volume;
  if (data.playerList[0]) {
    data.playerList[0].volume = volume;
  }
}
/* 获取当前倍速 */
function playRate(rate) {
  data.playerConfig.playbackRate = rate.rate;
  data.playerList.forEach((player) => {
    if (player) player.setPlayBackRate(rate.rate);
  });
}
/* 点击全屏、取消全屏按钮时，执行对应操作 */
function toggleFullScreen(flag) {
  if (data.playerList[0]) {
    flag
      ? data.playerList[0].exitFullScreen()
      : data.playerList[0].goFullScreen();
  }
}
/* 获取当前的全屏状态 */
function setFullScreen() {
  if (data.playerList[0]) {
    data.playerConfig.fullScreenFlag = data.playerList[0].isFullScreen();
  }
  setFullScreenConfig(); // 全屏设置
}
/* 全屏时候，设置非video标签全屏，而是父容器全屏，并使用自己的控制条。 */
function setFullScreenConfig() {
  if (data.playerConfig.fullScreenFlag) {
    // 全屏时，将控制条移动到父容器中
    const divDom = document.getElementById('video0');
    const controlDom = document.getElementById('controlBar');
    if (divDom) divDom.appendChild(controlDom);
  } else {
    // 取消全屏时，将控制条移动到外层div
    const divDom = document.getElementById('commonVideoPlayer');
    const controlDom = document.getElementById('controlBar');
    if (divDom) divDom.appendChild(controlDom);
  }
}
/* 获取主播放器的视频总时长 */
function setDuration() {
  if (data.playerList[0]) {
    data.playerConfig.duration = data.playerList[0].getDuration();
    var time = utilsTime.formatTime(data.playerConfig.duration);
    emit('totalTime', time);
  }
}
/* 获取视频当前播放的时间 */
function setCurrentTime() {
  if (data.playerList[0]) {
    data.playerConfig.currentTime = data.playerList[0].currentTime;
    var time = utilsTime.formatTime(data.playerConfig.currentTime);
    emit('currentTime', time);
  }
  if (!props.isLive && data.playerList[0]) {
    // 获取总时间
    const duration = data.playerList[0].getDuration();
    duration && setDuration();
  }
}
/* 刷新当前页面，出于浏览器政策，会阻止视频的自动播放，所以设置个播放样式，更美观。 */
function refreshPlayer() {
  if (data.playerList[0] && data.playerList[0].paused && data.refreshFlag) {
    const vDom = document.getElementById('video0');
    data.playerList[0].showRestart(vDom, data.play);
    data.playerConfig.pauseFlag = true;
  }
}
/* 格式化标题名称 */
function filterPlayerTitle(player) {
  if (player) {
    return player.camera && this.playerCamera[player.camera]
      ? this.playerCamera[player.camera]
      : player.camera || '暂无名称';
  } else {
    return '暂无名称';
  }
}
// 视频播放结束
function handlePlayEnd() {
  data.playerConfig.pauseFlag = true;
  data.isShowControlBar = true;
  data.playerList.forEach((player) => {
    // 全部暂停
    if (player) player.pause();
    pause();
  });
}
// 展示进度条
function showControlBar() {
  if (data.playerList.length) {
    // if (!data.playerList[0].fileUrl) return false; // 没有资源，不展示进度条
    if (data.playerConfig.pauseFlag) return false;
    if (data.controlBarTimer) clearTimeout(data.controlBarTimer);
    data.isShowControlBar = true;
    data.controlBarTimer = setTimeout(() => {
      data.isShowControlBar = data.playerConfig.pauseFlag;
    }, 3000);
  }
}
// 鼠标焦点在进度条上或者视频暂停或者结束播放时，始终展示进度条
function stillShowControlBar() {
  if (data.playerConfig.pauseFlag) return false;
  if (data.controlBarTimer) clearTimeout(data.controlBarTimer);
  data.isShowControlBar = true;
}
// 改变当前播放进度
function changeTime(time) {
  data.playerConfig.pauseFlag = false;
  data.playerList.forEach((player) => {
    if (player) player.setCurrentTime(time);
    if (data.playerList[0].paused) {
      data.playerList[0].play();
    }
  });
}

onMounted(() => {
  resizeHandle();
  window.addEventListener('resize', resizeHandle);
  playInit();
});
onBeforeUnmount(() => {
  // 注销播放器
  data.playerList.forEach((player) => {
    if (player) {
      if (props.isLive) {
        player.dispose();
      } else {
        player.destroy();
      }
    }
  });
  window.removeEventListener('resize', resizeHandle);
});
</script>

<style lang="scss" scoped>
@import './videoPlayer.scss';
</style>
