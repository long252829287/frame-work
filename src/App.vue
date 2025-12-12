<script setup lang="ts">
import headerComp from './components/header/headerComp.vue'
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'

const route = useRoute()

// 定义不需要显示header的页面
const hideHeaderPages = ['login', 'register', 'lol', 'lol-create', 'lol-strategy-detail']

// 计算是否显示header
const showHeader = computed(() => {
  return !hideHeaderPages.includes(route.name as string)
})

// 计算是否为全屏页面
const isFullScreen = computed(() => {
  return hideHeaderPages.includes(route.name as string)
})

// 获取页面过渡动画名称
const getTransitionName = (currentRoute: RouteLocationNormalized) => {
  // 登录注册页面使用淡入淡出
  if (hideHeaderPages.includes(currentRoute.name as string)) {
    return 'auth-page'
  }
  // 其他页面使用滑动效果
  return 'page-slide'
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-secondary">
    <!-- Header组件 - 条件渲染 -->
    <Transition name="header" appear>
      <headerComp v-if="showHeader" class="flex-shrink-0" />
    </Transition>

    <!-- 主内容区域 -->
    <main class="flex-1" :class="{ 'pt-16': showHeader, 'bg-primary': isFullScreen }">
      <RouterView v-slot="{ Component, route: currentRoute }">
        <!-- 页面过渡动画 -->
        <Transition :name="getTransitionName(currentRoute)" mode="out-in" appear>
          <component :is="Component" :key="currentRoute.path" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style lang="scss" scoped>
/* Header过渡动画 */
.header-enter-active,
.header-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.header-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* 认证页面过渡动画（淡入淡出） */
.auth-page-enter-active,
.auth-page-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.auth-page-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.auth-page-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* 普通页面过渡动画（滑动效果） */
.page-slide-enter-active,
.page-slide-leave-active {
  transition: all 0.3s ease;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Tailwind utility classes mapping */
.bg-secondary {
  background: var(--color-bg-secondary);
}

.bg-primary {
  background: var(--color-bg-primary);
}
</style>
