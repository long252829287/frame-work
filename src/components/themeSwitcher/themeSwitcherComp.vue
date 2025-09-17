<template>
  <div class="theme-switcher">
    <!-- 主题切换按钮 -->
    <el-button
      type="primary"
      @click="showThemeSelector = !showThemeSelector"
      class="theme-toggle-btn"
    >
      🎨 {{ currentTheme.displayName }}
    </el-button>

    <!-- 主题选择器 -->
    <Transition name="theme-selector">
      <div v-if="showThemeSelector" class="theme-selector">
        <div class="theme-selector__header">
          <h3>选择主题风格</h3>
          <el-button
            text
            @click="showThemeSelector = false"
            class="close-btn"
          >
            ×
          </el-button>
        </div>

        <div class="theme-options">
          <div
            v-for="theme in availableThemes"
            :key="theme.name"
            class="theme-option"
            :class="{ 'theme-option--active': currentTheme.name === theme.name }"
            @click="selectTheme(theme.name as ThemeType)"
          >
            <div class="theme-preview" :style="{ backgroundColor: theme.preview }"></div>
            <div class="theme-info">
              <div class="theme-name">{{ theme.displayName }}</div>
              <div class="theme-desc">{{ theme.description }}</div>
            </div>
            <div v-if="currentTheme.name === theme.name" class="theme-check">✓</div>
          </div>
        </div>

        <div class="theme-selector__footer">
          <el-button size="small" @click="nextTheme">快速切换</el-button>
          <el-button size="small" type="info" text>更多主题即将推出...</el-button>
        </div>
      </div>
    </Transition>

    <!-- 背景遮罩 -->
    <div
      v-if="showThemeSelector"
      class="theme-overlay"
      @click="showThemeSelector = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme, type ThemeType } from '@/utils/theme-switcher'

const { getCurrentTheme, setTheme, getAllThemes, nextTheme: switchToNextTheme } = useTheme()

const showThemeSelector = ref(false)

// 计算属性
const currentTheme = computed(() => {
  const themeName = getCurrentTheme()
  return getAllThemes().find(t => t.name === themeName) || getAllThemes()[0]
})

const availableThemes = computed(() => getAllThemes())

// 方法
const selectTheme = (themeName: ThemeType) => {
  setTheme(themeName)
  showThemeSelector.value = false
}

const nextTheme = () => {
  switchToNextTheme()
  showThemeSelector.value = false
}

// 键盘快捷键支持
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + Shift + T 快速切换主题
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
    event.preventDefault()
    switchToNextTheme()
  }

  // ESC 关闭主题选择器
  if (event.key === 'Escape' && showThemeSelector.value) {
    showThemeSelector.value = false
  }
}

// 监听系统主题变化
const handleThemeChange = (event: CustomEvent) => {
  console.log('主题已切换到:', event.detail.theme)
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('themeChanged', handleThemeChange as EventListener)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('themeChanged', handleThemeChange as EventListener)
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/themes/theme-manager.scss' as theme;

.theme-switcher {
  position: relative;
  z-index: theme.$stardew-z-dropdown;
}

.theme-toggle-btn {
  @include theme.theme-button('default');
  gap: 8px;

  &:hover {
    transform: translateY(-1px);
  }
}

.theme-selector {
  @include theme.theme-card;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 320px;
  max-width: 400px;
  z-index: theme.$stardew-z-modal;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 2px solid #{theme.theme-color('border-light')};

    h3 {
      margin: 0;
      color: #{theme.theme-color('text-primary')};
      font-weight: #{theme.$stardew-font-weight-semibold};
      font-size: 1.1rem;
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-top: 2px solid #{theme.theme-color('border-light')};
    background: #{theme.theme-color('secondary-light')};
  }
}

.close-btn {
  color: #{theme.theme-color('text-secondary')};
  font-size: 1.2rem;
  padding: 4px 8px;

  &:hover {
    color: #{theme.theme-color('error')};
    background: rgba(220, 20, 60, 0.1);
  }
}

.theme-options {
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: #{theme.theme-color('secondary-light')};
    transform: translateX(2px);
  }

  &--active {
    background: #{theme.theme-color('secondary-dark')};
    border: 2px solid #{theme.theme-color('accent-green')};
  }
}

.theme-preview {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 2px solid #{theme.theme-color('border-primary')};
  flex-shrink: 0;
  box-shadow: 0 2px 6px #{theme.$stardew-shadow-dark};
}

.theme-info {
  flex: 1;
  min-width: 0;
}

.theme-name {
  font-weight: #{theme.$stardew-font-weight-semibold};
  color: #{theme.theme-color('text-primary')};
  margin-bottom: 2px;
}

.theme-desc {
  font-size: 0.875rem;
  color: #{theme.theme-color('text-secondary')};
  line-height: 1.4;
}

.theme-check {
  color: #{theme.theme-color('accent-green')};
  font-weight: #{theme.$stardew-font-weight-bold};
  font-size: 1.2rem;
}

.theme-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #{theme.theme-bg('bg-overlay')};
  z-index: calc(#{theme.$stardew-z-modal} - 1);
}

// 过渡动画
.theme-selector-enter-active,
.theme-selector-leave-active {
  transition: all #{theme.$stardew-transition-slow};
}

.theme-selector-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.theme-selector-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

// 响应式调整
@media (max-width: 768px) {
  .theme-selector {
    position: fixed;
    top: 50%;
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 350px;
  }

  .theme-selector-enter-from,
  .theme-selector-leave-to {
    transform: translate(-50%, -50%) scale(0.95);
  }
}

// 滚动条样式
.theme-options::-webkit-scrollbar {
  width: 6px;
}

.theme-options::-webkit-scrollbar-track {
  background: #{theme.theme-color('secondary-light')};
  border-radius: 4px;
}

.theme-options::-webkit-scrollbar-thumb {
  background: #{theme.theme-color('border-primary')};
  border-radius: 4px;

  &:hover {
    background: #{theme.theme-color('primary')};
  }
}

/* 现代网站优化：减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .theme-selector-enter-active,
  .theme-selector-leave-active,
  .theme-option {
    transition: none;
  }

  .theme-option:hover {
    transform: none;
  }
}
</style>