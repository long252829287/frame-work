<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const isAuthed = computed(() => auth.checkAuth())

type TileColor = 'blue' | 'cyan' | 'teal' | 'orange' | 'slate' | 'green'
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
    color: 'blue',
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
    color: 'cyan',
    route: '/lol'
  },
  {
    key: 'tools',
    title: '工具',
    subtitle: 'Coming soon',
    icon: '🧰',
    color: 'slate',
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
  --tile-color: var(--color-accent-primary);

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--spacing-lg);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 160px;
  text-align: left;
  overflow: hidden;
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));

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
    background: var(--tile-color);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: color-mix(in srgb, var(--tile-color) 22%, var(--glass-border-strong));
    background: var(--glass-bg-strong);

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
  font-size: 2.5rem;
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
  --tile-color: var(--color-accent-primary);

  &:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--tile-color) 10%, rgba(255, 255, 255, 0.9)) 0%,
      var(--glass-bg-strong) 100%
    );
  }
}

.module-card--cyan {
  --tile-color: var(--color-accent-secondary);

  &:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--tile-color) 10%, rgba(255, 255, 255, 0.9)) 0%,
      var(--glass-bg-strong) 100%
    );
  }
}

.module-card--teal {
  --tile-color: var(--color-success);

  &:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--tile-color) 10%, rgba(255, 255, 255, 0.9)) 0%,
      var(--glass-bg-strong) 100%
    );
  }
}

.module-card--orange {
  --tile-color: var(--color-accent-tertiary);

  &:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--tile-color) 10%, rgba(255, 255, 255, 0.9)) 0%,
      var(--glass-bg-strong) 100%
    );
  }
}

.module-card--slate {
  --tile-color: var(--color-text-tertiary);

  &:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--tile-color) 10%, rgba(255, 255, 255, 0.9)) 0%,
      var(--glass-bg-strong) 100%
    );
  }
}

.module-card--green {
  --tile-color: var(--color-success);

  &:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--tile-color) 10%, rgba(255, 255, 255, 0.9)) 0%,
      var(--glass-bg-strong) 100%
    );
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
