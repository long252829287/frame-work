<template>
  <div class="control-bar">
    <!-- 进度条 -->
    <div v-show="!isLive" class="control-process">
      <el-slider
        v-model="current"
        :max="duration"
        :format-tooltip="formatTooltip"
        @change="changeTime"
      />
    </div>
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
    <!-- 倍速 -->
    <div
      v-if="!isLive"
      class="control-rate"
      @mouseenter="playRateActive = true"
      @mouseleave.stop="playRateActive = false"
    >
      <span>{{ currPlayRate.rate === 1 ? '正常' : currPlayRate.label }}</span>
      <transition name="el-zoom-in-bottom">
        <div v-show="playRateActive" class="play-rate-wrapper">
          <div class="play-rate-con">
            <h5>倍速播放</h5>
            <div
              v-for="(rate, index) in playRate"
              :key="index"
              class="each-rate"
              :class="{ 'active-rate': rate.rate === currPlayRate.rate }"
              @click="changePlayRate(rate)"
            >
              {{ rate.label }}
            </div>
          </div>
        </div>
      </transition>
    </div>
    <!-- 全屏显示 -->
    <div class="control-fullscreen" @click.stop="fullScreenOperation">
      <i
        class="iconfont"
        :class="isFullScreen ? 'icon-shrink' : 'icon-enlarge'"
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
  data() {
    return {
      isPlaying: true,
      volumeBeforeMuted: 0, // 静音前音量，关闭静音后恢复音量
      volume: 60, // 音量，默认音量为60%
      controlBar: '',
      playRateActive: false,
      currPlayRate: { rate: 1, label: '1.0x' }, // 当前播放倍速
      playRate: [
        { rate: 2, label: '2.0x' },
        { rate: 1.5, label: '1.5x' },
        { rate: 1.25, label: '1.25x' },
        { rate: 1, label: '1.0x' },
        { rate: 0.5, label: '0.5x' },
      ], // 倍速播放
      observer: {},
      current: 0
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
      return startTime + (this.config.currentTime ? this.config.currentTime : 0);
    },
    isFullScreen() {
      // 是否全屏
      return this.config.fullScreenFlag;
    },
  },
  watch: {
    currentTime(val) {
      this.current = val;
    },
    config: {
      handler(newVal) {
        console.log(newVal);
        this.isPlaying = !newVal.pauseFlag;
        console.log(this.isPlaying);
      },
      deep: true
    }
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
        this.volume = this.volumeBeforeMuted;
      } else {
        this.volumeBeforeMuted = this.volume;
        this.volume = 0;
      }
      this.$emit('setVolume', Number(this.volume / 100).toFixed(1));
    },
    /* 切换全屏 */
    fullScreenOperation() {
      this.$emit('fullScreen', this.isFullScreen);
    },
    /* 播放进度 */
    changeTime(time) {
      this.$emit('changeTime', time);
    },
    /* 倍速播放 */
    changePlayRate(rate) {
      this.currPlayRate = rate;
      this.playRateActive = false;
      this.$emit('playRate', rate);
    },
    formatTooltip(e) {
      return this.formatTime(e);
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
    },
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
  position: relative;
  @include display_center;
  .control-process {
    position: absolute;
    left: 0;
    top: calc(-50% + 4px);
    width: 100%;
  }
  .control-play {
    margin-left: 12px;
    z-index: 10;
    > i {
      @extend .color_red;
      height: 16px;
      font-size: 20px;
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
    }
    @media screen and (max-width: 400px) {
      display: none;
    }
  }
  .control-fullscreen {
    width: 32px;
    margin-right: 20px;
    padding-top: 2px;
    @include display_center {
      justify-content: center;
    }
    > i {
      color: #787d82;
      cursor: pointer;
      font-size: 22px;
      &:hover {
        color: #fff;
      }
      &:focus {
        text-shadow: 0 0 5px #fff;
      }
    }
  }
  .control-rate {
    float: right;
    color: #000;
    background: #93999f;
    border-radius: 4px;
    margin: 0 10px;
    width: 40px;
    height: 20px;
    position: relative;
    z-index: 8;
    @include display_center {
      justify-content: center;
    }
    cursor: pointer;
    > span {
      font-size: 12px;
      font-weight: 600;
    }
    .play-rate-wrapper {
      position: absolute;
      bottom: 32px;
      left: -20px;
      padding-bottom: 10px;
      box-sizing: border-box;
      .play-rate-con {
        width: 80px;
        background: #24272b;
        border-radius: 3px;
        text-align: center;
        padding: 10px 0;
        > h5 {
          padding-bottom: 4px;
          width: 68px;
          box-sizing: border-box;
          color: #fff;
          border-bottom: 2px solid #43474b;
          margin: 0 auto 4px;
          cursor: default;
        }
      }
      .each-rate {
        height: 33px;
        line-height: 33px;
        color: #93999f;
        &:hover {
          background: #43474b;
        }
      }
      .active-rate {
        color: #1890ff;
      }
      &::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 30px;
        height: 0;
        width: 0;
        border: 8px solid transparent;
        border-top-color: #24272b;
      }
    }
  }
}
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
</style>
