<template>
  <div
    class="h-[calc(100vh-1rem)] w-full flex overflow-hidden bg-slate-50 rounded-3xl border-slate-200 my-2 lol-page-bg"
    :style="pageBackgroundStyle">
    <aside
      class="w-24 flex-shrink-0 flex flex-col items-center py-6 gap-4 lol-aside backdrop-blur-2xl border-r border-slate-200/40 overflow-y-auto z-10 scrollbar-hide">
      <template v-if="lolStore.isLoading && lolStore.champions.length === 0">
        <div v-for="n in 8" :key="n" class="w-16 h-16 rounded-2xl lol-champ-skeleton">
          <div class="w-12 h-12 rounded-xl lol-champ-skeleton__inner" />
        </div>
      </template>
      <div v-for="champ in lolStore.champions" v-else :key="champ._id" :ref="(el) => setChampionRef(el, champ)"
        class="lol-champ-item w-16 h-16 flex-shrink-0 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 relative group"
        :class="selectedChampion?._id === champ._id ? 'lol-champ-item--active' : ''" @click="selectChampion(champ)">
        <img :src="champ.images.square"
          class="w-12 h-12 rounded-xl object-cover transition-transform group-hover:scale-110" :alt="champ.name" />
        <span
          class="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
          {{ champ.name }}
        </span>
      </div>
    </aside>

    <main class="flex-1 relative flex overflow-hidden bg-slate-50/50">
      <!-- Floating Actions -->
      <div class="absolute top-6 right-8 flex items-center gap-2 z-20">
        <button class="lol-fab" @click="handleBack" title="返回上一页">
          <el-icon>
            <ArrowLeft />
          </el-icon>
        </button>
        <button class="lol-fab" @click="handleGoHome" title="返回主页">
          <el-icon>
            <HomeFilled />
          </el-icon>
        </button>
        <button class="lol-fab" @click="openSearch" title="搜索英雄">
          <el-icon>
            <Search />
          </el-icon>
        </button>
      </div>

      <!-- Search Overlay -->
      <div v-if="isSearchOpen"
        class="absolute inset-0 z-30 flex items-start justify-center pt-24 bg-slate-900/20 backdrop-blur-sm"
        @click.self="closeSearch">
        <div
          class="w-[min(520px,92vw)] rounded-3xl bg-white/75 backdrop-blur-2xl border border-white/60 shadow-2xl p-5">
          <div class="flex items-center gap-2">
            <div class="flex-1 relative">
              <input ref="searchInputRef" v-model="searchQuery"
                class="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/70 border border-white/70 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/60 outline-none text-slate-800 placeholder:text-slate-400 transition"
                placeholder="请输入英雄名称" @keydown.esc.prevent="closeSearch" />
            </div>
          </div>

          <div v-if="searchQuery.trim().length" class="mt-3 max-h-80 overflow-y-auto scrollbar-hide">
            <div v-if="filteredChampions.length === 0" class="text-center text-sm text-slate-400 py-6">
              未查找到对应英雄
            </div>
            <button v-for="champ in filteredChampions" :key="champ._id"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/60 transition text-left"
              @click="jumpToChampion(champ)">
              <img :src="champ.images.square" class="w-9 h-9 rounded-lg object-cover" />
              <div class="flex-1 min-w-0">
                <div class="font-medium text-slate-800 truncate">{{ champ.name }}</div>
                <div class="text-xs text-slate-500 truncate">{{ champ.title }}</div>
              </div>
              <span class="text-xs text-slate-400">{{ champ.tags?.[0] }}</span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="selectedChampion" class="flex-1 flex gap-8 p-8 h-full w-full">
        <div class="flex-1 flex flex-col h-full overflow-y-auto pr-2 scrollbar-hide">
          <h1 class="text-5xl font-bold text-slate-900 mb-3 tracking-tight">{{ selectedChampion.name }}</h1>
          <div class="mb-8 flex gap-2 overflow-x-auto pb-2">
            <button v-for="strat in strategies" :key="strat._id"
              class="px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-sm border" :class="currentStrategy?._id === strat._id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'"
              @click="currentStrategy = strat">
              {{ strat.title }}
            </button>
          </div>

          <!-- Active Strategy Content -->
          <template v-if="currentStrategy">
            <!-- Win/Ban Rates -->
            <div class="grid grid-cols-2 gap-4 mb-8">
              <div
                class="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm group hover:shadow-md transition-shadow">
                <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Win Rate</div>
                <div class="flex items-baseline gap-2">
                  <div class="text-3xl font-bold text-slate-800">52.4%</div>
                  <div class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">▲ 2.1%</div>
                </div>
              </div>
              <div
                class="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm group hover:shadow-md transition-shadow">
                <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Ban Rate</div>
                <div class="flex items-baseline gap-2">
                  <div class="text-3xl font-bold text-slate-800">12.8%</div>
                  <div class="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">▼ 0.5%</div>
                </div>
              </div>
            </div>

            <!-- Build Path -->
            <div class="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm mb-8 flex-1">
              <h3 class="text-slate-800 font-bold text-lg mb-6 flex items-center gap-2">
                <div class="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
                  <el-icon>
                    <Lightning />
                  </el-icon>
                </div>
                Core Build Path
              </h3>

              <div class="flex flex-col gap-8">
                <!-- Core Items -->
                <div class="flex items-start gap-6">
                  <span class="text-slate-400 text-xs font-bold uppercase tracking-wider w-12 pt-4">Core</span>
                  <div class="flex gap-4 flex-wrap">
                    <div v-for="item in coreItems" :key="item.item._id" class="relative group cursor-help">
                      <div
                        class="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm group-hover:border-indigo-500 transition-colors">
                        <img :src="item.item.image" class="w-14 h-14" />
                      </div>
                      <div
                        class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-slate-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {{ item.item.gold.total }}g
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Runes -->
                <div v-if="currentStrategy.runes" class="flex items-center gap-6 border-t border-slate-100 pt-8">
                  <span class="text-slate-400 text-xs font-bold uppercase tracking-wider w-12">Runes</span>
                  <div class="flex items-center gap-8">
                    <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <img :src="currentStrategy.runes.primaryTreeIcon" class="w-8 h-8 opacity-80" />
                      <div class="flex gap-1.5">
                        <div v-for="rune in currentStrategy.runes.primaryRunes" :key="rune.id"
                          class="w-9 h-9 rounded-full bg-slate-200 shadow-inner flex items-center justify-center p-0.5">
                          <img :src="rune.icon" class="w-full h-full rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <img :src="currentStrategy.runes.secondaryTreeIcon" class="w-6 h-6 opacity-60" />
                      <div class="flex gap-1.5">
                        <div v-for="rune in currentStrategy.runes.secondaryRunes" :key="rune.id"
                          class="w-7 h-7 rounded-full bg-slate-200 shadow-inner flex items-center justify-center p-0.5">
                          <img :src="rune.icon" class="w-full h-full rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <div v-else
            class="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200">
            <p class="text-slate-500 font-medium mb-4">No guides found for this champion</p>
            <el-button type="primary" round class="px-6" @click="handleCreateStrategy">Create First Guide</el-button>
          </div>

        </div>

        <!-- RIGHT COLUMN: Visual Card -->
        <div class="w-[420px] flex-shrink-0 flex flex-col justify-center">
          <div class="relative group">
            <!-- The Card -->
            <div ref="visualCardRef"
              class="relative aspect-[4/5] w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 bg-white select-none">
              <!-- Card Content -->
              <img :src="championSplash" class="absolute inset-0 w-full h-[100%] object-cover mask-gradient" />
            </div>

            <!-- Export Action -->
            <div
              class="absolute -right-6 top-1/2 -translate-y-1/2 translate-x-0 opacity-0 group-hover:translate-x-full group-hover:opacity-100 transition-all duration-300">
              <el-button circle size="large"
                class="!w-14 !h-14 !text-xl !bg-white !text-slate-700 !border-slate-100 shadow-xl hover:!text-indigo-600 hover:!scale-110 transition-transform"
                @click="exportImage">
                <el-icon>
                  <Camera />
                </el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex-1 flex flex-col items-center justify-center text-slate-400">
        <div class="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <img
            src="https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblems/unranked.png"
            class="w-20 opacity-50 grayscale" />
        </div>
        <h3 class="text-xl font-medium text-slate-600">Select a Champion</h3>
        <p class="text-slate-400 text-sm">Choose from the list to view guides</p>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, Lightning, Camera, ArrowLeft, HomeFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useLolStore } from '@/stores/lol'
import { commonService } from '@/service'
import type { Champion, Strategy } from '@/types'
import domToImage from 'dom-to-image'
const router = useRouter()
const lolStore = useLolStore()

const selectedChampion = ref<Champion | null>(null)
const strategies = ref<Strategy[]>([])
const currentStrategy = ref<Strategy | null>(null)
const visualCardRef = ref<HTMLElement | null>(null)
const isSearchOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const championItemMap = new Map<string, HTMLElement>()

// Computed
const championSplash = computed(() => {
  if (!selectedChampion.value) return ''
  // Try to find a high-res loading 'splash' if available in your data, 
  // otherwise fallback to square or build a loading url
  return selectedChampion.value.images.loading || selectedChampion.value.images.square
})

const backgroundPalettes = [
  {
    light: '#e7ebf0',
    mid: '#d8d2db',
    deep: '#c8d6e6',
    glow: '#ffffff',
  },
  {
    light: '#e6f2f4',
    mid: '#d3e6ee',
    deep: '#c9dff2',
    glow: '#ffffff',
  },
  {
    light: '#efe7f5',
    mid: '#e1d7ee',
    deep: '#d6dcf4',
    glow: '#ffffff',
  },
  {
    light: '#f2eee6',
    mid: '#e9dfd2',
    deep: '#e6d8c5',
    glow: '#ffffff',
  },
  {
    light: '#e8f3ea',
    mid: '#d8ecd9',
    deep: '#d0e8e4',
    glow: '#ffffff',
  },
  {
    light: '#e9eef9',
    mid: '#d9e1f3',
    deep: '#d2d8ee',
    glow: '#ffffff',
  },
]

const pickPaletteIndex = (seed: string) => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % backgroundPalettes.length
}

const pageBackgroundStyle = computed(() => {
  const seed = selectedChampion.value?.key?.toString() || selectedChampion.value?._id?.toString() || 'default'
  const palette = backgroundPalettes[pickPaletteIndex(seed)]
  const background = [
    `radial-gradient(900px circle at 70% 10%, ${palette.glow} 0%, transparent 60%)`,
    `radial-gradient(700px circle at 15% 85%, ${palette.glow} 0%, transparent 65%)`,
    `linear-gradient(135deg, ${palette.light} 0%, ${palette.mid} 48%, ${palette.deep} 100%)`,
  ].join(', ')
  return { background }
})

const coreItems = computed(() => {
  if (!currentStrategy.value) return []
  return currentStrategy.value.items.filter(i => i.position < 6)
})

const filteredChampions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return lolStore.champions
    .filter(c => {
      const name = c.name?.toLowerCase() || ''
      const title = c.title?.toLowerCase() || ''
      const key = c.key?.toLowerCase() || ''
      return name.includes(q) || title.includes(q) || key.includes(q)
    })
    .slice(0, 12)
})

// Methods
const init = async () => {
  try {
    if (lolStore.champions.length === 0) {
      await lolStore.initializeData()
    }
    // Select first champion by default to show UI immediately
    if (lolStore.champions.length > 0) {
      selectChampion(lolStore.champions[0])
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'Failed to load data')
  }
}

const selectChampion = async (champ: Champion) => {
  selectedChampion.value = champ
  currentStrategy.value = null
  strategies.value = []

  try {
    const res = await commonService.apiGetStrategies({ championKey: champ.key })
    strategies.value = res.data.data.strategies || []
    // Auto-select first strategy if exists
    if (strategies.value.length > 0) {
      currentStrategy.value = strategies.value[0]
    }
  } catch (e) {
    console.error('Failed to fetch strategies', e)
    strategies.value = []
  }
}

const handleCreateStrategy = () => {
  const championKey = selectedChampion.value?.key
  router.push(
    ({
      name: 'lol-create',
      query: championKey ? { championKey } : undefined,
      ...(selectedChampion.value ? { state: { champion: selectedChampion.value } } : {}),
    }) as any,
  )
}

const handleBack = () => {
  router.back()
}

const handleGoHome = () => {
  router.push({ name: 'home' })
}

const openSearch = () => {
  isSearchOpen.value = true
  nextTick(() => searchInputRef.value?.focus())
}

const closeSearch = () => {
  isSearchOpen.value = false
}

const setChampionRef = (el: any, champ: Champion) => {
  const id = champ._id
  if (el && el instanceof HTMLElement) {
    championItemMap.set(id, el)
  } else {
    championItemMap.delete(id)
  }
}

const jumpToChampion = (champ: Champion) => {
  closeSearch()
  searchQuery.value = ''
  selectChampion(champ)
  nextTick(() => {
    const el = championItemMap.get(champ._id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

const exportImage = () => {
  if (!visualCardRef.value) return

  const node = visualCardRef.value

  ElMessage.info('Generating image...')

  // Wait for images to load just in case (though they should be visible)
  domToImage.toPng(node, {
    quality: 0.95,
    style: {
      transform: 'scale(1)', // Ensure no weird transforms during capture
    }
  })
    .then((dataUrl: string) => {
      const link = document.createElement('a')
      link.download = `${selectedChampion.value?.name}-guide.png`
      link.href = dataUrl
      link.click()
      ElMessage.success('Image exported!')
    })
    .catch((error: any) => {
      console.error('oops, something went wrong!', error)
      ElMessage.error('Failed to export image')
    })
}

onMounted(() => {
  init()
})

watch(isSearchOpen, open => {
  if (open) {
    nextTick(() => searchInputRef.value?.focus())
  }
})

onUnmounted(() => {
  championItemMap.clear()
})
</script>

<style lang="scss" scoped>
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

/* Custom Scrollbar Hide */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

// .mask-gradient {
//   mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
//   -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
// }

.lol-page-bg {
  transition: background 600ms ease;
}

.lol-aside {
  background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.38) 0%,
      rgba(255, 255, 255, 0.22) 55%,
      rgba(255, 255, 255, 0.16) 100%);
  box-shadow:
    inset -1px 0 0 rgba(255, 255, 255, 0.7),
    8px 0 24px rgba(15, 23, 42, 0.06);
}

.lol-fab {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: rgb(71 85 105);
  box-shadow:
    0 8px 20px rgba(15, 23, 42, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transition: transform 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease;
  backdrop-filter: blur(14px);
}

.lol-fab:hover {
  transform: translateY(-2px) scale(1.05);
  background: rgba(255, 255, 255, 0.8);
  color: rgb(67 56 202);
  box-shadow:
    0 12px 28px rgba(99, 102, 241, 0.22),
    0 0 0 1px rgba(99, 102, 241, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 1);
}

.lol-fab:active {
  transform: translateY(0) scale(0.98);
}

.lol-fab--sm {
  width: 36px;
  height: 36px;
  border-radius: 12px;
}

.lol-champ-item {
  position: relative;
  z-index: 0;
  color: rgb(71 85 105);
  background-color: rgba(255, 255, 255, 0.18);
  background-image:
    radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px),
    radial-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px);
  background-size: 6px 6px, 9px 9px;
  background-position: 0 0, 3px 3px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow:
    0 6px 16px rgba(15, 23, 42, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transform: translateZ(0);
}

.lol-champ-item::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 1rem;
  background: conic-gradient(from var(--angle, 0deg),
      rgba(99, 102, 241, 0.95),
      rgba(236, 72, 153, 0.9),
      rgba(14, 165, 233, 0.95),
      rgba(99, 102, 241, 0.95));
  filter: blur(10px);
  opacity: 0;
  transition: opacity 320ms ease;
  z-index: -1;
}

.lol-champ-item:hover {
  color: rgb(15 23 42);
  background-color: rgba(255, 255, 255, 0.28);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px) scale(1.05) rotateZ(-1deg);
  box-shadow:
    0 10px 24px rgba(99, 102, 241, 0.18),
    0 0 0 1px rgba(99, 102, 241, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.lol-champ-item:hover::before {
  opacity: 0.9;
  animation: champGlowSpin 2.2s linear infinite;
}

.lol-champ-item--active {
  color: rgb(67 56 202);
  background-color: rgba(255, 255, 255, 0.5);
  border-color: rgba(99, 102, 241, 0.55);
  transform: translateY(-1px) scale(1.06);
  box-shadow:
    0 12px 30px rgba(99, 102, 241, 0.24),
    0 0 0 2px rgba(99, 102, 241, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.lol-champ-item--active::before {
  opacity: 1;
}

@keyframes champGlowSpin {
  to {
    --angle: 360deg;
  }
}

@media (prefers-reduced-motion: reduce) {

  .lol-champ-item,
  .lol-champ-item:hover,
  .lol-champ-item--active {
    transition: none;
    animation: none;
    transform: none;
  }

  .lol-champ-item::before {
    animation: none;
  }
}

.lol-champ-skeleton {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 6px 16px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.lol-champ-skeleton__inner {
  background: rgba(148, 163, 184, 0.25);
}

.lol-champ-skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg,
      transparent 0%,
      rgba(255, 255, 255, 0.7) 45%,
      transparent 90%);
  transform: translateX(-140%);
  animation: champSkeletonShimmer 1.2s ease-in-out infinite;
}

@keyframes champSkeletonShimmer {
  0% {
    transform: translateX(-140%);
  }

  100% {
    transform: translateX(140%);
  }
}
</style>
