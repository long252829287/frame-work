<script setup lang="ts">
import headerComp from './components/header/headerComp.vue'
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'

const route = useRoute()

// 定义不需要显示header的页面
const hideHeaderPages = ['login', 'register']

// 定义需要全屏显示的页面（无header无边距）
const fullScreenPages = ['login', 'register']

// 计算是否显示header
const showHeader = computed(() => {
  return !hideHeaderPages.includes(route.name as string)
})

// 计算是否为全屏页面
const isFullScreen = computed(() => {
  return fullScreenPages.includes(route.name as string)
})

// 计算主内容的类名
const mainClasses = computed(() => {
  return {
    'main-content': true,
    'main-content--with-header': showHeader.value,
    'main-content--full-screen': isFullScreen.value
  }
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
  <div class="app-container">
    <!-- Header组件 - 条件渲染 -->
    <Transition name="header" appear>
      <headerComp v-if="showHeader" />
    </Transition>

    <!-- 主内容区域 -->
    <main :class="mainClasses">
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
.app-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

/* 主内容区域 */
.main-content {
  position: relative;
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* 带header的页面布局 */
.main-content--with-header {
  padding-top: var(--header-height);
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding-left: var(--content-padding);
  padding-right: var(--content-padding);
  min-height: calc(100vh - var(--header-height));
  position: relative;
  z-index: 1;
}

/* 全屏页面（登录注册）布局 */
.main-content--full-screen {
  padding: 0;
  max-width: none;
  margin: 0;
  min-height: 100vh;
  background: var(--color-bg-primary);
}

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

/* CSS变量定义 - Layout */
:root {
  --header-height: 64px;
  --content-max-width: 1200px;
  --content-padding: 24px;
}

/* 响应式设计 */
@media (max-width: 1240px) {
  :root {
    --content-padding: 20px;
  }
}

@media (max-width: 768px) {
  :root {
    --header-height: 56px;
    --content-padding: 16px;
  }

  .main-content--with-header {
    padding-top: var(--header-height);
    min-height: calc(100vh - var(--header-height));
  }
}

@media (max-width: 480px) {
  :root {
    --content-padding: 12px;
  }
}

/* Smooth scrolling */
.main-content {
  scroll-behavior: smooth;
}
</style>
