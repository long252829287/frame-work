<template>
  <div class="loading-wrapper">
    <div class="loading-container" :style="styleVars">
      <component :is="'style'">{{ keyframesCss }}</component>
      <div class="loading-text-base">
        {{ text }}
      </div>
      <div class="loading-text-reveal">
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
  // 允许外部传入“从有到雾”开始的时间点（占总时长比例，0-1）
  // 不传时默认跟随 revealRatio（即：从无到有结束后立即进入雾化）
  fadeOutDelayRatio: {
    type: Number,
    default: undefined,
  },
  // 新增: 自定义字体大小
  fontSize: {
    type: String,
    default: '1.2rem',
  },
});

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const uid = `loading-${Math.random().toString(36).slice(2, 10)}`;

const revealRatioSafe = computed(() => clamp(props.revealRatio, 0.05, 0.95));
const fogStartRatioSafe = computed(() => {
  const fallback = revealRatioSafe.value;
  const requested = typeof props.fadeOutDelayRatio === 'number' ? clamp01(props.fadeOutDelayRatio) : fallback;
  return clamp(requested, fallback, 0.98);
});

const formatPercent = (ratio: number) => {
  const percent = ratio * 100;
  return `${Math.round(percent * 10) / 10}%`;
};

const keyframesName = computed(() => `${uid}-cycle`);
const keyframesCss = computed(() => {
  const revealEnd = formatPercent(revealRatioSafe.value);
  const fogStart = formatPercent(fogStartRatioSafe.value);

  return `
@keyframes ${keyframesName.value} {
  0% {
    clip-path: inset(0 100% 0 0);
    opacity: 0.95;
    filter: blur(0px);
    transform: translate3d(0, 0, 0);
    letter-spacing: 0em;
  }
  ${revealEnd} {
    clip-path: inset(0 0 0 0);
    opacity: 1;
    filter: blur(0px);
    transform: translate3d(0, 0, 0);
    letter-spacing: 0em;
  }
  ${fogStart} {
    clip-path: inset(0 0 0 0);
    opacity: 1;
    filter: blur(0px);
    transform: translate3d(0, 0, 0);
    letter-spacing: 0em;
  }
  100% {
    clip-path: inset(0 0 0 0);
    opacity: 0;
    filter: blur(10px);
    transform: translate3d(0, -6px, 0);
    letter-spacing: 0.06em;
  }
}
`.trim();
});

// 统一把 CSS 变量挂在 container 上，避免 base/reveal 字号不一致造成抖动
const styleVars = computed(() => {
  return {
    '--total-duration': `${props.duration}s`,
    '--font-size': props.fontSize,
    '--cycle-name': keyframesName.value,
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
  contain: layout paint;
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
  /* 增加文字发光效果 */
  text-shadow: var(--text-glow);
  will-change: clip-path, opacity, filter, transform;
  transform: translate3d(0, 0, 0);

  animation-name: var(--cycle-name);
  animation-duration: var(--total-duration);
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@media (prefers-reduced-motion: reduce) {
  .loading-text-reveal {
    animation: none;
    clip-path: inset(0 0 0 0);
    opacity: 1;
    filter: none;
    transform: none;
    letter-spacing: 0em;
  }
}
</style>
