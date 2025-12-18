<template>
  <div class="lol-catalog">
    <div class="lol-catalog-head">
      <div class="lol-catalog-title">
        <div class="lol-catalog-h">目录</div>
        <div class="lol-catalog-sub">
          {{ catalogTab === 'items' ? '请为你的攻略选择合适的装备' : '请为你的攻略选择海克斯' }}
        </div>
      </div>

      <div class="lol-catalog-toggle">
        <button
          class="lol-toggle"
          type="button"
          :class="{ 'lol-toggle--active': catalogTab === 'items' }"
          @click="$emit('update:catalogTab', 'items')">
          装备
        </button>
        <button
          class="lol-toggle"
          type="button"
          :class="{ 'lol-toggle--active': catalogTab === 'augments' }"
          @click="$emit('update:catalogTab', 'augments')">
          海克斯强化
        </button>
      </div>
    </div>

    <div class="lol-catalog-tools">
      <div class="lol-search">
        <el-icon class="lol-search-icon"><Search /></el-icon>
        <input
          :value="catalogSearch"
          class="lol-search-input"
          :placeholder="catalogTab === 'items' ? '搜索装备…' : '搜索海克斯…'"
          autocomplete="off"
          @input="onSearchInput" />
      </div>

      <div class="lol-filters" v-if="catalogTab === 'items'">
        <button
          v-for="c in itemCategories"
          :key="c.key"
          class="lol-chip"
          :class="{ 'lol-chip--active': itemCategoryFilter === c.key }"
          type="button"
          @click="$emit('update:itemCategoryFilter', c.key)">
          {{ c.label }}
        </button>
      </div>

      <div class="lol-filters" v-else>
        <button
          v-for="t in augmentTabs"
          :key="t.key"
          class="lol-chip"
          :class="{ 'lol-chip--active': activeAugmentTier === t.key }"
          type="button"
          @click="$emit('selectAugmentTier', t.key as any)">
          {{ t.label }}
        </button>
      </div>
    </div>

    <div class="lol-catalog-meta">
      <div class="lol-meta-muted">
        已找到
        <span class="lol-meta-strong">{{ catalogTab === 'items' ? filteredItems.length : filteredAugments.length }}</span>
        {{ catalogTab === 'items' ? '个装备' : '个海克斯强化' }}
      </div>
      <div class="lol-meta-muted" v-if="catalogTab === 'augments'">
        当前待添加:
        <span class="lol-meta-strong">{{ tierLabel(activeAugmentTier) }}</span>
      </div>
    </div>

    <div class="lol-grid" v-if="catalogTab === 'items'">
      <template v-if="itemsLoading">
        <div v-for="n in 12" :key="`item-sk-${n}`" class="lol-card lol-card--skeleton" />
      </template>

      <template v-else>
        <el-tooltip
          v-for="item in filteredItems"
          :key="itemKey(item)"
          effect="light"
          placement="top"
          :show-after="160"
          :hide-after="80"
          popper-class="lol-tooltip"
          :content="formatItemTooltip(item)">
          <button class="lol-card" :class="{ 'lol-card--selected': isItemSelected(item) }" type="button" @click="$emit('addItem', item)">
            <img class="lol-card-icon" :src="item.image" :alt="item.name" loading="lazy" />
            <div class="lol-card-body">
              <div class="lol-card-title">{{ item.name }}</div>
              <div class="lol-card-sub">{{ item.gold?.total ?? '-' }}g · {{ itemShort(item) }}</div>
            </div>
            <div v-if="isItemSelected(item)" class="lol-card-badge">已选</div>
          </button>
        </el-tooltip>

        <div v-if="!filteredItems.length" class="lol-empty">
          <div class="lol-empty-title">未找到对应装备</div>
          <div class="lol-empty-sub">请输入其他关键字。</div>
        </div>
      </template>
    </div>

    <div class="lol-grid" v-else>
      <template v-if="augmentsLoading">
        <div v-for="n in 12" :key="`aug-sk-${n}`" class="lol-card lol-card--skeleton" />
      </template>

      <template v-else>
        <el-tooltip
          v-for="aug in filteredAugments"
          :key="aug.augmentId"
          effect="light"
          placement="top"
          :show-after="160"
          :hide-after="80"
          popper-class="lol-tooltip"
          :content="formatAugmentTooltip(aug)">
          <button
            class="lol-card"
            :class="{ 'lol-card--selected': isAugmentSelected(aug) }"
            type="button"
            @click="$emit('addAugment', aug)">
            <img class="lol-card-icon lol-card-icon--aug" :src="aug.icon" :alt="aug.name" loading="lazy" />
            <div class="lol-card-body">
              <div class="lol-card-title">{{ aug.name }}</div>
              <div class="lol-card-sub">{{ tierLabel(getAugmentTier(aug)) }} · {{ augmentShort(aug) }}</div>
            </div>
            <div v-if="isAugmentSelected(aug)" class="lol-card-badge">已选</div>
          </button>
        </el-tooltip>

        <div v-if="!filteredAugments.length" class="lol-empty">
          <div class="lol-empty-title">未找到对应的海克斯强化</div>
          <div class="lol-empty-sub">请选择其他的关键字。</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import type { Augment, Item } from '@/types'

type AugTier = 'silver' | 'gold' | 'prismatic'
type CatalogTab = 'items' | 'augments'

const props = defineProps<{
  catalogTab: CatalogTab
  catalogSearch: string
  itemCategories: ReadonlyArray<{ key: string; label: string }>
  itemCategoryFilter: string
  augmentTabs: ReadonlyArray<{ key: AugTier; label: string }>
  activeAugmentTier: AugTier

  itemsLoading: boolean
  augmentsLoading: boolean
  filteredItems: Item[]
  filteredAugments: Augment[]

  itemKey: (item: Item) => string
  itemShort: (item: Item) => string
  augmentShort: (aug: Augment) => string
  getAugmentTier: (aug: Augment) => AugTier
  tierLabel: (tier: AugTier) => string
  isItemSelected: (item: Item) => boolean
  isAugmentSelected: (aug: Augment) => boolean
  formatItemTooltip: (item: Item) => string
  formatAugmentTooltip: (aug: Augment) => string
}>()

const emit = defineEmits<{
  (e: 'update:catalogTab', v: CatalogTab): void
  (e: 'update:catalogSearch', v: string): void
  (e: 'update:itemCategoryFilter', v: string): void
  (e: 'selectAugmentTier', tier: AugTier): void
  (e: 'addItem', item: Item): void
  (e: 'addAugment', aug: Augment): void
}>()

const onSearchInput = (e: Event) => {
  emit('update:catalogSearch', (e.target as HTMLInputElement).value)
}
</script>

<style scoped>
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
}

.lol-card:hover {
  transform: translateY(-1px);
  border-color: rgba(56, 189, 248, 0.18);
  background: rgba(2, 6, 23, 0.3);
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

:global(.lol-tooltip) {
  max-width: 360px;
  white-space: pre-line;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.16);
  background: rgba(255, 255, 255, 0.96) !important;
  color: rgb(15, 23, 42) !important;
  backdrop-filter: blur(14px);
}

:global(.lol-tooltip .el-popper__arrow::before) {
  background: rgba(255, 255, 255, 0.96) !important;
  border: 1px solid rgba(15, 23, 42, 0.12);
}
</style>

