<template>
  <div class="lol-create" :style="pageBackgroundStyle">
    <header class="lol-topbar">
      <div class="lol-topbar-left">
        <div class="lol-breadcrumb">
          <span class="lol-bc-muted">攻略</span>
          <span class="lol-bc-sep">/</span>
          <span>创建</span>
        </div>
      </div>

      <div class="lol-topbar-right">
        <button class="lol-icon-btn" type="button" title="返回上一页" @click="handleCancel">
          <el-icon>
            <ArrowLeft />
          </el-icon>
        </button>
        <button class="lol-icon-btn" type="button" title="返回主页" @click="handleGoHome">
          <el-icon>
            <HomeFilled />
          </el-icon>
        </button>
      </div>
    </header>

    <main class="lol-body">
      <aside class="lol-left">
        <LolBuildPanelComp :selectedChampion="selectedChampion" v-model:strategyTitle="strategyTitle"
          v-model:strategyRemark="strategyRemark" :isSubmitting="isSubmitting" :filledItemCount="filledItemCount"
          :filledAugmentCount="filledAugmentCount" :activeItemRow="activeItemRow"
          :activeCoreItemSlot="activeCoreItemSlot" :activeExtraItemSlot="activeExtraItemSlot" :coreItems="coreItems"
          :extraItems="extraItems" :activeAugmentTier="activeAugmentTier" :activeAugmentSlot="activeAugmentSlot"
          :selectedAugments="selectedAugments" :formatItemTooltip="formatItemTooltip"
          :formatAugmentTooltip="formatAugmentTooltip" @openHeroPicker="heroPickerOpen = true"
          @selectItemRow="selectItemRow" @selectItemSlot="selectItemSlot" @removeItem="removeItem"
          @clearItems="clearItems" @selectAugmentTier="selectAugmentTier" @selectAugmentSlot="selectAugmentSlot"
          @removeAugment="removeAugment" @clearAugments="clearAugments" @submitStrategy="submitStrategy" />
      </aside>

      <section class="lol-right">
        <LolCatalogPanelComp v-model:catalogTab="catalogTab" v-model:catalogSearch="catalogSearch"
          v-model:itemCategoryFilter="itemCategoryFilter" :itemCategories="itemCategories" :augmentTabs="augmentTabs"
          :activeAugmentTier="activeAugmentTier" :itemsLoading="itemsLoading" :augmentsLoading="augmentsLoading"
          :filteredItems="filteredItems" :filteredAugments="filteredAugments" :itemKey="itemKey" :itemShort="itemShort"
          :augmentShort="augmentShort" :getAugmentTier="getAugmentTier" :tierLabel="tierLabel"
          :isItemSelected="isItemSelected" :isAugmentSelected="isAugmentSelected" :formatItemTooltip="formatItemTooltip"
          :formatAugmentTooltip="formatAugmentTooltip" @selectAugmentTier="selectAugmentTier" @addItem="addItem"
          @addAugment="addAugment" />
      </section>
    </main>

    <LolHeroPickerModalComp v-model:open="heroPickerOpen" :champions="champions" :championsLoading="championsLoading"
      :selectedChampionId="selectedChampion?._id" :roles="roles" @select="applyChampion" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, HomeFilled } from '@element-plus/icons-vue'
import { commonService } from '@/service'
import { useLolStore } from '@/stores/lol'
import type { Augment, Champion, CreateStrategyPayload, Item } from '@/types'
import LolBuildPanelComp from './components/LolBuildPanelComp.vue'
import LolCatalogPanelComp from './components/LolCatalogPanelComp.vue'
import LolHeroPickerModalComp from './components/LolHeroPickerModalComp.vue'

type ItemRow = 'core' | 'extra'
type AugTier = 'silver' | 'gold' | 'prismatic'
type CatalogTab = 'items' | 'augments'

const router = useRouter()
const route = useRoute()
const lolStore = useLolStore()

const selectedChampion = ref<Champion | null>(null)

const strategyTitle = ref('')
const strategyRemark = ref('')
const isSubmitting = ref(false)

const catalogTab = ref<CatalogTab>('items')
const catalogSearch = ref('')

const itemsLoading = ref(false)
const allItems = ref<Item[]>([])
const activeItemRow = ref<ItemRow>('core')
const activeCoreItemSlot = ref<number | null>(null)
const activeExtraItemSlot = ref<number | null>(null)
const coreItems = ref<(Item | null)[]>(Array(6).fill(null))
const extraItems = ref<(Item | null)[]>(Array(6).fill(null))

const augmentsLoading = ref(false)
const allAugments = ref<Augment[]>([])
const activeAugmentTier = ref<AugTier>('gold')
const activeAugmentSlot = ref<number | null>(null)
const selectedAugments = ref<Record<AugTier, (Augment | null)[]>>({
  silver: Array(6).fill(null),
  gold: Array(6).fill(null),
  prismatic: Array(6).fill(null),
})

const itemCategories = [
  { key: 'all', label: '全部' },
  { key: 'tank', label: '坦克' },
  { key: 'mage', label: '法师' },
  { key: 'marksman', label: '射手' },
  { key: 'support', label: '辅助' },
] as const
const itemCategoryFilter = ref<(typeof itemCategories)[number]['key']>('all')

const augmentTabs = [
  { key: 'silver', label: '银色' },
  { key: 'gold', label: '金色' },
  { key: 'prismatic', label: '彩色' },
] as const

const heroPickerOpen = ref(false)
const championsLoading = ref(false)
const roles = [
  { key: 'all', label: 'All' },
  { key: 'Fighter', label: 'Fighter' },
  { key: 'Mage', label: 'Mage' },
  { key: 'Tank', label: 'Tank' },
  { key: 'Support', label: 'Support' },
  { key: 'Marksman', label: 'Marksman' },
] as const

const champions = computed(() => lolStore.champions || [])

const handleCancel = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
    return
  }
  router.push({ name: 'lol' })
}
const handleGoHome = () => router.push({ name: 'home' })

const stripHtml = (input: string) => input.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

const itemIdentifier = (item: Item) => {
  const id = String((item as any)?._id || (item as any)?.riotId || '').trim()
  if (id) return id
  const name = String((item as any)?.name || '').trim()
  const image = String((item as any)?.image || '').trim()
  if (!name) return null
  return image ? `${name}|${image}` : name
}

const itemKey = (item: Item) => itemIdentifier(item) || item.name

const itemShort = (item: Item) => {
  const text = stripHtml(item.plaintext || item.description || '')
  if (!text) return '—'
  return text.length > 48 ? `${text.slice(0, 48)}…` : text
}

const augmentShort = (aug: Augment) => {
  const text = stripHtml(aug.description || '')
  if (!text) return '—'
  return text.length > 48 ? `${text.slice(0, 48)}…` : text
}

const getAugmentTier = (aug: Augment): AugTier => {
  const raw = String(aug.tier ?? '').toLowerCase()
  if (raw === 'prismatic' || raw.includes('kprismatic') || raw === '2') return 'prismatic'
  if (raw === 'gold' || raw.includes('kgold') || raw === '1') return 'gold'
  return 'silver'
}

const tierLabel = (tier: AugTier) => {
  if (tier === 'silver') return '银色'
  if (tier === 'gold') return '金色'
  return '彩色'
}

const itemCategory = (item: Item) => {
  const tags = (item.tags || []).map(t => String(t).toLowerCase())
  const has = (...keys: string[]) => keys.some(k => tags.includes(k.toLowerCase()))
  if (has('armor', 'health', 'spellblock')) return 'tank'
  if (has('spelldamage', 'mana', 'magicpenetration')) return 'mage'
  if (has('criticalstrike', 'attackspeed', 'lifesteal', 'damage')) return 'marksman'
  if (has('aura', 'vision', 'cooldownreduction', 'manaregen', 'healthregen')) return 'support'
  return 'all'
}

const filteredItems = computed(() => {
  const q = catalogTab.value === 'items' ? catalogSearch.value.trim().toLowerCase() : ''
  const category = itemCategoryFilter.value
  const list = allItems.value.filter(i => i.gold?.purchasable !== false)
  return list
    .filter(i => (category === 'all' ? true : itemCategory(i) === category))
    .filter(i => {
      if (!q) return true
      return (i.name || '').toLowerCase().includes(q) || (i.plaintext || '').toLowerCase().includes(q)
    })
})

const filteredAugments = computed(() => {
  const q = catalogTab.value === 'augments' ? catalogSearch.value.trim().toLowerCase() : ''
  const tier = activeAugmentTier.value
  const list = allAugments.value.filter(a => getAugmentTier(a) === tier)
  return list.filter(a => {
    if (!q) return true
    return (a.name || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q)
  })
})

const formatItemTooltip = (item: Item) => {
  const parts = [
    item.name,
    item.plaintext ? `- ${stripHtml(item.plaintext)}` : '',
    item.gold?.total !== undefined ? `价格：${item.gold.total}g` : '',
    item.tags?.length ? `标签：${item.tags.join(' / ')}` : '',
  ].filter(Boolean)
  return parts.join('\n')
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

const selectItemRow = (row: ItemRow) => {
  activeItemRow.value = row
  if (row === 'core') activeCoreItemSlot.value = null
  else activeExtraItemSlot.value = null
  if (catalogTab.value !== 'items') catalogTab.value = 'items'
}

const selectItemSlot = (row: ItemRow, idx: number) => {
  activeItemRow.value = row
  if (row === 'core') activeCoreItemSlot.value = idx
  else activeExtraItemSlot.value = idx
  if (catalogTab.value !== 'items') catalogTab.value = 'items'
}

const findSelectedItem = (item: Item) => {
  const id = itemIdentifier(item)
  if (!id) return null
  const coreIdx = coreItems.value.findIndex(i => i && itemIdentifier(i) === id)
  if (coreIdx !== -1) return { row: 'core' as const, idx: coreIdx }
  const extraIdx = extraItems.value.findIndex(i => i && itemIdentifier(i) === id)
  if (extraIdx !== -1) return { row: 'extra' as const, idx: extraIdx }
  return null
}

const isItemSelected = (item: Item) => {
  const pos = findSelectedItem(item)
  return pos?.row === activeItemRow.value
}

const removeItem = (row: ItemRow, idx: number) => {
  if (row === 'core') coreItems.value[idx] = null
  else extraItems.value[idx] = null
  if (row === 'core' && activeCoreItemSlot.value === idx) activeCoreItemSlot.value = null
  if (row === 'extra' && activeExtraItemSlot.value === idx) activeExtraItemSlot.value = null
}

const addItem = (item: Item) => {
  if (catalogTab.value !== 'items') catalogTab.value = 'items'
  const target = activeItemRow.value === 'core' ? coreItems.value : extraItems.value
  const activeSlot = activeItemRow.value === 'core' ? activeCoreItemSlot.value : activeExtraItemSlot.value
  const placeAt = activeSlot ?? target.findIndex(i => !i)
  if (placeAt === -1) {
    ElMessage.warning('当前栏已满，先移除一个再添加')
    return
  }

  const existing = findSelectedItem(item)
  if (existing) {
    if (existing.row !== activeItemRow.value) {
      ElMessage.warning(existing.row === 'core' ? '该装备已在常规出装中' : '该装备已在补充出装中')
      return
    }
    if (existing.idx === placeAt) return
    removeItem(existing.row, existing.idx)
  }

  target[placeAt] = item
}

const clearItems = () => {
  coreItems.value = Array(6).fill(null)
  extraItems.value = Array(6).fill(null)
  activeCoreItemSlot.value = null
  activeExtraItemSlot.value = null
}

const selectAugmentTier = (tier: AugTier) => {
  activeAugmentTier.value = tier
  activeAugmentSlot.value = null
  if (catalogTab.value !== 'augments') catalogTab.value = 'augments'
}

const selectAugmentSlot = (tier: AugTier, idx: number) => {
  activeAugmentTier.value = tier
  activeAugmentSlot.value = idx
  if (catalogTab.value !== 'augments') catalogTab.value = 'augments'
}

const isAugmentSelected = (aug: Augment) => {
  const tier = getAugmentTier(aug)
  if (tier !== activeAugmentTier.value) return false
  return selectedAugments.value[tier].some(a => a?.augmentId === aug.augmentId)
}

const findSelectedAugment = (aug: Augment) => {
  const tier = getAugmentTier(aug)
  const idx = selectedAugments.value[tier].findIndex(a => a?.augmentId === aug.augmentId)
  return idx === -1 ? null : { tier, idx }
}

const removeAugment = (tier: AugTier, idx: number) => {
  selectedAugments.value[tier][idx] = null
  if (activeAugmentTier.value === tier && activeAugmentSlot.value === idx) activeAugmentSlot.value = null
}

const addAugment = (aug: Augment) => {
  if (catalogTab.value !== 'augments') catalogTab.value = 'augments'
  const tier = getAugmentTier(aug)
  if (tier !== activeAugmentTier.value) {
    ElMessage.warning(`这是${tierLabel(tier)}强化，请先切换到对应栏位`)
    return
  }

  const target = selectedAugments.value[tier]
  const placeAt = activeAugmentSlot.value ?? target.findIndex(a => !a)
  if (placeAt === -1) {
    ElMessage.warning(`${tierLabel(tier)}栏已满，先移除一个再添加`)
    return
  }

  const existing = findSelectedAugment(aug)
  if (existing) {
    if (existing.tier === tier && existing.idx === placeAt) return
    removeAugment(existing.tier, existing.idx)
  }

  target[placeAt] = aug
}

const clearAugments = () => {
  selectedAugments.value = {
    silver: Array(6).fill(null),
    gold: Array(6).fill(null),
    prismatic: Array(6).fill(null),
  }
  activeAugmentSlot.value = null
}

const filledItemCount = computed(() => coreItems.value.filter(Boolean).length + extraItems.value.filter(Boolean).length)
const filledAugmentCount = computed(
  () =>
    selectedAugments.value.silver.filter(Boolean).length +
    selectedAugments.value.gold.filter(Boolean).length +
    selectedAugments.value.prismatic.filter(Boolean).length,
)

const submitStrategy = async () => {
  if (!selectedChampion.value) {
    ElMessage.error('英雄信息缺失，请重新选择')
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

  const title = strategyTitle.value.trim() || `${selectedChampion.value.name} · 海克斯大乱斗`
  const description = strategyRemark.value.trim() || `Hex Brawl guide for ${selectedChampion.value.name}`

  const itemPayload = [
    ...coreItems.value.map((it, idx) => (it?._id ? { itemId: it._id, position: idx } : null)).filter(Boolean),
    ...extraItems.value.map((it, idx) => (it?._id ? { itemId: it._id, position: idx + 6 } : null)).filter(Boolean),
  ] as Array<{ itemId: string; position: number }>

  if (!itemPayload.length) {
    ElMessage.error('装备数据缺少 _id，无法提交，请刷新页面重试')
    return
  }

  const augmentIds = ([
    ...selectedAugments.value.silver,
    ...selectedAugments.value.gold,
    ...selectedAugments.value.prismatic,
  ] as Array<Augment | null>)
    .filter(Boolean)
    .map(a => a!.augmentId)

  const payload: CreateStrategyPayload = {
    title,
    description,
    championId: selectedChampion.value._id,
    items: itemPayload,
    mapType: 'aram',
    mode: 'hex_brawl',
    augmentIds,
    tags: ['hex_brawl'],
  }

  isSubmitting.value = true
  try {
    await commonService.apiCreateStrategy(payload)
    ElMessage.success('创建成功')
    router.push({ name: 'lol', query: { championKey: selectedChampion.value.key } })
  } catch (error: any) {
    const msg = error?.response?.data?.message || error?.message || '创建失败'
    if (String(error?.response?.status) === '401') {
      ElMessage.error('请先登录')
      return
    }
    ElMessage.error(msg)
  } finally {
    isSubmitting.value = false
  }
}

const applyChampion = (c: Champion) => {
  const prev = selectedChampion.value
  selectedChampion.value = c
  router.replace({ query: { ...route.query, championKey: c.key } })

  const prevDefault = prev ? `${prev.name} · 海克斯大乱斗` : ''
  if (!strategyTitle.value.trim() || strategyTitle.value.trim() === prevDefault) {
    strategyTitle.value = `${c.name} · 海克斯大乱斗`
  }
}

const backgroundPalettes = [
  { glow: 'rgba(255,255,255,0.07)', a: '#070b12', b: '#0b1222', c: '#0a1b25' }, // cool neutral
  { glow: 'rgba(255,255,255,0.07)', a: '#070b12', b: '#071a2a', c: '#062438' }, // blue
  { glow: 'rgba(255,255,255,0.07)', a: '#070b12', b: '#0a1f22', c: '#052a2b' }, // teal
  { glow: 'rgba(255,255,255,0.07)', a: '#070b12', b: '#1b1422', c: '#251018' }, // warm
  { glow: 'rgba(255,255,255,0.07)', a: '#070b12', b: '#121b22', c: '#1a2219' }, // muted green
  { glow: 'rgba(255,255,255,0.07)', a: '#070b12', b: '#21180f', c: '#1f2514' }, // amber/olive
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
    Assassin: [2, 1],
    Mage: [1, 2],
    Support: [1, 2],
    Tank: [4, 2],
    Fighter: [5, 3],
    Marksman: [1, 0],
  }
  const group = firstTag ? tagPaletteGroups[firstTag] : undefined
  const paletteIndex = group?.length ? group[pickPaletteIndex(seed) % group.length] : pickPaletteIndex(seed)
  const p = backgroundPalettes[paletteIndex]
  const background = [
    `radial-gradient(900px circle at 70% 0%, ${p.glow} 0%, transparent 60%)`,
    `radial-gradient(900px circle at 20% 100%, ${p.glow} 0%, transparent 60%)`,
    `linear-gradient(135deg, ${p.a} 0%, ${p.b} 55%, ${p.c} 100%)`,
  ].join(', ')
  return { background }
})

const init = async () => {
  championsLoading.value = true
  try {
    if (!lolStore.champions.length) await lolStore.initializeData()

    const championFromState =
      (typeof window !== 'undefined' ? ((window.history.state as any) || {}).champion : undefined) as Champion | undefined
    if (championFromState?._id) selectedChampion.value = championFromState

    if (!selectedChampion.value) {
      const key = String(route.query.championKey || '')
      if (key) selectedChampion.value = lolStore.getChampionByKey(key) || null
    }

    if (!selectedChampion.value && lolStore.champions.length) selectedChampion.value = lolStore.champions[0]
    if (selectedChampion.value && !strategyTitle.value.trim()) strategyTitle.value = `${selectedChampion.value.name} · 海克斯大乱斗`

    itemsLoading.value = true
    try {
      const itemsRes = await commonService.apiGetItems({ mode: 'hex_brawl' })
      allItems.value = itemsRes?.data?.data?.items || []
    } finally {
      itemsLoading.value = false
    }

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
  } finally {
    championsLoading.value = false
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped lang="scss">
.lol-create {
  height: calc(100vh - 1rem);
  margin: 0.5rem 0;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  overflow: hidden;
  color: rgba(226, 232, 240, 0.92);
  --accent: #38bdf8;
  --accent2: #f59e0b;
  --glass: rgba(15, 23, 42, 0.55);
  --glass2: rgba(15, 23, 42, 0.42);
  --border: rgba(148, 163, 184, 0.18);
  --text: rgba(226, 232, 240, 0.92);
  --muted: rgba(148, 163, 184, 0.82);
  --muted2: rgba(148, 163, 184, 0.62);
  --shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
}

.lol-topbar {
  height: 56px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(2, 6, 23, 0.52);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  backdrop-filter: blur(14px);
}

.lol-breadcrumb {
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.2px;
  color: rgba(226, 232, 240, 0.9);
}

.lol-bc-muted {
  color: var(--muted2);
}

.lol-bc-sep {
  padding: 0 8px;
  color: rgba(148, 163, 184, 0.45);
}

.lol-topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

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

.lol-body {
  height: calc(100% - 56px);
  display: grid;
  grid-template-columns: minmax(330px, 380px) 1fr;
  gap: 12px;
  padding: 12px;
}

.lol-left,
.lol-right {
  min-width: 0;
}

.lol-left {
  overflow: auto;
  scrollbar-width: none;
}

.lol-left::-webkit-scrollbar {
  display: none;
}

.lol-right {
  overflow: auto;
  scrollbar-width: none;
}

.lol-right::-webkit-scrollbar {
  display: none;
}

@media (max-width: 1024px) {
  .lol-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .lol-topbar {
    padding: 0 10px;
  }
}
</style>
