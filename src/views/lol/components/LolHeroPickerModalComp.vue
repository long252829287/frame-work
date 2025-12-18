<template>
  <teleport to="body">
    <transition name="lol-fade">
      <div v-if="open" class="lol-modal" role="dialog" aria-modal="true" @click.self="close">
        <div class="lol-modal-panel">
          <div class="lol-modal-head">
            <div class="lol-modal-title">选择一个英雄</div>
            <button class="lol-icon-btn" type="button" title="关闭" @click="close">
              <el-icon><Close /></el-icon>
            </button>
          </div>

          <div class="lol-modal-tools">
            <div class="lol-search lol-search--modal">
              <el-icon class="lol-search-icon"><Search /></el-icon>
              <input v-model="heroQuery" class="lol-search-input" placeholder="搜索英雄…" autocomplete="off" />
            </div>
            <div class="lol-filters lol-filters--wrap">
              <button
                v-for="r in roles"
                :key="r.key"
                class="lol-chip"
                :class="{ 'lol-chip--active': heroRoleFilter === r.key }"
                type="button"
                @click="heroRoleFilter = r.key">
                {{ r.label }}
              </button>
            </div>
          </div>

          <div class="lol-modal-grid" aria-label="Champion grid">
            <template v-if="championsLoading && !champions.length">
              <div v-for="n in 12" :key="`c-sk-${n}`" class="lol-champ-card lol-champ-card--skeleton" />
            </template>

            <button
              v-for="c in filteredChampions"
              :key="c._id"
              class="lol-champ-card"
              type="button"
              :class="{ 'lol-champ-card--active': selectedChampionId === c._id }"
              @click="select(c)">
              <img class="lol-champ-img" :src="c.images.square" :alt="c.name" loading="lazy" />
              <div class="lol-champ-name">{{ c.name }}</div>
              <div class="lol-champ-role">{{ primaryRole(c) }}</div>
            </button>

            <div v-if="!championsLoading && filteredChampions.length === 0" class="lol-empty lol-empty--modal">
              <div class="lol-empty-title">未找到英雄</div>
              <div class="lol-empty-sub">请选择其他的关键字</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Close, Search } from '@element-plus/icons-vue'
import type { Champion } from '@/types'

const props = defineProps<{
  open: boolean
  champions: Champion[]
  championsLoading: boolean
  selectedChampionId?: string
  roles: ReadonlyArray<{ key: string; label: string }>
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'select', c: Champion): void
}>()

const heroQuery = ref('')
const heroRoleFilter = ref<string>('all')

watch(
  () => props.open,
  open => {
    if (open) {
      heroQuery.value = ''
      heroRoleFilter.value = 'all'
    }
  },
)

const filteredChampions = computed(() => {
  const q = heroQuery.value.trim().toLowerCase()
  const role = heroRoleFilter.value
  return props.champions
    .filter(c => (role === 'all' ? true : c.tags?.includes(role)))
    .filter(c => {
      if (!q) return true
      const hay = `${c.name} ${c.title} ${c.key} ${c.riotId}`.toLowerCase()
      return hay.includes(q)
    })
})

const primaryRole = (c: Champion) => c.tags?.[0] || '—'

const close = () => emit('update:open', false)
const select = (c: Champion) => {
  emit('select', c)
  close()
}
</script>

<style scoped>
.lol-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.38);
  border: 1px solid rgba(148, 163, 184, 0.16);
  color: rgba(226, 232, 240, 0.92);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
}

.lol-icon-btn:hover {
  transform: translateY(-1px);
  background: rgba(15, 23, 42, 0.5);
  border-color: rgba(56, 189, 248, 0.24);
}

.lol-modal {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.62);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 2100;
}

.lol-modal-panel {
  width: min(980px, 92vw);
  max-height: min(720px, 86vh);
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.7);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
}

.lol-modal-head {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.lol-modal-title {
  font-size: 14px;
  font-weight: 950;
  color: rgba(226, 232, 240, 0.95);
}

.lol-modal-tools {
  padding: 12px 14px;
  display: grid;
  gap: 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.lol-search {
  position: relative;
}

.lol-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(148, 163, 184, 0.75);
}

.lol-search-input {
  width: 100%;
  height: 38px;
  padding: 0 12px 0 38px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(2, 6, 23, 0.26);
  color: rgba(226, 232, 240, 0.92);
  outline: none;
  font-size: 12px;
  font-weight: 700;
  transition: border-color 160ms ease, background 160ms ease;
}

.lol-search-input:focus {
  border-color: rgba(56, 189, 248, 0.35);
  background: rgba(2, 6, 23, 0.4);
}

.lol-search-input::placeholder {
  color: rgba(148, 163, 184, 0.62);
}

.lol-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.lol-chip {
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.24);
  color: rgba(148, 163, 184, 0.9);
  font-size: 12px;
  font-weight: 800;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease, color 160ms ease;
  white-space: nowrap;
}

.lol-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(56, 189, 248, 0.18);
}

.lol-chip--active {
  background: rgba(56, 189, 248, 0.14);
  border-color: rgba(56, 189, 248, 0.28);
  color: rgba(226, 232, 240, 0.95);
}

.lol-modal-grid {
  padding: 12px 14px 14px;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

.lol-champ-card {
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 6, 23, 0.22);
  text-align: left;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.lol-champ-card:hover {
  transform: translateY(-1px);
  border-color: rgba(56, 189, 248, 0.18);
  background: rgba(2, 6, 23, 0.3);
}

.lol-champ-card--active {
  border-color: rgba(56, 189, 248, 0.3);
  background: rgba(56, 189, 248, 0.06);
}

.lol-champ-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.25);
}

.lol-champ-name {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 900;
  color: rgba(226, 232, 240, 0.95);
}

.lol-champ-role {
  margin-top: 2px;
  font-size: 11px;
  color: rgba(148, 163, 184, 0.78);
  font-weight: 700;
}

.lol-champ-card--skeleton {
  height: 140px;
  position: relative;
  overflow: hidden;
  background: rgba(2, 6, 23, 0.18);
}

.lol-champ-card--skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 0%, rgba(226, 232, 240, 0.08) 45%, transparent 90%);
  transform: translateX(-140%);
  animation: lolShimmer 1.2s ease-in-out infinite;
}

@keyframes lolShimmer {
  0% {
    transform: translateX(-140%);
  }
  100% {
    transform: translateX(140%);
  }
}

.lol-empty {
  grid-column: 1 / -1;
  padding: 18px 12px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 6, 23, 0.2);
  text-align: center;
}

.lol-empty-title {
  font-size: 13px;
  font-weight: 900;
  color: rgba(226, 232, 240, 0.95);
}

.lol-empty-sub {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(148, 163, 184, 0.78);
  font-weight: 650;
}

.lol-empty--modal {
  margin-top: 12px;
}

.lol-fade-enter-active,
.lol-fade-leave-active {
  transition: opacity 160ms ease;
}

.lol-fade-enter-from,
.lol-fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .lol-modal-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .lol-modal-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
