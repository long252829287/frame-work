<template>
  <div class="home-page">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">功能模块</h1>
        <p class="page-subtitle">选择你需要的功能</p>
      </div>

      <div class="modules-grid">
        <button
          v-for="t in tiles"
          :key="t.key"
          class="module-card"
          :class="['module-card--' + t.color]"
          type="button"
          @click="handleTile(t)"
        >
          <div class="module-icon" aria-hidden="true">{{ t.icon }}</div>
          <div class="module-content">
            <div class="module-title">{{ t.title }}</div>
            <div v-if="t.subtitle" class="module-subtitle">{{ t.subtitle }}</div>
          </div>
        </button>
      </div>
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

type TileColor = 'blue' | 'purple' | 'teal' | 'orange' | 'pink' | 'slate' | 'green'
interface TileItem {
  key: string
  title: string
  subtitle?: string
  icon: string
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
    color: 'purple',
    route: '/notes',
    requiresAuth: true,
  },
  {
    key: 'imageMagic',
    title: '取色器',
    subtitle: 'Image Color Picker',
    icon: '🎨',
    color: 'orange',
    route: '/imageMagic',
  },
  {
    key: 'shareNotes',
    title: '共享笔记',
    subtitle: 'Share Notes',
    icon: '📤',
    color: 'green',
    route: '/shared-notes',
  },
  {
    key: 'cred',
    title: '凭据',
    subtitle: 'Credentials',
    icon: '🔐',
    color: 'teal',
    route: '/credentials',
    requiresAuth: true,
  },
  {
    key: 'lol',
    title: 'lol攻略',
    subtitle: '大乱斗攻略',
    icon: '🎮',
    color: 'pink',
    route: '/lol'
  },
  {
    key: 'tools',
    title: '工具',
    subtitle: 'Coming soon',
    icon: '🧰',
    color: 'blue',
    route: '/tool',
  },
  {
    key: 'settings',
    title: '设置',
    subtitle: 'Preferences',
    icon: '⚙️',
    color: 'slate',
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
.home-page {
  min-height: calc(100vh - var(--header-height));
  padding: var(--spacing-2xl) var(--spacing-lg);
  background: var(--color-bg-secondary);
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-2xl);
  text-align: center;

  .page-title {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-sm);
    letter-spacing: -0.02em;
  }

  .page-subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-normal);
  }
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.module-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--spacing-xl);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 160px;
  text-align: left;
  overflow: hidden;

  /* Remove default button styles */
  font-family: inherit;
  color: inherit;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    opacity: 0.1;
    transition: all var(--transition-base);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: transparent;

    &::before {
      width: 150px;
      height: 150px;
      opacity: 0.15;
    }

    .module-icon {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
  }
}

.module-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  transition: transform var(--transition-base);
  position: relative;
  z-index: 1;
}

.module-content {
  position: relative;
  z-index: 1;
}

.module-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  letter-spacing: -0.01em;
}

.module-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-normal);
}

/* Color variants */
.module-card--blue {
  &::before {
    background: #3B82F6;
  }

  &:hover {
    border-color: #3B82F6;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, var(--color-bg-primary) 100%);
  }
}

.module-card--purple {
  &::before {
    background: #8B5CF6;
  }

  &:hover {
    border-color: #8B5CF6;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, var(--color-bg-primary) 100%);
  }
}

.module-card--teal {
  &::before {
    background: #14B8A6;
  }

  &:hover {
    border-color: #14B8A6;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.03) 0%, var(--color-bg-primary) 100%);
  }
}

.module-card--orange {
  &::before {
    background: #F59E0B;
  }

  &:hover {
    border-color: #F59E0B;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, var(--color-bg-primary) 100%);
  }
}

.module-card--pink {
  &::before {
    background: #EC4899;
  }

  &:hover {
    border-color: #EC4899;
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.03) 0%, var(--color-bg-primary) 100%);
  }
}

.module-card--slate {
  &::before {
    background: #64748B;
  }

  &:hover {
    border-color: #64748B;
    background: linear-gradient(135deg, rgba(100, 116, 139, 0.03) 0%, var(--color-bg-primary) 100%);
  }
}

.module-card--green {
  &::before {
    background: #10B981;
  }

  &:hover {
    border-color: #10B981;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, var(--color-bg-primary) 100%);
  }
}

/* Responsive Design */
@media (max-width: 900px) {
  .modules-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--spacing-md);
  }
}

@media (max-width: 600px) {
  .home-page {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .page-header {
    margin-bottom: var(--spacing-xl);

    .page-title {
      font-size: var(--font-size-3xl);
    }

    .page-subtitle {
      font-size: var(--font-size-base);
    }
  }

  .modules-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .module-card {
    padding: var(--spacing-lg);
    min-height: 140px;
  }

  .module-icon {
    font-size: 2.5rem;
  }

  .module-title {
    font-size: var(--font-size-lg);
  }
}
</style>
