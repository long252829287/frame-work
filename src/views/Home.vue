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
type TileColor = 'blue' | 'purple' | 'teal' | 'orange' | 'pink' | 'slate'
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
  { key: 'notes', title: '笔记', subtitle: 'Notes', icon: '📝', size: 'w', color: 'purple', route: '/notes', requiresAuth: true },
  { key: 'cred', title: '凭据', subtitle: 'Credentials', icon: '🔐', size: 'l', color: 'teal', route: '/credentials', requiresAuth: true },
  { key: 'study', title: '学习记录', subtitle: 'Study Records', icon: '📚', size: 'm', color: 'blue', route: '/study', requiresAuth: true },
  { key: 'login', title: '登录', subtitle: 'Sign in', icon: '🔑', size: 's', color: 'blue', route: '/login' },
  { key: 'register', title: '注册', subtitle: 'Create', icon: '🆕', size: 's', color: 'orange', route: '/register' },
  { key: 'tasks', title: '任务', subtitle: 'Coming soon', icon: '✅', size: 'm', color: 'slate' },
  { key: 'media', title: '媒体', subtitle: 'Coming soon', icon: '🎬', size: 'm', color: 'pink' },
  { key: 'gallery', title: '相册', subtitle: 'Coming soon', icon: '🖼️', size: 't', color: 'orange' },
  { key: 'analytics', title: '分析', subtitle: 'Coming soon', icon: '📊', size: 'm', color: 'blue' },
  { key: 'tools', title: '工具', subtitle: 'Coming soon', icon: '🧰', size: 's', color: 'teal' },
  { key: 'settings', title: '设置', subtitle: 'Preferences', icon: '⚙️', size: 's', color: 'slate' },
  { key: 'todo', title: '备忘录', subtitle: 'Todo List', icon: '📝', size: 'l', color: 'purple', route: '/todo' },
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
.desktop {
  min-height: 100vh;
  padding: 28px;
  background:
    radial-gradient(1200px 800px at 10% 10%, rgba(99, 102, 241, 0.14) 0%, transparent 60%),
    radial-gradient(1000px 700px at 90% 20%, rgba(56, 189, 248, 0.12) 0%, transparent 60%),
    radial-gradient(1400px 900px at 50% 100%, rgba(244, 114, 182, 0.12) 0%, transparent 70%),
    linear-gradient(180deg, #fbfdff 0%, #f9fbff 40%, #f8f8ff 100%);
}

.start-grid {
  display: grid;
  grid-auto-flow: dense;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
}

.tile {
  position: relative;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  cursor: pointer;
  border-radius: 14px;
  padding: 14px;
  color: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(10px) saturate(120%);
  transform: translateZ(0);
  transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
}

.tile:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.6);
  outline-offset: 2px;
}

.tile:hover {
  transform: translateY(-2px);
  filter: brightness(1.03);
}

.tile:active {
  transform: translateY(0);
  filter: brightness(0.98);
}

.tile__icon {
  font-size: 28px;
  position: absolute;
  top: 12px;
  left: 12px;
}

.tile__text {
  z-index: 1;
}

.tile__title {
  font-weight: 800;
  letter-spacing: 0.3px;
}

.tile__sub {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 2px;
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
  .start-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
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

/* color variants — lighter, youthful pastels */
.tile--blue {
  background: linear-gradient(145deg, rgba(96, 165, 250, 0.45), rgba(59, 130, 246, 0.35));
}

.tile--purple {
  background: linear-gradient(145deg, rgba(167, 139, 250, 0.45), rgba(147, 51, 234, 0.32));
}

.tile--teal {
  background: linear-gradient(145deg, rgba(94, 234, 212, 0.45), rgba(45, 212, 191, 0.32));
}

.tile--orange {
  background: linear-gradient(145deg, rgba(253, 186, 116, 0.48), rgba(251, 146, 60, 0.34));
}

.tile--pink {
  background: linear-gradient(145deg, rgba(244, 114, 182, 0.48), rgba(236, 72, 153, 0.34));
}

.tile--slate {
  background: linear-gradient(145deg, rgba(203, 213, 225, 0.6), rgba(148, 163, 184, 0.4));
}

/* decorative highlight */
.tile::after {
  content: '';
  position: absolute;
  inset: -20% -20% auto auto;
  height: 140px;
  width: 140px;
  background: radial-gradient(80px 80px at 50% 50%, rgba(255, 255, 255, 0.65), transparent 70%);
  filter: blur(14px);
  transform: rotate(25deg);
}
</style>