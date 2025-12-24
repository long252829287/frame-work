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
        <section class="lol-panel">
          <div class="lol-field">
            <div class="lol-field-label">攻略名称</div>
            <div class="lol-field-control">
              <input v-model="strategyTitle" class="lol-input" placeholder="e.g. Jinx · Attack Speed Build"
                autocomplete="off" />
            </div>
          </div>

          <div class="lol-hero-card">
            <div class="lol-hero-media">
              <img v-if="selectedChampion" :src="selectedChampion.images.splash || selectedChampion.images.square"
                class="lol-hero-img" :alt="selectedChampion.name" loading="lazy" />
              <div v-else class="lol-hero-img lol-skeleton" />
              <button class="lol-hero-swap" type="button" title="切换英雄" @click="heroPickerOpen = true">
                <el-icon>
                  <Switch />
                </el-icon>
              </button>
            </div>
            <div class="lol-hero-meta">
              <div class="lol-hero-name">{{ selectedChampion?.name || 'Loading…' }}</div>
              <div class="lol-hero-title">{{ selectedChampion?.title || 'Champion' }}</div>
              <div class="lol-hero-pill">海克斯大乱斗</div>
            </div>
          </div>

          <div class="lol-block">
            <div class="lol-block-head">
              <div class="lol-block-title">装备</div>
              <div class="lol-block-sub">{{ filledItemCount }}/12</div>
            </div>

            <div class="lol-segment">
              <button class="lol-seg" :class="{ 'lol-seg--active': activeItemRow === 'core' }" type="button"
                @click="selectItemRow('core')">
                常规装备
              </button>
              <button class="lol-seg" :class="{ 'lol-seg--active': activeItemRow === 'extra' }" type="button"
                @click="selectItemRow('extra')">
                额外可选
              </button>
            </div>

            <div v-if="activeItemRow === 'core'" class="lol-slots">
              <button v-for="(item, idx) in coreItems" :key="`core-${idx}`" class="lol-slot"
                :class="{ 'lol-slot--active': activeItemSlot === idx }" type="button"
                @click="selectItemSlot('core', idx)">
                <template v-if="item">
                  <el-tooltip effect="light" placement="top" :show-after="160" :hide-after="80"
                    popper-class="lol-tooltip" :content="formatItemTooltip(item)">
                    <img class="lol-slot-img" :src="item.image" alt="" />
                  </el-tooltip>
                  <button class="lol-slot-remove" type="button" title="移除" @click.stop="removeItem('core', idx)">
                    <el-icon>
                      <Close />
                    </el-icon>
                  </button>
                </template>
                <template v-else>
                  <span class="lol-slot-plus" aria-hidden="true">+</span>
                </template>
              </button>
            </div>

            <div v-if="activeItemRow === 'extra'" class="lol-slots">
              <button v-for="(item, idx) in extraItems" :key="`extra-${idx}`" class="lol-slot"
                :class="{ 'lol-slot--active': activeItemSlot === idx }" type="button"
                @click="selectItemSlot('extra', idx)">
                <template v-if="item">
                  <el-tooltip effect="light" placement="top" :show-after="160" :hide-after="80"
                    popper-class="lol-tooltip" :content="formatItemTooltip(item)">
                    <img class="lol-slot-img" :src="item.image" alt="" />
                  </el-tooltip>
                  <button class="lol-slot-remove" type="button" title="移除" @click.stop="removeItem('extra', idx)">
                    <el-icon>
                      <Close />
                    </el-icon>
                  </button>
                </template>
                <template v-else>
                  <span class="lol-slot-plus" aria-hidden="true">+</span>
                </template>
              </button>
            </div>

            <div class="lol-block-actions">
              <button class="lol-ghost" type="button" :disabled="isSubmitting" @click="clearItems">清空</button>
            </div>
          </div>

          <div class="lol-block">
            <div class="lol-block-head">
              <div class="lol-block-title">海克斯强化</div>
              <div class="lol-block-sub">{{ filledAugmentCount }}/18</div>
            </div>

            <div class="lol-tier-tabs">
              <button class="lol-tier" type="button" :class="{ 'lol-tier--active': activeAugmentTier === 'silver' }"
                @click="selectAugmentTier('silver')">
                银色
              </button>
              <button class="lol-tier" type="button" :class="{ 'lol-tier--active': activeAugmentTier === 'gold' }"
                @click="selectAugmentTier('gold')">
                金色
              </button>
              <button class="lol-tier" type="button" :class="{ 'lol-tier--active': activeAugmentTier === 'prismatic' }"
                @click="selectAugmentTier('prismatic')">
                彩色
              </button>
            </div>

            <div v-if="activeAugmentTier === 'silver'" class="lol-slots lol-slots--aug">
              <button v-for="(aug, idx) in selectedAugments.silver" :key="`silver-${idx}`"
                class="lol-slot lol-slot--aug" :class="{ 'lol-slot--active': activeAugmentSlot === idx }" type="button"
                @click="selectAugmentSlot('silver', idx)">
                <template v-if="aug">
                  <el-tooltip effect="light" placement="top" :show-after="160" :hide-after="80"
                    popper-class="lol-tooltip" :content="formatAugmentTooltip(aug)">
                    <img class="lol-slot-img" :src="aug.icon" alt="" />
                  </el-tooltip>
                  <button class="lol-slot-remove" type="button" title="移除" @click.stop="removeAugment('silver', idx)">
                    <el-icon>
                      <Close />
                    </el-icon>
                  </button>
                </template>
                <template v-else>
                  <span class="lol-slot-plus" aria-hidden="true">+</span>
                </template>
              </button>
            </div>

            <div v-if="activeAugmentTier === 'gold'" class="lol-slots lol-slots--aug">
              <button v-for="(aug, idx) in selectedAugments.gold" :key="`gold-${idx}`" class="lol-slot lol-slot--aug"
                :class="{ 'lol-slot--active': activeAugmentSlot === idx }" type="button"
                @click="selectAugmentSlot('gold', idx)">
                <template v-if="aug">
                  <el-tooltip effect="light" placement="top" :show-after="160" :hide-after="80"
                    popper-class="lol-tooltip" :content="formatAugmentTooltip(aug)">
                    <img class="lol-slot-img" :src="aug.icon" alt="" />
                  </el-tooltip>
                  <button class="lol-slot-remove" type="button" title="移除" @click.stop="removeAugment('gold', idx)">
                    <el-icon>
                      <Close />
                    </el-icon>
                  </button>
                </template>
                <template v-else>
                  <span class="lol-slot-plus" aria-hidden="true">+</span>
                </template>
              </button>
            </div>

            <div v-if="activeAugmentTier === 'prismatic'" class="lol-slots lol-slots--aug">
              <button v-for="(aug, idx) in selectedAugments.prismatic" :key="`prismatic-${idx}`"
                class="lol-slot lol-slot--aug" :class="{ 'lol-slot--active': activeAugmentSlot === idx }" type="button"
                @click="selectAugmentSlot('prismatic', idx)">
                <template v-if="aug">
                  <el-tooltip effect="light" placement="top" :show-after="160" :hide-after="80"
                    popper-class="lol-tooltip" :content="formatAugmentTooltip(aug)">
                    <img class="lol-slot-img" :src="aug.icon" alt="" />
                  </el-tooltip>
                  <button class="lol-slot-remove" type="button" title="移除"
                    @click.stop="removeAugment('prismatic', idx)">
                    <el-icon>
                      <Close />
                    </el-icon>
                  </button>
                </template>
                <template v-else>
                  <span class="lol-slot-plus" aria-hidden="true">+</span>
                </template>
              </button>
            </div>

            <div class="lol-block-actions">
              <button class="lol-ghost" type="button" :disabled="isSubmitting" @click="clearAugments">清空</button>
            </div>
          </div>

          <div class="lol-stats">
            <div class="lol-stats-title">数据统计</div>
            <div class="lol-stats-grid">
              <div class="lol-stat">
                <div class="lol-stat-k">装备</div>
                <div class="lol-stat-v">{{ filledItemCount }}</div>
              </div>
              <div class="lol-stat">
                <div class="lol-stat-k">强化</div>
                <div class="lol-stat-v">{{ filledAugmentCount }}</div>
              </div>
              <div class="lol-stat">
                <div class="lol-stat-k">模式</div>
                <div class="lol-stat-v">海克斯</div>
              </div>
              <div class="lol-stat">
                <div class="lol-stat-k">地图</div>
                <div class="lol-stat-v">极地大乱斗</div>
              </div>
            </div>
          </div>

          <div class="lol-field">
            <div class="lol-field-label">描述</div>
            <div class="lol-field-control">
              <textarea v-model="strategyRemark" class="lol-textarea" placeholder="解释下有什么特殊玩法吧…" rows="3" />
            </div>
          </div>

          <div class="lol-save">
            <button class="lol-primary" type="button" :disabled="isSubmitting" @click="submitStrategy">
              <span v-if="isSubmitting" class="lol-inline-spin" aria-hidden="true" />
              保存攻略
            </button>
            <div class="lol-save-hint">需要登录,请在登录后新建</div>
          </div>
        </section>
      </aside>

      <!-- Right column -->
      <section class="lol-right">
        <div class="lol-catalog">
          <div class="lol-catalog-head">
            <div class="lol-catalog-title">
              <div class="lol-catalog-h">目录</div>
              <div class="lol-catalog-sub">
                {{ catalogTab === 'items' ? '请为你的攻略选择合适的装备' : '请为你的攻略选择海克斯' }}
              </div>
            </div>

            <div class="lol-catalog-toggle">
              <button class="lol-toggle cursor-pointer" type="button"
                :class="{ 'lol-toggle--active': catalogTab === 'items' }" @click="catalogTab = 'items'">
                装备
              </button>
              <button class="lol-toggle cursor-pointer" type="button"
                :class="{ 'lol-toggle--active': catalogTab === 'augments' }" @click="catalogTab = 'augments'">
                海克斯强化
              </button>
            </div>
          </div>

          <div class="lol-catalog-tools">
            <div class="lol-search">
              <el-icon class="lol-search-icon">
                <Search />
              </el-icon>
              <input v-model="catalogSearch" class="lol-search-input"
                :placeholder="catalogTab === 'items' ? '搜索装备…' : '搜索海克斯…'" autocomplete="off" />
            </div>

            <div class="lol-filters" v-if="catalogTab === 'items'">
              <button v-for="c in itemCategories" :key="c.key" class="lol-chip"
                :class="{ 'lol-chip--active': itemCategoryFilter === c.key }" type="button"
                @click="itemCategoryFilter = c.key">
                {{ c.label }}
              </button>
            </div>

            <div class="lol-filters" v-else>
              <button v-for="t in augmentFilters" :key="t.key" class="lol-chip cursor-pointer"
                :class="{ 'lol-chip--active': augmentTierFilter === t.key }" type="button"
                @click="augmentTierFilter = t.key">
                {{ t.label }}
              </button>
            </div>
          </div>

          <div class="lol-catalog-meta">
            <div class="lol-meta-muted">
              已找到
              <span class="lol-meta-strong">{{ catalogTab === 'items' ? filteredItems.length : filteredAugments.length
              }}</span>
              {{ catalogTab === 'items' ? '个装备' : '个海克斯强化' }}
            </div>
            <div class="lol-meta-muted" v-if="catalogTab === 'augments'">
              当前待添加:
              <span class="lol-meta-strong">{{ tierLabel(activeAugmentTier) }}</span>
            </div>
          </div>

          <div class="lol-grid" v-if="catalogTab === 'items'">
            <template v-if="itemsLoading">
              <div v-for="n in 24" :key="`item-sk-${n}`" class="lol-card lol-card--skeleton" />
            </template>

            <template v-else>
              <button v-for="item in filteredItems" :key="itemIdentifier(item) || item.name" class="lol-card"
                :class="{ 'lol-card--selected': isItemSelected(item) }" type="button" @click="toggleAddItem(item)">
                <img class="lol-card-icon" :src="item.image" :alt="item.name" loading="lazy" />
                <div class="lol-card-body">
                  <div class="lol-card-title">{{ item.name }}</div>
                  <div class="lol-card-sub">{{ item.gold?.total }}g · {{ itemShort(item) }}</div>
                </div>
                <div v-if="isItemSelected(item)" class="lol-card-badge">已选</div>
              </button>

              <div v-if="!filteredItems.length" class="lol-empty">
                <div class="lol-empty-title">未找到对应装备</div>
                <div class="lol-empty-sub">请输入其他关键字。</div>
              </div>
            </template>
          </div>

          <div class="lol-grid" v-else>
            <template v-if="augmentsLoading">
              <div v-for="n in 24" :key="`aug-sk-${n}`" class="lol-card lol-card--skeleton" />
            </template>

            <template v-else>
              <button v-for="aug in filteredAugments" :key="aug.augmentId" class="lol-card"
                :class="{ 'lol-card--selected': isAugmentSelected(aug) }" type="button" @click="addAugment(aug)">
                <img class="lol-card-icon lol-card-icon--aug" :src="aug.icon" :alt="aug.name" loading="lazy" />
                <div class="lol-card-body">
                  <div class="lol-card-title">{{ aug.name }}</div>
                  <div class="lol-card-sub">{{ tierLabel(getAugmentTier(aug)) }}</div>
                </div>
                <div v-if="isAugmentSelected(aug)" class="lol-card-badge">已选</div>
              </button>

              <div v-if="!filteredAugments.length" class="lol-empty">
                <div class="lol-empty-title">未找到对应的海克斯强化</div>
                <div class="lol-empty-sub">请选择其他的关键字。</div>
              </div>
            </template>
          </div>
        </div>
      </section>
    </main>

    <teleport to="body">
      <transition name="lol-fade">
        <div v-if="heroPickerOpen" class="lol-modal" role="dialog" aria-modal="true"
          @click.self="heroPickerOpen = false">
          <div class="lol-modal-panel">
            <div class="lol-modal-head">
              <div class="lol-modal-title">选择一个英雄</div>
              <button class="lol-icon-btn" type="button" title="关闭" @click="heroPickerOpen = false">
                <el-icon>
                  <Close />
                </el-icon>
              </button>
            </div>

            <div class="lol-modal-tools">
              <div class="lol-search lol-search--modal">
                <el-icon class="lol-search-icon">
                  <Search />
                </el-icon>
                <input v-model="heroQuery" class="lol-search-input" placeholder="Search champion…" autocomplete="off" />
              </div>
              <div class="lol-filters lol-filters--wrap">
                <button v-for="r in roles" :key="r.key" class="lol-chip"
                  :class="{ 'lol-chip--active': heroRoleFilter === r.key }" type="button"
                  @click="heroRoleFilter = r.key">
                  {{ r.label }}
                </button>
              </div>
            </div>

            <div class="lol-modal-grid" aria-label="Champion grid">
              <template v-if="championsLoading && !champions.length">
                <div v-for="n in 12" :key="`c-sk-${n}`" class="lol-champ-card lol-champ-card--skeleton" />
              </template>

              <button v-for="c in filteredChampions" :key="c._id" class="lol-champ-card" type="button"
                :class="{ 'lol-champ-card--active': selectedChampion?._id === c._id }" @click="applyChampion(c)">
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Close, HomeFilled, Search, Switch } from '@element-plus/icons-vue'
import { commonService } from '@/service'
import { useLolStore } from '@/stores/lol'
import type { Augment, Champion, CreateStrategyPayload, Item } from '@/types'

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
const activeItemSlot = ref<number | null>(null)
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

const augmentFilters = [
  { key: 'all', label: '全部' },
  { key: 'silver', label: '银色' },
  { key: 'gold', label: '金色' },
  { key: 'prismatic', label: '彩色' },
] as const
const augmentTierFilter = ref<(typeof augmentFilters)[number]['key']>('all')

const heroPickerOpen = ref(false)
const championsLoading = ref(false)
const heroQuery = ref('')
const heroRoleFilter = ref<string>('all')
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
  const id = String((item as any)?._id || (item as any)?.riotId || (item as any)?.name || '')
  return id.trim() ? id : null
}

const itemShort = (item: Item) => {
  const text = stripHtml(item.plaintext || item.description || '')
  if (!text) return '—'
  return text.length > 48 ? `${text.slice(0, 48)}…` : text
}

const getAugmentTier = (aug: Augment): AugTier => {
  const raw = String(aug.rarity ?? aug.tier ?? '').toLowerCase()
  if (raw === 'prismatic' || raw.includes('kprismatic') || raw === '2') return 'prismatic'
  if (raw === 'gold' || raw.includes('kgold') || raw === '1') return 'gold'
  return 'silver'
}

const tierLabel = (tier: 'all' | AugTier) => {
  if (tier === 'silver') return '银色'
  if (tier === 'gold') return '金色'
  if (tier === 'prismatic') return '彩色'
  return 'All'
}

const primaryRole = (c: Champion) => c.tags?.[0] || '—'

const filteredChampions = computed(() => {
  const q = heroQuery.value.trim().toLowerCase()
  const role = heroRoleFilter.value
  return champions.value
    .filter(c => (role === 'all' ? true : c.tags?.includes(role)))
    .filter(c => {
      if (!q) return true
      const hay = `${c.name} ${c.title} ${c.key} ${c.riotId}`.toLowerCase()
      return hay.includes(q)
    })
})

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
  // .filter(i => {
  //   return i.isLegendary === true
  // })
})

const filteredAugments = computed(() => {
  const q = catalogTab.value === 'augments' ? catalogSearch.value.trim().toLowerCase() : ''
  let list = allAugments.value
  if (augmentTierFilter.value !== 'all') {
    list = list.filter(a => getAugmentTier(a) === augmentTierFilter.value)
  }
  return list.filter(a => {
    if (!q) return true
    return (a.name || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q)
  })
})

const formatItemTooltip = (item: Item) => {
  const parts = [
    item.name,
    item.plaintext ? `- ${stripHtml(item.plaintext)}` : '',
    item.gold?.total !== undefined ? `Price: ${item.gold.total}g` : '',
    item.tags?.length ? `Tags: ${item.tags.join(' / ')}` : '',
  ].filter(Boolean)
  return parts.join('\n')
}

const formatAugmentTooltip = (aug: Augment) => {
  const parts = [
    aug.name,
    aug.description ? `- ${stripHtml(aug.description)}` : '',
    `Tier: ${tierLabel(getAugmentTier(aug))}`,
    aug.tags?.length ? `Tags: ${aug.tags.join(' / ')}` : '',
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
  const id = itemIdentifier(item)
  if (!id) return false
  return !!findSelectedItem(item)
}

const removeItem = (row: ItemRow, idx: number) => {
  if (row === 'core') coreItems.value[idx] = null
  else extraItems.value[idx] = null
  if (activeItemRow.value === row && activeItemSlot.value === idx) activeItemSlot.value = null
}

const toggleAddItem = (item: Item) => {
  if (catalogTab.value !== 'items') catalogTab.value = 'items'
  const target = activeItemRow.value === 'core' ? coreItems.value : extraItems.value

  const existing = findSelectedItem(item)
  const placeAt = activeItemSlot.value ?? target.findIndex(i => !i)
  if (placeAt === -1) {
    ElMessage.warning('Selected row is full. Remove one slot first.')
    return
  }

  if (existing) {
    // 如果已在当前激活行中，则重复点击视为取消选中：只删除原项并返回，不添加新的
    if (existing.row === activeItemRow.value) {
      removeItem(existing.row, existing.idx)
      return
    }
    // 否则（在其它行），先删除再添加到当前行
    removeItem(existing.row, existing.idx)
  }

  target[placeAt] = item
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
  if (catalogTab.value !== 'augments') catalogTab.value = 'augments'
}

const selectAugmentSlot = (tier: AugTier, idx: number) => {
  activeAugmentTier.value = tier
  activeAugmentSlot.value = idx
  augmentTierFilter.value = tier
}

const isAugmentSelected = (aug: Augment) => {
  return (
    selectedAugments.value.silver.some(a => a?.augmentId === aug.augmentId) ||
    selectedAugments.value.gold.some(a => a?.augmentId === aug.augmentId) ||
    selectedAugments.value.prismatic.some(a => a?.augmentId === aug.augmentId)
  )
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
    selectAugmentTier(tier)
  }

  const target = selectedAugments.value[tier]
  const placeAt = activeAugmentSlot.value ?? target.findIndex(a => !a)
  if (placeAt === -1) {
    ElMessage.warning(`${tierLabel(tier)} row is full. Remove one slot first.`)
    return
  }

  const existing = findSelectedAugment(aug)
  if (existing) {
    // 如果已在当前激活 tier 中，则重复点击视为取消选中：只删除原项并返回，不添加新的
    if (existing.tier === activeAugmentTier.value) {
      removeAugment(existing.tier, existing.idx)
      return
    }
    // 否则（在其它 tier），先删除再添加到当前 tier
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
    console.error('Champion missing. Please reselect.')
    return
  }

  const hasAnyItems = coreItems.value.some(Boolean) || extraItems.value.some(Boolean)
  if (!hasAnyItems) {
    console.error('Select at least 1 item.')
    return
  }

  const hasAnyAugments =
    selectedAugments.value.silver.some(Boolean) ||
    selectedAugments.value.gold.some(Boolean) ||
    selectedAugments.value.prismatic.some(Boolean)
  if (!hasAnyAugments) {
    console.error('Select at least 1 augment.')
    return
  }

  const title = strategyTitle.value.trim() || `${selectedChampion.value.name} · 海克斯大乱斗`
  const description = strategyRemark.value.trim() || `${selectedChampion.value.name}指南`
  console.log('title', title, description, coreItems.value, extraItems.value, selectedAugments.value);
  const toItemPayloadEntry = (it: Item | null, position: number) => {
    if (!it) return null
    const itemId = String((it as any)?._id || (it as any)?.riotId || itemIdentifier(it) || '').trim()
    if (!itemId) return null
    return { itemId, position }
  }

  const itemPayload = [
    ...coreItems.value.map((it, idx) => toItemPayloadEntry(it, idx)).filter(Boolean),
    ...extraItems.value.map((it, idx) => toItemPayloadEntry(it, idx + 6)).filter(Boolean),
  ] as Array<{ itemId: string; position: number }>

  if (!itemPayload.length) {
    console.error('Selected items are missing IDs. Refresh and try again.')
    return
  }

  const augmentIds = ([
    ...selectedAugments.value.silver,
    ...selectedAugments.value.gold,
    ...selectedAugments.value.prismatic,
  ] as Array<Augment | null>)
    .filter(Boolean)
    .map(a => a!.augmentId)

  console.log('augmentIds', augmentIds)
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
  console.log(payload);

  isSubmitting.value = true
  try {
    await commonService.apiCreateStrategy(payload)
    router.push({ name: 'lol', query: { championKey: selectedChampion.value.key } })
  } catch (error: any) {
    const msg = error?.response?.data?.message || error?.message || 'Failed to create strategy'
    if (String(error?.response?.status) === '401') {
      console.error('Please login first.')
      return
    }
    console.error(msg)
  } finally {
    isSubmitting.value = false
  }
}

const applyChampion = (c: Champion) => {
  const prev = selectedChampion.value
  selectedChampion.value = c
  router.replace({ query: { ...route.query, championKey: c.key } })

  const prevDefault = prev ? `${prev.name} · Hex Brawl` : ''
  if (!strategyTitle.value.trim() || strategyTitle.value.trim() === prevDefault) {
    strategyTitle.value = `${c.name} · Hex Brawl`
  }
  heroPickerOpen.value = false
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
    itemsLoading.value = !lolStore.items?.length
    augmentsLoading.value = !lolStore.augmentList?.length
    allItems.value = lolStore.items || []
    allAugments.value = lolStore.augmentList || []

    await lolStore.initializeData({ includeItems: true })

    const championFromState =
      (typeof window !== 'undefined' ? ((window.history.state as any) || {}).champion : undefined) as Champion | undefined
    if (championFromState?._id) selectedChampion.value = championFromState

    if (!selectedChampion.value) {
      const key = String(route.query.championKey || '')
      if (key) selectedChampion.value = lolStore.getChampionByKey(key) || null
    }

    if (!selectedChampion.value && lolStore.champions.length) selectedChampion.value = lolStore.champions[0]
    if (selectedChampion.value && !strategyTitle.value.trim()) strategyTitle.value = `${selectedChampion.value.name} · Hex Brawl`

    allItems.value = lolStore.items || []
    allAugments.value = lolStore.augmentList || []
    itemsLoading.value = false
    augmentsLoading.value = false
  } catch (error: any) {
    console.error('Failed to init create page:', error)
    ElMessage.error(error?.message || 'Init failed')
    router.push({ name: 'lol' })
  } finally {
    championsLoading.value = false
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.lol-create {
  height: 100%;
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
  cursor: pointer;
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

.lol-panel {
  background: var(--glass);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  border-radius: 14px;
  padding: 12px;
  backdrop-filter: blur(18px);
}

.lol-field {
  margin-bottom: 12px;
}

.lol-field-label {
  font-size: 12px;
  font-weight: 750;
  color: rgba(226, 232, 240, 0.92);
  margin-bottom: 7px;
}

.lol-input,
.lol-textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(2, 6, 23, 0.32);
  color: rgba(226, 232, 240, 0.92);
  outline: none;
  transition: border-color 160ms ease, background 160ms ease;
}

.lol-input {
  height: 40px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 650;
}

.lol-textarea {
  padding: 10px 12px;
  font-size: 13px;
  resize: none;
}

.lol-input::placeholder,
.lol-textarea::placeholder {
  color: rgba(148, 163, 184, 0.6);
}

.lol-input:focus,
.lol-textarea:focus {
  border-color: rgba(56, 189, 248, 0.35);
  background: rgba(2, 6, 23, 0.44);
}

.lol-hero-card {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  overflow: hidden;
  background: rgba(2, 6, 23, 0.22);
  margin-bottom: 14px;
}

.lol-hero-media {
  position: relative;
  aspect-ratio: 16 / 9;
  height: auto;
  overflow: hidden;
}

.lol-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.95) contrast(1.05);
  transform: scale(1.02);
}

@supports not (aspect-ratio: 16 / 9) {
  .lol-hero-media::before {
    content: '';
    display: block;
    padding-top: 56.25%;
  }

  .lol-hero-media>.lol-hero-img {
    position: absolute;
    inset: 0;
  }
}

.lol-hero-swap {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: rgba(2, 6, 23, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.18);
  color: rgba(226, 232, 240, 0.92);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 160ms ease, border-color 160ms ease;
}

.lol-hero-swap:hover {
  transform: translateY(-1px);
  border-color: rgba(56, 189, 248, 0.25);
}

.lol-hero-meta {
  padding: 10px 12px 12px;
}

.lol-hero-name {
  font-size: 16px;
  font-weight: 850;
  letter-spacing: 0.2px;
  color: rgba(226, 232, 240, 0.95);
}

.lol-hero-title {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(148, 163, 184, 0.85);
}

.lol-hero-pill {
  display: inline-flex;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.42);
  color: rgba(226, 232, 240, 0.85);
  font-size: 11px;
  font-weight: 750;
}

.lol-block {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 6, 23, 0.22);
  padding: 10px;
  margin-bottom: 12px;
}

.lol-block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}

.lol-block-title {
  font-size: 12px;
  font-weight: 800;
  color: rgba(226, 232, 240, 0.92);
  letter-spacing: 0.16px;
}

.lol-block-sub {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.7);
  font-weight: 700;
}

.lol-segment {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.3);
  margin-bottom: 10px;
}

.lol-seg {
  height: 32px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  color: rgba(148, 163, 184, 0.9);
  transition: background 160ms ease, color 160ms ease;
  cursor: pointer;
}

.lol-seg--active {
  background: rgba(56, 189, 248, 0.16);
  color: rgba(226, 232, 240, 0.95);
}

.lol-tier-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
  margin-bottom: 10px;
}

.lol-tier {
  height: 32px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.26);
  color: rgba(148, 163, 184, 0.9);
  font-size: 12px;
  font-weight: 800;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
  cursor: pointer;
}

.lol-tier:hover {
  transform: translateY(-1px);
  border-color: rgba(56, 189, 248, 0.22);
}

.lol-tier--active {
  background: rgba(245, 158, 11, 0.16);
  border-color: rgba(245, 158, 11, 0.35);
  color: rgba(226, 232, 240, 0.95);
}

.lol-slots {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.lol-slot {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 999px;
  border: 1px dashed rgba(148, 163, 184, 0.26);
  background: rgba(2, 6, 23, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.lol-slot:hover {
  transform: translateY(-1px);
  border-color: rgba(56, 189, 248, 0.28);
}

.lol-slot--active {
  border-style: solid;
  border-color: rgba(56, 189, 248, 0.45);
  background: rgba(56, 189, 248, 0.08);
}

.lol-slot--aug.lol-slot--active {
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.08);
}

.lol-slot-img {
  width: calc(100% - 10px);
  height: calc(100% - 10px);
  border-radius: 14px;
  object-fit: cover;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
}

.lol-slot-plus {
  font-size: 22px;
  font-weight: 900;
  color: rgba(148, 163, 184, 0.6);
  line-height: 1;
}

.lol-slot-remove {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background: rgba(2, 6, 23, 0.62);
  border: 1px solid rgba(148, 163, 184, 0.18);
  color: rgba(226, 232, 240, 0.92);
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 140ms ease, transform 140ms ease;
}

.lol-slot:hover .lol-slot-remove {
  opacity: 1;
  transform: translateY(0);
}

.lol-block-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.lol-ghost {
  height: 32px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.28);
  color: rgba(226, 232, 240, 0.88);
  font-size: 12px;
  font-weight: 800;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.lol-ghost:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(56, 189, 248, 0.2);
  background: rgba(15, 23, 42, 0.38);
}

.lol-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lol-stats {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 6, 23, 0.22);
  padding: 10px;
  margin-bottom: 12px;
}

.lol-stats-title {
  font-size: 12px;
  font-weight: 800;
  color: rgba(226, 232, 240, 0.92);
  margin-bottom: 10px;
}

.lol-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.lol-stat {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.28);
  padding: 8px 10px;
}

.lol-stat-k {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.78);
  font-weight: 750;
}

.lol-stat-v {
  margin-top: 4px;
  font-size: 14px;
  font-weight: 900;
  color: rgba(226, 232, 240, 0.95);
}

.lol-save {
  position: sticky;
  bottom: 0;
  padding-top: 8px;
  background: linear-gradient(180deg, transparent 0%, rgba(7, 11, 18, 0.6) 50%, rgba(7, 11, 18, 0.78) 100%);
  border-top: 1px solid rgba(148, 163, 184, 0.08);
}

.lol-primary {
  width: 100%;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.92) 0%, rgba(245, 158, 11, 0.86) 100%);
  color: rgba(2, 6, 23, 0.92);
  font-weight: 950;
  font-size: 13px;
  letter-spacing: 0.2px;
  box-shadow: 0 18px 50px rgba(56, 189, 248, 0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 160ms ease, filter 160ms ease;
}

.lol-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.03);
}

.lol-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.lol-save-hint {
  margin-top: 8px;
  font-size: 11px;
  color: rgba(148, 163, 184, 0.75);
  font-weight: 650;
  text-align: center;
}

.lol-inline-spin {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid rgba(2, 6, 23, 0.25);
  border-top-color: rgba(2, 6, 23, 0.85);
  animation: lolSpin 850ms linear infinite;
}

@keyframes lolSpin {
  to {
    transform: rotate(360deg);
  }
}

.lol-catalog {
  background: var(--glass2);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  border-radius: 14px;
  padding: 14px;
  backdrop-filter: blur(18px);
  min-height: 100%;
}

.lol-catalog-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.lol-catalog-h {
  font-size: 20px;
  font-weight: 950;
  color: rgba(226, 232, 240, 0.95);
  letter-spacing: 0.2px;
}

.lol-catalog-sub {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(148, 163, 184, 0.82);
}

.lol-catalog-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.28);
  min-width: 240px;
}

.lol-toggle {
  height: 34px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 850;
  color: rgba(148, 163, 184, 0.9);
}

.lol-toggle--active {
  background: rgba(56, 189, 248, 0.14);
  color: rgba(226, 232, 240, 0.95);
}

.lol-catalog-tools {
  display: grid;
  gap: 10px;
  margin-bottom: 10px;
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
  border-radius: 999px;
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
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
}

.lol-filters::-webkit-scrollbar {
  display: none;
}

.lol-filters--wrap {
  flex-wrap: wrap;
  overflow: visible;
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
  cursor: pointer;
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

.lol-catalog-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0 12px;
  gap: 10px;
}

.lol-meta-muted {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.75);
  font-weight: 700;
}

.lol-meta-strong {
  color: rgba(226, 232, 240, 0.95);
  font-weight: 900;
}

.lol-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.lol-card {
  text-align: left;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 14px;
  background: rgba(2, 6, 23, 0.22);
  border: 1px solid rgba(148, 163, 184, 0.12);
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
  min-height: 74px;
  cursor: pointer;
}

.lol-card:hover {
  transform: translateY(-1px);
  border-color: rgba(56, 189, 248, 0.18);
  background: rgba(3, 101, 108, 0.3);
}

.lol-card--selected {
  border-color: rgba(56, 189, 248, 0.28);
  background: rgba(56, 189, 248, 0.06);
}

.lol-card-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.28);
  flex-shrink: 0;
}

.lol-card-icon--aug {
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.45);
}

.lol-card-body {
  min-width: 0;
}

.lol-card-title {
  font-size: 13px;
  font-weight: 900;
  color: rgba(226, 232, 240, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lol-card-sub {
  margin-top: 4px;
  font-size: 11px;
  color: rgba(148, 163, 184, 0.8);
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lol-card-badge {
  margin-left: auto;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.26);
  color: rgba(226, 232, 240, 0.95);
  font-size: 11px;
  font-weight: 900;
  flex-shrink: 0;
}

.lol-card--skeleton {
  background: rgba(2, 6, 23, 0.18);
  position: relative;
  overflow: hidden;
}

.lol-card--skeleton::after {
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

.lol-skeleton {
  position: relative;
  overflow: hidden;
  background: rgba(2, 6, 23, 0.28);
}

.lol-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 0%, rgba(226, 232, 240, 0.08) 45%, transparent 90%);
  transform: translateX(-140%);
  animation: lolShimmer 1.2s ease-in-out infinite;
}

:global(.lol-tooltip) {
  max-width: 360px;
  white-space: pre-line;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.38);
  background: rgba(2, 6, 23, 0.86);
  color: rgba(35, 37, 39, 0.95);
  backdrop-filter: blur(16px);
}

/* Modal */
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

.lol-search--modal .lol-search-input {
  border-radius: 12px;
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

.lol-fade-enter-active,
.lol-fade-leave-active {
  transition: opacity 160ms ease;
}

.lol-fade-enter-from,
.lol-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .lol-body {
    grid-template-columns: 1fr;
  }

  .lol-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lol-modal-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .lol-topbar {
    padding: 0 10px;
  }

  .lol-catalog-toggle {
    min-width: 200px;
  }

  .lol-modal-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
