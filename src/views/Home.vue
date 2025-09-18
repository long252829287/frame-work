<template>
  <div class="desktop">
    <div class="start-grid" role="grid" aria-label="start modules">
      <button v-for="t in tiles" :key="t.key" class="tile" :class="['tile--' + t.size, 'tile--' + t.color]"
        type="button" role="button" tabindex="0" @click="handleTile(t)">
        <div class="tile__icon" aria-hidden="true">{{ t.icon }}</div>
        <div class="tile__text">
          <div class="tile__title">{{ t.title }}</div>
          <div v-if="t.subtitle" class="tile__sub">{{ t.subtitle }}</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const isAuthed = computed(() => auth.checkAuth())

type TileSize = 's' | 'm' | 'w' | 't' | 'l'
type TileColor = 'blue' | 'purple' | 'teal' | 'orange' | 'pink' | 'slate' | 'green'
interface TileItem {
  key: string
  title: string
  subtitle?: string
  icon: string
  size: TileSize
  color: TileColor
  route?: string
  requiresAuth?: boolean
}

const tiles: TileItem[] = [
  {
    key: 'notes',
    title: '笔记',
    subtitle: 'Notes',
    icon: '📝',
    size: 'w',
    color: 'purple',
    route: '/notes',
    requiresAuth: true,
  },
  {
    key: 'cred',
    title: '凭据',
    subtitle: 'Credentials',
    icon: '🔐',
    size: 'l',
    color: 'teal',
    route: '/credentials',
    requiresAuth: true,
  },
  {
    key: 'study',
    title: '学习记录',
    subtitle: 'Study Records',
    icon: '📚',
    size: 'm',
    color: 'blue',
    route: '/study',
    requiresAuth: true,
  },
  // {
  //   key: 'login',
  //   title: '登录',
  //   subtitle: 'Sign in',
  //   icon: '🔑',
  //   size: 's',
  //   color: 'blue',
  //   route: '/login',
  // },
  // {
  //   key: 'register',
  //   title: '注册',
  //   subtitle: 'Create',
  //   icon: '🆕',
  //   size: 's',
  //   color: 'orange',
  //   route: '/register',
  // },
  { key: 'tasks', title: '任务', subtitle: 'Coming soon', icon: '✅', size: 'm', color: 'slate' },
  { key: 'media', title: '媒体', subtitle: 'Coming soon', icon: '🎬', size: 'm', color: 'pink' },
  {
    key: 'gallery',
    title: '相册',
    subtitle: 'Coming soon',
    icon: '🖼️',
    size: 't',
    color: 'orange',
  },
  {
    key: 'analytics',
    title: '分析',
    subtitle: 'Coming soon',
    icon: '📊',
    size: 'm',
    color: 'blue',
  },
  {
    key: 'tools',
    title: '工具',
    subtitle: 'Coming soon',
    icon: '🧰',
    size: 's',
    color: 'teal',
    route: '/tool',
  },
  {
    key: 'settings',
    title: '设置',
    subtitle: 'Preferences',
    icon: '⚙️',
    size: 's',
    color: 'slate',
  },
  {
    key: 'todo',
    title: '备忘录',
    subtitle: 'Todo List',
    icon: '📝',
    size: 'l',
    color: 'purple',
    route: '/todo',
  },
  {
    key: 'imageMagic',
    title: '取色器',
    subtitle: 'Image Color Picker',
    icon: '🔄',
    size: 'l',
    color: 'orange',
    route: '/imageMagic',
  },
]

function handleTile(t: TileItem) {
  if (t.route) {
    if (t.requiresAuth && !isAuthed.value) {
      router.push({ name: 'login', query: { redirect: t.route } })
      return
    }
    router.push(t.route)
    return
  }
  window.alert('功能即将上线：' + t.title)
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/themes/theme-manager.scss' as theme;

.desktop {
  min-height: 100vh;
  padding: #{theme.theme-spacing('2xl')};
  padding-top: 90px;
  background: #{theme.theme-bg('bg-primary')};
  @include theme.theme-texture-bg;
  position: relative;

  // 添加星露谷风格的装饰效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 20% 30%, rgba(34, 139, 34, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 50% 80%, rgba(244, 228, 188, 0.15) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  >* {
    position: relative;
    z-index: 1;
  }
}

.start-grid {
  display: grid;
  grid-auto-flow: dense;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: #{theme.theme-spacing('md')};
  max-width: 1200px;
  margin: 0 auto;
}

.tile {
  @include theme.theme-card;
  position: relative;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  cursor: pointer;
  padding: #{theme.theme-spacing('lg')};
  color: #{theme.theme-color('text-primary')};
  transform: translateZ(0);
  transition: transform #{theme.$transition-normal},
  box-shadow #{theme.$transition-normal},
  filter #{theme.$transition-normal};

  // 添加主题纹理效果
  @include theme.theme-texture-bg;
}

.tile:focus-visible {
  outline: 2px solid #{theme.theme-color('accent-green')};
  outline-offset: 2px;
}

.tile:hover {
  transform: translateY(-2px) scale(1.02);
  filter: brightness(1.05);
  box-shadow: inset 0 2px 4px #{theme.$shadow-light},
  0 8px 20px #{theme.$shadow-card};
}

.tile:active {
  transform: translateY(0) scale(0.98);
  filter: brightness(0.95);
}

.tile__icon {
  font-size: 28px;
  position: absolute;
  top: #{theme.theme-spacing('md')};
  left: #{theme.theme-spacing('md')};
  filter: drop-shadow(2px 2px 4px #{theme.$shadow-dark});
}

.tile__text {
  z-index: 1;
}

.tile__title {
  font-weight: #{theme.$font-weight-bold};
  letter-spacing: 0.3px;
  color: #{theme.theme-color('text-secondary')};
  text-shadow: 1px 1px 2px #{theme.$shadow-light};
}

.tile__sub {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 2px;
  color: #{theme.theme-color('text-secondary')};
}

/* sizes (using grid spans) */
.tile--s {
  grid-column: span 1;
  grid-row: span 1;
  min-height: 120px;
}

.tile--m {
  grid-column: span 2;
  grid-row: span 1;
  min-height: 120px;
}

.tile--w {
  grid-column: span 3;
  grid-row: span 1;
  min-height: 120px;
}

.tile--t {
  grid-column: span 1;
  grid-row: span 2;
  min-height: 252px;
}

.tile--l {
  grid-column: span 2;
  grid-row: span 2;
  min-height: 252px;
}

@media (max-width: 900px) {
  .tile--w {
    grid-column: span 2;
  }
}

@media (max-width: 600px) {
  .desktop {
    padding: #{theme.theme-spacing('lg')};
    padding-top: 80px;
  }

  .start-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: #{theme.theme-spacing('sm')};
  }

  .tile {
    padding: #{theme.theme-spacing('sm')};
  }

  .tile--m,
  .tile--w {
    grid-column: span 1;
  }

  .tile--t,
  .tile--l {
    grid-column: span 1;
    grid-row: span 1;
    min-height: 140px;
  }
}

/* color variants — 星露谷风格配色 */
.tile--blue {
  background: linear-gradient(145deg,
      rgba(56, 168, 237, 0.5) 0%,
      rgba(19, 145, 224, 0.7) 100%);
  border-color: #0e1ab9f7;
}

.tile--purple {
  background: linear-gradient(145deg,
      rgba(236, 188, 154, 0.7) 0%,
      rgba(157, 97, 70, 0.9) 100%);
  border-color: #{theme.theme-color('primary-dark')};
}

.tile--teal {
  background: linear-gradient(145deg,
      rgba(94, 234, 212, 0.45) 0%,
      rgba(45, 212, 191, 0.32) 100%);
  border-color: #{theme.theme-color('secondary-dark')};
}

.tile--orange {
  background: linear-gradient(145deg,
      rgba(253, 186, 116, 0.48) 0%,
      rrgba(251, 146, 60, 0.35) 100%);
  border-color: #{theme.theme-color('accent-orange-dark')};
}

.tile--pink {
  background: linear-gradient(145deg,
      rgba(244, 114, 182, 0.48) 0%,
      rgba(236, 72, 153, 0.34) 100%);
  border-color: #e874ae;
}

.tile--slate {
  background: linear-gradient(145deg,
      rgba(203, 213, 225, 0.9) 0%,
      rgba(148, 163, 184, 1) 100%);
  border-color: #{theme.theme-color('text-secondary')};
}

.tile--green {
  background: linear-gradient(145deg,
      rgba(110, 231, 183, 0.45) 0%,
      rgba(34, 197, 94, 0.35) 100%);
  border-color: #{theme.theme-color('accent-green')};
}

/* 装饰性高光 - 更适合星露谷风格 */
.tile::after {
  content: '';
  position: absolute;
  inset: -20% -20% auto auto;
  height: 140px;
  width: 140px;
  background: radial-gradient(80px 80px at 50% 50%, rgba(244, 228, 188, 0.4), transparent 70%);
  filter: blur(14px);
  transform: rotate(25deg);
  z-index: 0;
}

/* 现代网站优化：减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .tile {
    transition: none;
  }

  .tile:hover {
    transform: none;
    filter: none;
  }
}

/* 现代网站优化：高对比度模式 */
@media (prefers-contrast: high) {
  .tile {
    border-width: 2px;
  }

  .tile__title {
    text-shadow: none;
  }
}
</style>
