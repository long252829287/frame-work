<template>
  <div
    class="h-[calc(100vh-1rem)] w-full flex overflow-hidden bg-slate-50 rounded-3xl border-slate-200 my-2 lol-page-bg"
    :style="pageBackgroundStyle">
    <aside
      class="w-24 flex-shrink-0 flex flex-col items-center py-6 gap-4 lol-aside backdrop-blur-2xl border-r border-slate-200/40 overflow-y-auto z-10 scrollbar-hide">
      <div v-for="champ in lolStore.champions" :key="champ._id"
        class="w-16 h-16 flex-shrink-0 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 relative group"
        :class="selectedChampion?._id === champ._id
          ? 'bg-white/70 text-indigo-700 ring-2 ring-indigo-400/70 shadow-md shadow-indigo-100'
          : 'hover:bg-white/35 text-slate-500 hover:text-slate-700'"
        @click="selectChampion(champ)">
        <img :src="champ.images.square"
          class="w-12 h-12 rounded-xl object-cover transition-transform group-hover:scale-110" :alt="champ.name" />
        <span
          class="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
          {{ champ.name }}
        </span>
      </div>
    </aside>

    <main class="flex-1 relative flex overflow-hidden bg-slate-50/50">
      <div v-if="selectedChampion" class="flex-1 flex gap-8 p-8 h-full w-full">
        <div class="flex-1 flex flex-col h-full overflow-y-auto pr-2 scrollbar-hide">
          <h1 class="text-5xl font-bold text-slate-900 mb-3 tracking-tight">{{ selectedChampion.name }}</h1>

          <!-- Strategy Selector -->
          <div class="mb-8 flex gap-2 overflow-x-auto pb-2">
            <button
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-dashed border-slate-300 text-slate-500 hover:border-indigo-500 hover:text-indigo-600 bg-transparent"
              @click="handleCreateStrategy">
              <el-icon>
                <Plus />
              </el-icon>
              Create Guide
            </button>
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
              <img :src="championSplash" class="absolute inset-0 w-full h-[65%] object-cover mask-gradient" />

              <div
                class="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-white via-white/40 to-transparent">
                <div class="relative bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-lg">
                  <h2 class="text-4xl font-bold text-slate-800 mb-1 leading-tight">{{ selectedChampion.name }}</h2>
                  <div class="text-indigo-500 font-medium mb-6 uppercase tracking-wide text-sm">{{
                    selectedChampion.title }}
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-indigo-50 rounded-2xl p-3 text-center">
                      <div class="text-[10px] uppercase tracking-wider text-indigo-400 font-bold mb-1">Difficulty</div>
                      <div class="text-indigo-900 font-bold text-lg">{{ selectedChampion.stats.difficulty }}/10</div>
                    </div>
                    <div class="bg-slate-50 rounded-2xl p-3 text-center">
                      <div class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Class</div>
                      <div class="text-slate-700 font-bold text-lg">{{ selectedChampion.tags[0] }}</div>
                    </div>
                  </div>
                </div>
              </div>
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
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Menu, Plus, Lightning, Camera } from '@element-plus/icons-vue'
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
  router.push('/lol/create')
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
</script>

<style lang="scss" scoped>
/* Custom Scrollbar Hide */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.mask-gradient {
  mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
}

.lol-page-bg {
  transition: background 600ms ease;
}

.lol-aside {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.38) 0%,
    rgba(255, 255, 255, 0.22) 55%,
    rgba(255, 255, 255, 0.16) 100%
  );
  box-shadow:
    inset -1px 0 0 rgba(255, 255, 255, 0.7),
    8px 0 24px rgba(15, 23, 42, 0.06);
}
</style>
