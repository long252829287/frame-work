<template>
  <div class="control-bar">
    <!-- 播放、暂停 -->
    <div class="control-play">
      <i
        class="iconfont"
        :class="isPlaying ? 'icon-pause' : 'icon-play'"
        @click="togglePlayback"
      ></i>
    </div>
    <!-- 时间进度显示 -->
    <div class="time-display">
      <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
    </div>
    <!-- 音量控制 -->
    <div class="control-volume">
      <i
        class="iconfont"
        :class="volume === 0 ? 'icon-mute' : 'icon-volume'"
        @click="toggleMuted"
      ></i>
      <div class="volume-slider">
        <el-slider v-model="volume" @change="changVolume" />
      </div>
    </div>
    <!-- 倍速播放 -->
    <div class="control-rate"></div>
    <!-- 全屏显示 -->
    <div class="control-fullscreen" @click.stop="fullScreenOperation">
      <i
        class="iconfont"
        :class="isFullScreen ? 'icon-offFullscreen' : 'icon-fullscreen'"
      ></i>
    </div>
  </div>
</template>
<script>
import { utilsTime } from '../../../utils/utilsTime';
export default {
  name: 'controlBar',
  props: {
    config: {
      // 播放器控制条基础配置信息
      type: Object,
      default() {
        return {};
      },
    },
    isLive: {
      // 当前是否为直播
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  watch: {
    'config.pauseFlag'(flag) {
      this.isPlaying = !flag;
    },
  },
  data() {
    return {
      isPlaying: true,
      volumeBeforMuted: 0, // 静音前音量，关闭静音后恢复音量
      volume: 60, // 音量，默认音量为60%
      controlBar: '',
      observer: {}
    };
  },
  computed: {
    duration() {
      // 播放总时长（单位：秒）
      return this.config.duration;
    },
    currentTime() {
      // 播放进度（单位：秒）
      const startTime = this.config.startTime;
      return (
        startTime + (this.config.currentTime ? this.config.currentTime : 0)
      );
    },
    isFullScreen() {
      // 是否全屏
      return this.config.fullScreenFlag;
    },
  },
  methods: {
    togglePlayback() {
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.$emit('play');
      } else {
        this.$emit('pause');
      }
    },
    // 格式化时间
    formatTime(time) {
      return utilsTime.formatTime(time);
    },
    /* 切换音量 */
    changVolume() {
      this.$emit('setVolume', Number(this.volume / 100).toFixed(1));
    },
    /* 切换是否静音 */
    toggleMuted() {
      if (this.volume === 0) {
        this.volume = this.volumeBeforMuted;
      } else {
        this.volumeBeforMuted = this.volume;
        this.volume = 0;
      }
      this.$emit('setVolume', Number(this.volume / 100).toFixed(1));
    },
    /* 切换全屏 */
    fullScreenOperation() {
      this.$emit('fullScreen', this.isFullScreen);
    },
    createObserver() {
      this.observer = new MutationObserver((mutationsList, observer) => {
        // 遍历每个发生变化的 MutationRecord
        for (const mutation of mutationsList) {
          // 遍历每个被添加到 DOM 中的节点
          for (const node of mutation.addedNodes) {
            // 如果节点是元素节点，并且包含类名为 player-pause-button
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              node.classList.contains('player-pause-button')
            ) {
              // 将 isPlaying 置为 false
              this.isPlaying = false;
              return;
            }
          }
          // 遍历每个从 DOM 中移除的节点
          for (const node of mutation.removedNodes) {
            // 如果节点是元素节点，并且包含类名为 player-pause-button
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              node.classList.contains('player-pause-button')
            ) {
              // 将 isPlaying 置为 true
              this.isPlaying = true;
              return;
            }
          }
        }
      });
      this.observer.observe(document, { childList: true, subtree: true });
    }
  },
  mounted() {
    this.createObserver();
  },
  beforeDestroy() {
    this.observer.disconnect();
  },
};
</script>
<style lang="scss" scope>
.color_red {
  color: #f01400;
}
@mixin display_center {
  display: flex;
  align-items: center;
  @content;
}
.control-bar {
  height: 100%;
  width: 100%;
  @include display_center;
  .control-play {
    margin-left: 12px;
    z-index: 10;
    > i {
      @extend .color_red;
      height: 16px;
      cursor: pointer;
    }
  }
  .time-display {
    margin-left: 40px;
    color: #787d82;
    flex: 1;
    @include display_center {
      justify-content: flex-start;
    }
    > span {
      line-height: 45px;
      font-size: 12px;
    }
  }
  .control-volume {
    @include display_center {
      justify-content: flex-start;
    }
    &:hover {
      > i {
        @extend .color_red;
      }
    }
    > i {
      color: #787d82;
      cursor: pointer;
      margin-right: 10px;
    }
    .volume-slider {
      width: 94px;
      padding: 0 7px;
      .el-slider__runway {
        // 滑块底
        height: 4px;
        background-color: #43474b;
      }
      .el-slider__bar {
        // 滑块
        height: 4px;
        background-color: #f01400;
      }
      .el-slider__button-wrapper {
        // 选中
        top: -10px;
        width: 11px;
        height: 11px;
        .el-slider__button {
          width: 11px;
          height: 11px;
          border: none;
          background-color: #787d82;
        }
      }
    }
  }
  .control-fullscreen {
    width: 32px;
    height: 36px;
    margin-right: 20px;
    @include display_center {
      justify-content: center;
    }
    > i {
      color: #787d82;
      cursor: pointer;
      &:hover {
        color: #fff;
      }
      &:focus {
        text-shadow: 0 0 5px #fff;
      }
    }
  }
}
</style>
