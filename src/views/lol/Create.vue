<template>
  <div class="h-[calc(100vh-1rem)] w-full overflow-hidden rounded-3xl border border-slate-200 my-2 lol-page-bg"
    :style="pageBackgroundStyle">
    <div class="h-full w-full overflow-y-auto scrollbar-hide">
      <div class="mx-auto max-w-[1480px] px-4 sm:px-5 py-6">
        <!-- Header -->
        <div class="flex flex-col gap-4 mb-6">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-4 min-w-0">
              <div class="relative">
                <img v-if="selectedChampion" :src="selectedChampion.images.square"
                  class="w-12 h-12 rounded-xl object-cover border border-white/60 shadow"
                  :alt="selectedChampion.name" />
                <div v-else class="w-12 h-12 rounded-xl bg-white/40 border border-white/60 animate-pulse" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h1 class="text-xl font-bold text-slate-900 tracking-tight truncate">
                    {{ selectedChampion?.name || 'Create Guide' }}
                  </h1>
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/60 border border-white/70 text-slate-600">
                    海克斯大乱斗
                  </span>
                </div>
                <div class="text-slate-500 text-sm truncate">{{ selectedChampion?.title || 'Loading champion…' }}</div>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <button class="lol-fab" @click="handleCancel" title="返回">
                <el-icon>
                  <ArrowLeft />
                </el-icon>
              </button>
              <button class="lol-fab" @click="handleGoHome" title="主页">
                <el-icon>
                  <HomeFilled />
                </el-icon>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div class="md:col-span-4">
              <div class="lol-glass p-3.5">
                <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">攻略名称</div>
                <input v-model="strategyTitle"
                  class="w-full h-10 px-3.5 rounded-xl bg-white/70 border border-white/70 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60 outline-none text-slate-800 placeholder:text-slate-400 transition"
                  placeholder="例如：爆发流 / 生存流 / 控制流…" />
                <div class="mt-2 text-[11px] text-slate-400">
                  留空会自动使用英雄名生成标题
                </div>
              </div>
            </div>
            <div class="md:col-span-8">
              <div class="lol-glass p-3.5">
                <div class="flex items-center justify-between mb-2">
                  <div class="text-xs font-bold uppercase tracking-wider text-slate-500">备注</div>
                  <div class="text-[11px] text-slate-400">建议写打法、节奏、关键选择理由</div>
                </div>
                <textarea v-model="strategyRemark"
                  class="w-full min-h-24 px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/70 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60 outline-none text-slate-800 placeholder:text-slate-400 transition resize-none"
                  placeholder="补充说明：对局思路、强势期、克制关系、强化选择理由…" />
              </div>
            </div>
          </div>
        </div>

        <!-- Main Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <!-- Left: Items -->
          <section class="lg:col-span-8 min-w-0">
            <div class="lol-glass p-4">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
                    出装推荐
                  </h2>
                  <div class="text-sm text-slate-500 mt-1">先选中行，再从下方装备池添加</div>
                </div>
                <button class="lol-pill" @click="clearItems" :disabled="isSubmitting" title="清空出装">
                  清空
                </button>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div class="lol-row" :class="activeItemRow === 'core' ? 'lol-row--active' : ''"
                  @click="selectItemRow('core')">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <div class="text-sm font-semibold text-slate-700">常规出装</div>
                      <span class="lol-badge">6 slots</span>
                    </div>
                    <div class="text-xs text-slate-400">点击格子可定点替换</div>
                  </div>
                  <div class="grid grid-cols-6 gap-2">
                    <button v-for="i in 6" :key="'core-' + i" class="lol-slot"
                      :class="activeItemRow === 'core' && activeItemSlot === i - 1 ? 'lol-slot--active' : ''"
                      @click.stop="selectItemSlot('core', i - 1)">
                      <template v-if="coreItems[i - 1]">
                        <el-tooltip effect="light" placement="top" :show-after="160" :hide-after="80"
                          popper-class="lol-tooltip" :content="formatItemTooltip(coreItems[i - 1]!)">
                          <img :src="coreItems[i - 1]!.image" class="w-full h-full rounded-lg object-cover" />
                        </el-tooltip>
                        <span class="lol-slot__shine" />
                        <button class="lol-slot__remove" title="移除" @click.stop="removeItem('core', i - 1)">
                          <el-icon>
                            <Close />
                          </el-icon>
                        </button>
                      </template>
                      <template v-else>
                        <div class="lol-slot__empty">
                          <el-icon>
                            <Plus />
                          </el-icon>
                        </div>
                      </template>
                    </button>
                  </div>
                </div>

                <div class="lol-row" :class="activeItemRow === 'extra' ? 'lol-row--active' : ''"
                  @click="selectItemRow('extra')">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <div class="text-sm font-semibold text-slate-700">补充出装</div>
                      <span class="lol-badge">6 slots</span>
                    </div>
                    <div class="text-xs text-slate-400">根据对局切换</div>
                  </div>
                  <div class="grid grid-cols-6 gap-2">
                    <button v-for="i in 6" :key="'extra-' + i" class="lol-slot"
                      :class="activeItemRow === 'extra' && activeItemSlot === i - 1 ? 'lol-slot--active' : ''"
                      @click.stop="selectItemSlot('extra', i - 1)">
                      <template v-if="extraItems[i - 1]">
                        <el-tooltip effect="light" placement="top" :show-after="160" :hide-after="80"
                          popper-class="lol-tooltip" :content="formatItemTooltip(extraItems[i - 1]!)">
                          <img :src="extraItems[i - 1]!.image" class="w-full h-full rounded-lg object-cover" />
                        </el-tooltip>
                        <span class="lol-slot__shine" />
                        <button class="lol-slot__remove" title="移除" @click.stop="removeItem('extra', i - 1)">
                          <el-icon>
                            <Close />
                          </el-icon>
                        </button>
                      </template>
                      <template v-else>
                        <div class="lol-slot__empty">
                          <el-icon>
                            <Plus />
                          </el-icon>
                        </div>
                      </template>
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-6">
                <div class="flex items-center justify-between gap-3 mb-3">
                  <div class="flex items-center gap-2">
                    <div class="text-sm font-semibold text-slate-700">装备池</div>
                    <span class="lol-badge">默认：海克斯模式</span>
                  </div>
                  <div class="relative w-[min(320px,60vw)]">
                    <el-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search />
                    </el-icon>
                    <input v-model="itemSearch"
                      class="w-full h-10 pl-10 pr-3 rounded-2xl bg-white/60 border border-white/70 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60 outline-none text-slate-800 placeholder:text-slate-400 transition"
                      placeholder="搜索装备…" />
                  </div>
                </div>

                <div v-if="itemsLoading" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2.5">
                  <div v-for="n in 10" :key="'item-skel-' + n" class="lol-card-skeleton" />
                </div>
                <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2.5">
                  <el-tooltip v-for="item in filteredItems" :key="itemKey(item)" effect="light" placement="top"
                    :show-after="160" :hide-after="80" popper-class="lol-tooltip" :content="formatItemTooltip(item)">
                    <button class="lol-card" :class="isItemSelected(item) ? 'lol-card--selected' : ''"
                      @click="addItem(item)">
                      <img :src="item.image" class="w-11 h-11 rounded-lg object-cover shadow-sm" />
                      <div class="min-w-0">
                        <div class="text-xs font-semibold text-slate-800 truncate">{{ item.name }}</div>
                        <div class="text-[11px] text-slate-500 mt-0.5 truncate">{{ item.gold.total }}g</div>
                      </div>
                      <div v-if="isItemSelected(item)" class="lol-check">已选</div>
                    </button>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </section>

          <!-- Right: Augments -->
          <section class="lg:col-span-4 min-w-0">
            <div class="lol-glass p-4">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
                    海克斯推荐
                  </h2>
                  <div class="text-sm text-slate-500 mt-1">先选中行，再从下方强化池添加</div>
                </div>
                <button class="lol-pill" @click="clearAugments" :disabled="isSubmitting" title="清空海克斯">
                  清空
                </button>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div class="lol-row" :class="activeAugmentTier === 'silver' ? 'lol-row--active' : ''"
                  @click="selectAugmentTier('silver')">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <div class="text-sm font-semibold text-slate-700">银色</div>
                      <span class="lol-badge lol-badge--silver">6 slots</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-6 gap-2">
                    <button v-for="i in 6" :key="'silver-' + i" class="lol-slot lol-slot--augment"
                      :class="activeAugmentTier === 'silver' && activeAugmentSlot === i - 1 ? 'lol-slot--active' : ''"
                      @click.stop="selectAugmentSlot('silver', i - 1)">
                      <template v-if="selectedAugments.silver[i - 1]">
                        <el-tooltip effect="light" placement="top" :show-after="160" :hide-after="80"
                          popper-class="lol-tooltip" :content="formatAugmentTooltip(selectedAugments.silver[i - 1]!)">
                          <img :src="selectedAugments.silver[i - 1]!.icon"
                            class="w-full h-full rounded-lg object-cover" />
                        </el-tooltip>
                        <span class="lol-slot__shine" />
                        <button class="lol-slot__remove" title="移除" @click.stop="removeAugment('silver', i - 1)">
                          <el-icon>
                            <Close />
                          </el-icon>
                        </button>
                      </template>
                      <template v-else>
                        <div class="lol-slot__empty">
                          <el-icon>
                            <Plus />
                          </el-icon>
                        </div>
                      </template>
                    </button>
                  </div>
                </div>

                <div class="lol-row" :class="activeAugmentTier === 'gold' ? 'lol-row--active' : ''"
                  @click="selectAugmentTier('gold')">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <div class="text-sm font-semibold text-slate-700">金色</div>
                      <span class="lol-badge lol-badge--gold">6 slots</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-6 gap-2">
                    <button v-for="i in 6" :key="'gold-' + i" class="lol-slot lol-slot--augment"
                      :class="activeAugmentTier === 'gold' && activeAugmentSlot === i - 1 ? 'lol-slot--active' : ''"
                      @click.stop="selectAugmentSlot('gold', i - 1)">
                      <template v-if="selectedAugments.gold[i - 1]">
                        <el-tooltip effect="light" placement="top" :show-after="160" :hide-after="80"
                          popper-class="lol-tooltip" :content="formatAugmentTooltip(selectedAugments.gold[i - 1]!)">
                          <img :src="selectedAugments.gold[i - 1]!.icon"
                            class="w-full h-full rounded-lg object-cover" />
                        </el-tooltip>
                        <span class="lol-slot__shine" />
                        <button class="lol-slot__remove" title="移除" @click.stop="removeAugment('gold', i - 1)">
                          <el-icon>
                            <Close />
                          </el-icon>
                        </button>
                      </template>
                      <template v-else>
                        <div class="lol-slot__empty">
                          <el-icon>
                            <Plus />
                          </el-icon>
                        </div>
                      </template>
                    </button>
                  </div>
                </div>

                <div class="lol-row" :class="activeAugmentTier === 'prismatic' ? 'lol-row--active' : ''"
                  @click="selectAugmentTier('prismatic')">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <div class="text-sm font-semibold text-slate-700">彩色</div>
                      <span class="lol-badge lol-badge--prismatic">6 slots</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-6 gap-2">
                    <button v-for="i in 6" :key="'prismatic-' + i" class="lol-slot lol-slot--augment"
                      :class="activeAugmentTier === 'prismatic' && activeAugmentSlot === i - 1 ? 'lol-slot--active' : ''"
                      @click.stop="selectAugmentSlot('prismatic', i - 1)">
                      <template v-if="selectedAugments.prismatic[i - 1]">
                        <el-tooltip effect="light" placement="top" :show-after="160" :hide-after="80"
                          popper-class="lol-tooltip"
                          :content="formatAugmentTooltip(selectedAugments.prismatic[i - 1]!)">
                          <img :src="selectedAugments.prismatic[i - 1]!.icon"
                            class="w-full h-full rounded-lg object-cover" />
                        </el-tooltip>
                        <span class="lol-slot__shine" />
                        <button class="lol-slot__remove" title="移除" @click.stop="removeAugment('prismatic', i - 1)">
                          <el-icon>
                            <Close />
                          </el-icon>
                        </button>
                      </template>
                      <template v-else>
                        <div class="lol-slot__empty">
                          <el-icon>
                            <Plus />
                          </el-icon>
                        </div>
                      </template>
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-6">
                <div class="flex items-center justify-between gap-3 mb-3">
                  <div class="flex items-center gap-2">
                    <div class="text-sm font-semibold text-slate-700">强化池</div>
                    <span class="lol-badge">筛选：{{ tierLabel(activeAugmentTier) }}</span>
                  </div>
                  <div class="relative w-[min(280px,60vw)]">
                    <el-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search />
                    </el-icon>
                    <input v-model="augmentSearch"
                      class="w-full h-10 pl-10 pr-3 rounded-2xl bg-white/60 border border-white/70 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60 outline-none text-slate-800 placeholder:text-slate-400 transition"
                      placeholder="搜索强化…" />
                  </div>
                </div>

                <div class="flex gap-2 mb-3">
                  <button class="lol-tab" :class="augmentTierFilter === 'all' ? 'lol-tab--active' : ''"
                    @click="augmentTierFilter = 'all'">
                    全部
                  </button>
                  <button class="lol-tab" :class="augmentTierFilter === 'silver' ? 'lol-tab--active' : ''"
                    @click="augmentTierFilter = 'silver'">
                    银色
                  </button>
                  <button class="lol-tab" :class="augmentTierFilter === 'gold' ? 'lol-tab--active' : ''"
                    @click="augmentTierFilter = 'gold'">
                    金色
                  </button>
                  <button class="lol-tab" :class="augmentTierFilter === 'prismatic' ? 'lol-tab--active' : ''"
                    @click="augmentTierFilter = 'prismatic'">
                    彩色
                  </button>
                </div>

                <div v-if="augmentsLoading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  <div v-for="n in 9" :key="'aug-skel-' + n" class="lol-card-skeleton" />
                </div>
                <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  <el-tooltip v-for="aug in filteredAugments" :key="aug.augmentId" effect="light" placement="top"
                    :show-after="160" :hide-after="80" popper-class="lol-tooltip" :content="formatAugmentTooltip(aug)">
                    <button class="lol-card" :class="isAugmentSelected(aug) ? 'lol-card--selected' : ''"
                      @click="addAugment(aug)">
                      <img :src="aug.icon" class="w-11 h-11 rounded-lg object-cover shadow-sm" />
                      <div class="min-w-0">
                        <div class="text-xs font-semibold text-slate-800 truncate">{{ aug.name }}</div>
                        <div class="text-[11px] text-slate-500 mt-0.5 truncate">{{ tierLabel(getAugmentTier(aug)) }}
                        </div>
                      </div>
                      <div v-if="isAugmentSelected(aug)" class="lol-check">已选</div>
                    </button>
                  </el-tooltip>
                </div>
              </div>

              <div class="mt-6 flex items-center justify-between gap-3">
                <div class="text-xs text-slate-400">
                  提示：至少选择 1 个装备 + 1 个强化才可完成
                </div>
                <button class="lol-primary" :disabled="isSubmitting" @click="submitStrategy">
                  <span v-if="isSubmitting" class="lol-spinner" />
                  {{ isSubmitting ? '提交中…' : '完成' }}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Close, HomeFilled, Plus, Search } from '@element-plus/icons-vue'
import { commonService } from '@/service'
import { useLolStore } from '@/stores/lol'
import type { Augment, Champion, CreateStrategyPayload, Item } from '@/types'

type ItemRow = 'core' | 'extra'
type AugTier = 'silver' | 'gold' | 'prismatic'

const router = useRouter()
const route = useRoute()
const lolStore = useLolStore()

const selectedChampion = ref<Champion | null>(null)

const strategyTitle = ref('')
const strategyRemark = ref('')
const isSubmitting = ref(false)

const itemsLoading = ref(false)
const allItems = ref<Item[]>([])
const itemSearch = ref('')
const activeItemRow = ref<ItemRow>('core')
const activeItemSlot = ref<number | null>(null)
const coreItems = ref<(Item | null)[]>(Array(6).fill(null))
const extraItems = ref<(Item | null)[]>(Array(6).fill(null))

const augmentsLoading = ref(false)
const allAugments = ref<Augment[]>([])
const augmentSearch = ref('')
const augmentTierFilter = ref<'all' | AugTier>('all')
const activeAugmentTier = ref<AugTier>('gold')
const activeAugmentSlot = ref<number | null>(null)
const selectedAugments = ref<Record<AugTier, (Augment | null)[]>>({
  silver: Array(6).fill(null),
  gold: Array(6).fill(null),
  prismatic: Array(6).fill(null),
})

const backgroundPalettes = [
  // cool neutral (screenshot-like)
  { light: '#e7ebf0', mid: '#d8d2db', deep: '#c8d6e6', glow: '#ffffff' },
  { light: '#e9eef9', mid: '#d9e1f3', deep: '#d2d8ee', glow: '#ffffff' },
  // blue/cyan (Mage/Support)
  { light: '#e6f2f4', mid: '#d3e6ee', deep: '#c9dff2', glow: '#ffffff' },
  { light: '#e6f0ff', mid: '#d7e4ff', deep: '#c9d7ff', glow: '#ffffff' },
  // extra cool (Assassin/Marksman)
  { light: '#eaf2ff', mid: '#d8e9ff', deep: '#c7deff', glow: '#ffffff' },
  { light: '#ecf8ff', mid: '#d9f0ff', deep: '#c6e7ff', glow: '#ffffff' },
  // green/teal (Tank)
  { light: '#e8f3ea', mid: '#d8ecd9', deep: '#d0e8e4', glow: '#ffffff' },
  { light: '#e6f5f1', mid: '#d5efe6', deep: '#cde6f2', glow: '#ffffff' },
  // warm/amber (Fighter)
  { light: '#f2eee6', mid: '#e9dfd2', deep: '#e6d8c5', glow: '#ffffff' },
  { light: '#f7efe3', mid: '#f1e1c8', deep: '#ead2bf', glow: '#ffffff' },
]

const pickPaletteIndex = (seed: string) => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(hash) % backgroundPalettes.length
}

const pageBackgroundStyle = computed(() => {
  const seed = selectedChampion.value?.key?.toString() || selectedChampion.value?._id?.toString() || 'default'
  const firstTag = selectedChampion.value?.tags?.[0]
  const tagPaletteGroups: Record<string, number[]> = {
    Assassin: [2, 3, 4, 5],
    Mage: [2, 3, 4],
    Support: [2, 3, 7],
    Tank: [6, 7],
    Fighter: [8, 9],
    Marksman: [1, 3, 5],
  }
  const group = firstTag ? tagPaletteGroups[firstTag] : undefined
  const paletteIndex = group?.length ? group[pickPaletteIndex(seed) % group.length] : pickPaletteIndex(seed)
  const palette = backgroundPalettes[paletteIndex]
  const background = [
    `radial-gradient(900px circle at 70% 10%, ${palette.glow} 0%, transparent 60%)`,
    `radial-gradient(700px circle at 15% 85%, ${palette.glow} 0%, transparent 65%)`,
    `linear-gradient(135deg, ${palette.light} 0%, ${palette.mid} 48%, ${palette.deep} 100%)`,
  ].join(', ')
  return { background }
})

const stripHtml = (input: string) => input.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

const itemKey = (item: Item) => String((item as any)?._id ?? (item as any)?.riotId ?? (item as any)?.name ?? '')

const filteredItems = computed(() => {
  const q = itemSearch.value.trim().toLowerCase()
  const items = allItems.value.filter(i => i.gold?.purchasable !== false)
  if (!q) return items
  return items.filter(i => (i.name || '').toLowerCase().includes(q) || (i.plaintext || '').toLowerCase().includes(q))
})

const getAugmentTier = (aug: Augment): AugTier => {
  const raw = String(aug.tier ?? '').toLowerCase()
  if (raw === 'prismatic' || raw.includes('kprismatic') || raw === '2' || raw === '3') return 'prismatic'
  if (raw === 'gold' || raw.includes('kgold') || raw === '1') return 'gold'
  return 'silver' // 'silver' | '0' | 'ksilver'
}

const tierLabel = (tier: 'all' | AugTier) => {
  if (tier === 'silver') return '银色'
  if (tier === 'gold') return '金色'
  if (tier === 'prismatic') return '彩色'
  return '全部'
}

const filteredAugments = computed(() => {
  const q = augmentSearch.value.trim().toLowerCase()
  let list = allAugments.value
  if (augmentTierFilter.value !== 'all') {
    list = list.filter(a => getAugmentTier(a) === augmentTierFilter.value)
  }
  if (!q) return list
  return list.filter(a => (a.name || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q))
})

const handleCancel = () => router.push({ name: 'lol' })
const handleGoHome = () => router.push({ name: 'home' })

const formatItemTooltip = (item: Item) => {
  const parts = [
    item.name,
    item.plaintext ? `- ${stripHtml(item.plaintext)}` : '',
    item.gold?.total !== undefined ? `价格：${item.gold.total}g` : '',
    item.tags?.length ? `标签：${item.tags.join(' / ')}` : '',
  ].filter(Boolean)
  return parts.join('\n')
}

const selectItemRow = (row: ItemRow) => {
  activeItemRow.value = row
  activeItemSlot.value = null
}

const selectItemSlot = (row: ItemRow, idx: number) => {
  activeItemRow.value = row
  activeItemSlot.value = idx
}

const isItemSelected = (item: Item) => {
  const key = itemKey(item)
  return (
    coreItems.value.some(i => (i ? itemKey(i) : '') === key) ||
    extraItems.value.some(i => (i ? itemKey(i) : '') === key)
  )
}

const removeItem = (row: ItemRow, idx: number) => {
  if (row === 'core') coreItems.value[idx] = null
  else extraItems.value[idx] = null
}

const addItem = (item: Item) => {
  const target = activeItemRow.value === 'core' ? coreItems.value : extraItems.value

  if (activeItemSlot.value !== null) {
    target[activeItemSlot.value] = item
    return
  }

  const empty = target.findIndex(i => !i)
  if (empty === -1) {
    ElMessage.warning('当前行已满，先移除一个再添加')
    return
  }
  target[empty] = item
}

const clearItems = () => {
  coreItems.value = Array(6).fill(null)
  extraItems.value = Array(6).fill(null)
  activeItemSlot.value = null
}

const selectAugmentTier = (tier: AugTier) => {
  activeAugmentTier.value = tier
  activeAugmentSlot.value = null
  augmentTierFilter.value = tier
}

const selectAugmentSlot = (tier: AugTier, idx: number) => {
  activeAugmentTier.value = tier
  activeAugmentSlot.value = idx
}

const isAugmentSelected = (aug: Augment) => {
  return (
    selectedAugments.value.silver.some(a => a?.augmentId === aug.augmentId) ||
    selectedAugments.value.gold.some(a => a?.augmentId === aug.augmentId) ||
    selectedAugments.value.prismatic.some(a => a?.augmentId === aug.augmentId)
  )
}

const removeAugment = (tier: AugTier, idx: number) => {
  selectedAugments.value[tier][idx] = null
}

const addAugment = (aug: Augment) => {
  const tier = getAugmentTier(aug)

  // Enforce tier-only rows (silver->silver, gold->gold, prismatic->prismatic)
  if (activeAugmentTier.value !== tier) {
    activeAugmentTier.value = tier
    activeAugmentSlot.value = null
    augmentTierFilter.value = tier
  }

  const target = selectedAugments.value[tier]
  if (activeAugmentSlot.value !== null) {
    target[activeAugmentSlot.value] = aug
    return
  }

  const empty = target.findIndex(a => !a)
  if (empty === -1) {
    ElMessage.warning(`${tierLabel(tier)}栏已满，先移除一个再添加`)
    return
  }
  target[empty] = aug
}

const formatAugmentTooltip = (aug: Augment) => {
  const parts = [
    aug.name,
    aug.description ? `- ${stripHtml(aug.description)}` : '',
    `稀有度：${tierLabel(getAugmentTier(aug))}`,
    aug.tags?.length ? `标签：${aug.tags.join(' / ')}` : '',
  ].filter(Boolean)
  return parts.join('\n')
}

const clearAugments = () => {
  selectedAugments.value = {
    silver: Array(6).fill(null),
    gold: Array(6).fill(null),
    prismatic: Array(6).fill(null),
  }
  activeAugmentSlot.value = null
}

const submitStrategy = async () => {
  if (!selectedChampion.value) {
    ElMessage.error('英雄信息缺失，请返回重试')
    return
  }

  const hasAnyItems = coreItems.value.some(Boolean) || extraItems.value.some(Boolean)
  if (!hasAnyItems) {
    ElMessage.warning('请至少选择 1 个装备')
    return
  }

  const hasAnyAugments =
    selectedAugments.value.silver.some(Boolean) ||
    selectedAugments.value.gold.some(Boolean) ||
    selectedAugments.value.prismatic.some(Boolean)
  if (!hasAnyAugments) {
    ElMessage.warning('请至少选择 1 个强化')
    return
  }

  isSubmitting.value = true
  try {
    const title = strategyTitle.value.trim() || `${selectedChampion.value.name} · 海克斯大乱斗`
    const description = strategyRemark.value.trim() || `Hex Brawl guide for ${selectedChampion.value.name}`

    const itemPayload = [
      ...coreItems.value
        .map((it, idx) => {
          const itemId = it?._id
          if (!it) return null
          if (!itemId) return { itemId: '', position: idx }
          return { itemId, position: idx }
        })
        .filter(Boolean),
      ...extraItems.value
        .map((it, idx) => {
          const itemId = it?._id
          if (!it) return null
          if (!itemId) return { itemId: '', position: idx + 6 }
          return { itemId, position: idx + 6 }
        })
        .filter(Boolean),
    ] as Array<{ itemId: string; position: number }>

    if (itemPayload.some(i => !i.itemId)) {
      ElMessage.error('装备数据缺少 _id，无法提交，请刷新页面重试')
      return
    }

    const augmentIds = ([
      ...selectedAugments.value.silver,
      ...selectedAugments.value.gold,
      ...selectedAugments.value.prismatic,
    ]
      .filter(Boolean)
      .map(a => (a as Augment).augmentId) as string[]).filter((v, i, arr) => arr.indexOf(v) === i)

    const payload: CreateStrategyPayload = {
      title,
      championId: selectedChampion.value._id,
      items: itemPayload,
      mapType: 'aram',
      mode: 'hex_brawl',
      augmentIds,
      description,
      tags: ['hex_brawl'],
    }

    await commonService.apiCreateStrategy(payload)
    ElMessage.success('攻略创建成功')
    router.push({ name: 'lol', query: { championKey: selectedChampion.value.key } })
  } catch (error: any) {
    console.error('Failed to create strategy:', error)
    ElMessage.error(error?.response?.data?.message || '创建攻略失败')
  } finally {
    isSubmitting.value = false
  }
}

const init = async () => {
  try {
    const championFromState =
      (typeof window !== 'undefined' ? ((window.history.state as any) || {}).champion : undefined) as
      | Champion
      | undefined
    if (championFromState?._id) {
      selectedChampion.value = championFromState
      strategyTitle.value = `${championFromState.name} · 海克斯大乱斗`
    }

    if (lolStore.champions.length === 0) {
      await lolStore.initializeData()
    }

    if (!selectedChampion.value) {
      const key = String(route.query.championKey || '')
      if (key) {
        selectedChampion.value = lolStore.getChampionByKey(key) || null
        if (selectedChampion.value) strategyTitle.value = `${selectedChampion.value.name} · 海克斯大乱斗`
      }
    }

    if (!selectedChampion.value && lolStore.champions.length) {
      selectedChampion.value = lolStore.champions[0]
      strategyTitle.value = `${selectedChampion.value.name} · 海克斯大乱斗`
    }

    // Load hex-brawl item pool
    itemsLoading.value = true
    try {
      const itemsRes = await commonService.apiGetItems({ mode: 'hex_brawl' })
      allItems.value = itemsRes?.data?.data?.items || []
    } finally {
      itemsLoading.value = false
    }

    // Load augments (prefer filtered API, fallback to store list)
    augmentsLoading.value = true
    try {
      const augRes = await commonService.apiGetAugments({ mode: 'hex_brawl', isActive: true, limit: 200 })
      const raw = augRes?.data?.data as any
      const list = Array.isArray(raw) ? raw : raw?.augments
      allAugments.value = (list || []).filter(Boolean)
    } catch {
      allAugments.value = lolStore.augmentList || []
    } finally {
      augmentsLoading.value = false
    }
  } catch (error: any) {
    console.error('Failed to init create page:', error)
    ElMessage.error(error?.message || '初始化失败')
    router.push({ name: 'lol' })
  }
}

onMounted(() => {
  init()
})
</script>

<style lang="scss" scoped>
/* Keep this page self-contained (Index has its own). */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.lol-page-bg {
  transition: background 600ms ease;
}

.lol-glass {
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow:
    0 18px 40px rgba(15, 23, 42, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
}

.lol-pill {
  height: 34px;
  padding: 0 12px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: rgb(71 85 105);
  font-weight: 600;
  font-size: 12px;
  transition: transform 180ms ease, background 180ms ease;
}

.lol-pill:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.75);
}

.lol-pill:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lol-badge {
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: rgb(100 116 139);
  font-size: 11px;
  font-weight: 700;
}

.lol-badge--silver {
  background: rgba(226, 232, 240, 0.65);
}

.lol-badge--gold {
  background: rgba(254, 240, 138, 0.45);
  border-color: rgba(250, 204, 21, 0.35);
}

.lol-badge--prismatic {
  background: rgba(207, 250, 254, 0.6);
  border-color: rgba(0, 122, 255, 0.28);
}

.lol-row {
  padding: 12px;
  border-radius: 1.125rem;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.38);
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
}

.lol-row:hover {
  transform: translateY(-1px);
}

.lol-row--active {
  border-color: rgba(0, 122, 255, 0.45);
  box-shadow:
    0 14px 30px rgba(0, 122, 255, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.lol-slot {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.25);
  box-shadow:
    0 10px 20px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.lol-slot:hover {
  transform: translateY(-2px) scale(1.03);
}

.lol-slot--active {
  border-color: rgba(0, 122, 255, 0.6);
  box-shadow:
    0 14px 26px rgba(0, 122, 255, 0.22),
    0 0 0 2px rgba(0, 122, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.lol-slot--augment.lol-slot--active {
  border-color: rgba(255, 159, 10, 0.55);
  box-shadow:
    0 14px 26px rgba(255, 159, 10, 0.18),
    0 0 0 2px rgba(255, 159, 10, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.lol-slot__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(100, 116, 139, 0.9);
  background:
    radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
    rgba(255, 255, 255, 0.18);
  background-size: 7px 7px;
}

.lol-slot__remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.55);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 160ms ease, transform 160ms ease;
}

.lol-slot:hover .lol-slot__remove {
  opacity: 1;
  transform: translateY(0);
}

.lol-slot__shine {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(400px circle at 10% 0%, rgba(255, 255, 255, 0.55) 0%, transparent 60%);
  pointer-events: none;
}

.lol-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  padding: 10px 10px;
  border-radius: 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.45);
  box-shadow:
    0 10px 22px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  overflow: hidden;
}

.lol-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 14px 28px rgba(0, 122, 255, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.lol-card--selected {
  border-color: rgba(0, 122, 255, 0.5);
  box-shadow:
    0 14px 28px rgba(0, 122, 255, 0.18),
    0 0 0 1px rgba(0, 122, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.lol-check {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 800;
  color: var(--color-accent-primary);
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 122, 255, 0.3);
}

:global(.lol-tooltip) {
  max-width: 340px;
  white-space: pre-line;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(14px);
}

.lol-card-skeleton {
  height: 64px;
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.25);
  overflow: hidden;
  position: relative;
}

.lol-card-skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.75) 45%, transparent 90%);
  transform: translateX(-140%);
  animation: skShimmer 1.2s ease-in-out infinite;
}

@keyframes skShimmer {
  0% {
    transform: translateX(-140%);
  }

  100% {
    transform: translateX(140%);
  }
}

.lol-tab {
  height: 34px;
  padding: 0 12px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: rgb(100, 116, 139);
  font-size: 12px;
  font-weight: 800;
  transition: transform 160ms ease, background 160ms ease;
}

.lol-tab:hover {
  transform: translateY(-1px);
}

.lol-tab--active {
  background: rgba(0, 122, 255, 0.12);
  border-color: rgba(0, 122, 255, 0.4);
  color: var(--color-accent-primary);
}

.lol-primary {
  height: 44px;
  padding: 0 18px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-weight: 800;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.95) 0%, rgba(50, 173, 230, 0.92) 100%);
  box-shadow:
    0 14px 30px rgba(0, 122, 255, 0.28),
    0 0 0 1px rgba(255, 255, 255, 0.35);
  transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
}

.lol-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: saturate(1.05);
  box-shadow:
    0 18px 38px rgba(0, 122, 255, 0.34),
    0 0 0 1px rgba(255, 255, 255, 0.5);
}

.lol-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.lol-spinner {
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: rgba(255, 255, 255, 1);
  animation: spin 900ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  color: var(--color-accent-primary);
  box-shadow:
    0 12px 28px rgba(0, 122, 255, 0.22),
    0 0 0 1px rgba(0, 122, 255, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 1);
}

.lol-fab:active {
  transform: translateY(0) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {

  .lol-page-bg,
  .lol-row,
  .lol-slot,
  .lol-card,
  .lol-primary,
  .lol-card-skeleton::after,
  .lol-spinner {
    transition: none !important;
    animation: none !important;
  }
}
</style>
