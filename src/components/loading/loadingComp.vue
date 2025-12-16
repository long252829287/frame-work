<template>
  <Teleport v-if="fullscreen" to="body">
    <Transition name="lc-fade">
      <div
        v-show="visible"
        class="lc-root lc-fullscreen"
        :style="{ zIndex: resolvedZIndex, pointerEvents: blocking ? 'auto' : 'none' }"
        role="status"
        aria-live="polite"
        aria-busy="true">
        <div v-if="dim" class="lc-backdrop" />
        <div class="lc-panel" :class="panelClass">
          <slot>
            <div v-if="showSpinner" class="lc-spinner" :class="spinnerClass" aria-hidden="true" />
            <div v-if="variant === 'reveal'" class="lc-text">
              <div class="lc-text-base">{{ text }}</div>
              <div class="lc-text-reveal" :style="revealStyle">{{ text }}</div>
              <div v-if="subText" class="lc-subtext">{{ subText }}</div>
            </div>
            <div v-else class="lc-text lc-text--plain">
              <div class="lc-text-single">{{ text }}</div>
              <div v-if="subText" class="lc-subtext">{{ subText }}</div>
            </div>
          </slot>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Transition v-else name="lc-fade">
    <div
      v-show="visible"
      class="lc-root"
      :class="{ 'lc-overlay': overlay }"
      :style="{ zIndex: resolvedZIndex, pointerEvents: blocking ? 'auto' : 'none' }"
      role="status"
      aria-live="polite"
      aria-busy="true">
      <div v-if="dim" class="lc-backdrop" />
      <div class="lc-panel" :class="panelClass">
        <slot>
          <div v-if="showSpinner" class="lc-spinner" :class="spinnerClass" aria-hidden="true" />
          <div v-if="variant === 'reveal'" class="lc-text">
            <div class="lc-text-base">{{ text }}</div>
            <div class="lc-text-reveal" :style="revealStyle">{{ text }}</div>
            <div v-if="subText" class="lc-subtext">{{ subText }}</div>
          </div>
          <div v-else class="lc-text lc-text--plain">
            <div class="lc-text-single">{{ text }}</div>
            <div v-if="subText" class="lc-subtext">{{ subText }}</div>
          </div>
        </slot>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

type SpinnerSize = 'sm' | 'md' | 'lg'
type Variant = 'reveal' | 'plain'

const props = withDefaults(
  defineProps<{
    text?: string
    subText?: string
    visible?: boolean
    overlay?: boolean
    fullscreen?: boolean
    blocking?: boolean
    dim?: boolean
    zIndex?: number
    size?: SpinnerSize
    showSpinner?: boolean
    variant?: Variant
    duration?: number
    revealRatio?: number
  }>(),
  {
    text: '加载中…',
    visible: true,
    overlay: false,
    fullscreen: false,
    blocking: true,
    dim: true,
    size: 'md',
    showSpinner: true,
    variant: 'reveal',
    duration: 1.6,
    revealRatio: 1,
  },
)

const resolvedZIndex = computed(() => props.zIndex ?? (props.fullscreen ? 2100 : 50))

// 计算动画样式，动态设置 CSS 变量
const revealStyle = computed(() => {
  const revealDuration = Math.max(0.4, props.duration * Math.min(1, Math.max(0.2, props.revealRatio)))
  return {
    '--reveal-duration': `${revealDuration}s`,
    '--total-duration': `${Math.max(revealDuration, props.duration)}s`,
  } as Record<string, string>
})

const panelClass = computed(() => ({
  'lc-panel--plain': props.variant === 'plain',
}))

const spinnerClass = computed(() => {
  if (props.size === 'sm') return 'lc-spinner--sm'
  if (props.size === 'lg') return 'lc-spinner--lg'
  return 'lc-spinner--md'
})
</script>

<style scoped>
.lc-root {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.lc-fullscreen {
  position: fixed;
  inset: 0;
}

.lc-overlay {
  position: absolute;
  inset: 0;
}

.lc-backdrop {
  position: absolute;
  inset: 0;
  background: var(--overlay-dim, rgba(15, 23, 42, 0.08));
  backdrop-filter: blur(var(--glass-blur, 14px));
}

.lc-panel {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 11px 13px;
  border-radius: var(--radius-lg, 16px);
  background: var(--glass-bg-strong, rgba(255, 255, 255, 0.74));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.72));
  box-shadow: var(--glass-shadow, 0 20px 60px rgba(15, 23, 42, 0.14));
  backdrop-filter: blur(var(--glass-blur, 18px));
  max-width: min(520px, 92vw);
}

.lc-panel--plain {
  background: rgba(255, 255, 255, 0.55);
}

.lc-spinner {
  border-radius: 9999px;
  border: 2px solid color-mix(in srgb, var(--color-accent-primary) 18%, transparent);
  border-top-color: var(--color-accent-primary);
  animation: lc-spin 900ms linear infinite;
}
.lc-spinner--sm {
  width: 14px;
  height: 14px;
}
.lc-spinner--md {
  width: 18px;
  height: 18px;
}
.lc-spinner--lg {
  width: 22px;
  height: 22px;
}

@keyframes lc-spin {
  to {
    transform: rotate(360deg);
  }
}

.lc-text {
  position: relative;
  display: inline-block;
  line-height: 1.1;
}

.lc-text-base {
  font-size: 13px;
  font-weight: 700;
  color: rgba(71, 85, 105, 0.7);
  white-space: pre-line;
}

.lc-text--plain {
  line-height: 1.15;
}

.lc-text-single {
  font-size: 13px;
  font-weight: 750;
  color: rgb(15, 23, 42);
  white-space: pre-line;
}

.lc-text-reveal {
  position: absolute;
  inset: 0;
  font-size: 13px;
  font-weight: 800;
  color: rgb(15, 23, 42);
  white-space: pre-line;
  clip-path: inset(0 100% 0 0);
  animation: lc-reveal var(--reveal-duration) ease-in-out infinite;
}

@keyframes lc-reveal {
  0% {
    clip-path: inset(0 100% 0 0);
    opacity: 0.85;
  }
  60% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}

.lc-subtext {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(71, 85, 105, 0.6);
}

.lc-fade-enter-active,
.lc-fade-leave-active {
  transition: opacity 180ms ease;
}
.lc-fade-enter-from,
.lc-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .lc-spinner,
  .lc-text-reveal {
    animation: none !important;
  }
  .lc-fade-enter-active,
  .lc-fade-leave-active {
    transition: none !important;
  }
}
</style>
