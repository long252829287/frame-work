<template>
  <div class="loading-wrapper">
    <div class="loading-container">
      <div class="loading-text-base">
        {{ text }}
      </div>
      <div class="loading-text-reveal" :style="revealStyle">
        {{ text }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

// 定义组件的 props
const props = defineProps({
  // 允许外部传入自定义的文本
  text: {
    type: String,
    default: 'One moment, the agent is currently loading...',
  },
  // 允许外部传入自定义的动画总时长（秒）
  duration: {
    type: Number,
    default: 4,
  },
  // 允许外部传入自定义的文字显现时长占总时长的比例 (0-1)
  revealRatio: {
    type: Number,
    default: 0.4,
  },
  // 允许外部传入自定义的淡出动画延迟占总时长的比例 (0-1)
  fadeOutDelayRatio: {
    type: Number,
    default: 0.875, // 默认 3.5s / 4s = 0.875
  },
  // 新增: 自定义字体大小
  fontSize: {
    type: String,
    default: '1.2rem',
  },
});

// 计算动画样式，动态设置 CSS 变量
const revealStyle = computed(() => {
  const revealDuration = props.duration * props.revealRatio;
  const fadeOutDelay = props.duration * props.fadeOutDelayRatio;

  return {
    '--reveal-duration': `${revealDuration}s`,
    '--total-duration': `${props.duration}s`,
    '--fade-out-delay': `${fadeOutDelay}s`,
    '--font-size': props.fontSize,
  };
});
</script>

<style scoped>
/* 新增：外部包裹容器，用于实现整体居中 */
.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  /* 确保容器有高度，否则无法垂直居中。这里假设父容器有高度，或者你可以设置 min-height */
  width: 100%;
  height: 100%;
  /* 示例背景色，实际使用时应由父级决定或透明 */
  /* background-color: #1a1a2e; */
}

.loading-container {
  position: relative;
  text-align: left;
  display: inline-block;
  /* 使容器变为行内块，紧贴内容 */
}

/* 提取公共样式变量 */
.loading-container {
  /* Antigravity 风格色彩 */
  /* --text-color-base: rgba(255, 255, 255, 0.1); */
  /* 基础文字颜色，稍微可见一点点 */
  --text-color-reveal: #e0e0ff;
  /* 显现文字颜色，带一点冷色调的白 */
  --text-glow: 0 0 8px rgba(100, 149, 237, 0.6);
  /* 发光效果 */
  /* 更现代、科技感的字体 */
  --font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}


/* 基础文本，用于占位 */
.loading-text-base {
  font-size: var(--font-size);
  /* color: var(--text-color-base); */
  color: transparent;
  /* 保持完全透明 */
  font-family: var(--font-family);
  font-weight: 300;
  /* 更细的字重 */
}

/* 动画文本层，用于显示逐渐显现的文字 */
.loading-text-reveal {
  position: absolute;
  top: 0;
  left: 0;
  font-size: var(--font-size);
  color: var(--text-color-reveal);
  font-family: var(--font-family);
  font-weight: 300;
  /* 更细的字重 */
  white-space: nowrap;
  /* 保持文字在一行 */
  overflow: hidden;
  /* 隐藏未显示的文字 */
  width: 0;
  /* 初始宽度为0 */
  /* 增加文字发光效果 */
  text-shadow: var(--text-glow);

  /* 使用 CSS 变量定义动画 */
  animation:
    reveal-text var(--total-duration) ease-in-out infinite,
    fade-out var(--total-duration) ease-in-out infinite var(--fade-out-delay);
}

/* 关键帧动画：逐渐显现文字 */
@keyframes reveal-text {
  0% {
    width: 0;
  }

  /* 这里的 40% 仍然是硬编码，对应默认的 revealRatio=0.4 */
  40% {
    width: 100%;
  }

  100% {
    width: 100%;
  }
}

/* 关键帧动画：逐渐淡出 */
@keyframes fade-out {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>