<template>
  <section class="lol-panel">
    <div class="lol-field">
      <div class="lol-field-label">攻略名称</div>
      <div class="lol-field-control">
        <input
          :value="strategyTitle"
          class="lol-input"
          placeholder="e.g. Jinx · Attack Speed Build"
          autocomplete="off"
          @input="onTitleInput" />
      </div>
    </div>

    <div class="lol-hero-card">
      <div class="lol-hero-media">
        <img
          v-if="selectedChampion"
          :src="selectedChampion.images.splash || selectedChampion.images.square"
          class="lol-hero-img"
          :alt="selectedChampion.name"
          loading="lazy" />
        <div v-else class="lol-hero-img lol-skeleton" />
        <button class="lol-hero-swap" type="button" title="切换英雄" @click="$emit('openHeroPicker')">
          <el-icon><Switch /></el-icon>
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
        <button
          class="lol-seg"
          :class="{ 'lol-seg--active': activeItemRow === 'core' }"
          type="button"
          @click="$emit('selectItemRow', 'core')">
          常规装备
        </button>
        <button
          class="lol-seg"
          :class="{ 'lol-seg--active': activeItemRow === 'extra' }"
          type="button"
          @click="$emit('selectItemRow', 'extra')">
          额外可选
        </button>
      </div>

      <div class="lol-slots">
        <button
          v-for="i in 6"
          :key="`${activeItemRow}-${i}`"
          class="lol-slot"
          :class="{ 'lol-slot--active': activeItemSlot === i - 1 }"
          type="button"
          @click="$emit('selectItemSlot', activeItemRow, i - 1)">
          <template v-if="activeItemRow === 'core' ? coreItems[i - 1] : extraItems[i - 1]">
            <el-tooltip
              effect="light"
              placement="top"
              :show-after="160"
              :hide-after="80"
              popper-class="lol-tooltip"
              :content="formatItemTooltip((activeItemRow === 'core' ? coreItems[i - 1] : extraItems[i - 1])!)">
              <img
                class="lol-slot-img"
                :src="(activeItemRow === 'core' ? coreItems[i - 1] : extraItems[i - 1])!.image"
                alt="" />
            </el-tooltip>
            <button
              class="lol-slot-remove"
              type="button"
              title="移除"
              @click.stop="$emit('removeItem', activeItemRow, i - 1)">
              <el-icon><Close /></el-icon>
            </button>
          </template>
          <template v-else>
            <span class="lol-slot-plus" aria-hidden="true">+</span>
          </template>
        </button>
      </div>

      <div class="lol-block-actions">
        <button class="lol-ghost" type="button" :disabled="isSubmitting" @click="$emit('clearItems')">清空</button>
      </div>
    </div>

    <div class="lol-block">
      <div class="lol-block-head">
        <div class="lol-block-title">海克斯强化</div>
        <div class="lol-block-sub">{{ filledAugmentCount }}/18</div>
      </div>

      <div class="lol-tier-tabs">
        <button
          class="lol-tier"
          type="button"
          :class="{ 'lol-tier--active': activeAugmentTier === 'silver' }"
          @click="$emit('selectAugmentTier', 'silver')">
          银色
        </button>
        <button
          class="lol-tier"
          type="button"
          :class="{ 'lol-tier--active': activeAugmentTier === 'gold' }"
          @click="$emit('selectAugmentTier', 'gold')">
          金色
        </button>
        <button
          class="lol-tier"
          type="button"
          :class="{ 'lol-tier--active': activeAugmentTier === 'prismatic' }"
          @click="$emit('selectAugmentTier', 'prismatic')">
          彩色
        </button>
      </div>

      <div class="lol-slots lol-slots--aug">
        <button
          v-for="i in 6"
          :key="`${activeAugmentTier}-${i}`"
          class="lol-slot lol-slot--aug"
          :class="{ 'lol-slot--active': activeAugmentSlot === i - 1 }"
          type="button"
          @click="$emit('selectAugmentSlot', activeAugmentTier, i - 1)">
          <template v-if="selectedAugments[activeAugmentTier][i - 1]">
            <el-tooltip
              effect="light"
              placement="top"
              :show-after="160"
              :hide-after="80"
              popper-class="lol-tooltip"
              :content="formatAugmentTooltip(selectedAugments[activeAugmentTier][i - 1]!)">
              <img class="lol-slot-img" :src="selectedAugments[activeAugmentTier][i - 1]!.icon" alt="" />
            </el-tooltip>
            <button
              class="lol-slot-remove"
              type="button"
              title="移除"
              @click.stop="$emit('removeAugment', activeAugmentTier, i - 1)">
              <el-icon><Close /></el-icon>
            </button>
          </template>
          <template v-else>
            <span class="lol-slot-plus" aria-hidden="true">+</span>
          </template>
        </button>
      </div>

      <div class="lol-block-actions">
        <button class="lol-ghost" type="button" :disabled="isSubmitting" @click="$emit('clearAugments')">清空</button>
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
        <textarea
          :value="strategyRemark"
          class="lol-textarea"
          placeholder="解释下有什么特殊玩法吧…"
          rows="3"
          @input="onRemarkInput" />
      </div>
    </div>

    <div class="lol-save">
      <button class="lol-primary" type="button" :disabled="isSubmitting" @click="$emit('submitStrategy')">
        <span v-if="isSubmitting" class="lol-inline-spin" aria-hidden="true" />
        保存攻略
      </button>
      <div class="lol-save-hint">需要登录,请在登录后新建</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Close, Switch } from '@element-plus/icons-vue'
import type { Augment, Champion, Item } from '@/types'

type ItemRow = 'core' | 'extra'
type AugTier = 'silver' | 'gold' | 'prismatic'

const props = defineProps<{
  selectedChampion: Champion | null
  strategyTitle: string
  strategyRemark: string
  isSubmitting: boolean

  filledItemCount: number
  filledAugmentCount: number

  activeItemRow: ItemRow
  activeCoreItemSlot: number | null
  activeExtraItemSlot: number | null
  coreItems: Array<Item | null>
  extraItems: Array<Item | null>

  activeAugmentTier: AugTier
  activeAugmentSlot: number | null
  selectedAugments: Record<AugTier, Array<Augment | null>>

  formatItemTooltip: (item: Item) => string
  formatAugmentTooltip: (aug: Augment) => string
}>()

const emit = defineEmits<{
  (e: 'update:strategyTitle', v: string): void
  (e: 'update:strategyRemark', v: string): void
  (e: 'openHeroPicker'): void
  (e: 'selectItemRow', row: ItemRow): void
  (e: 'selectItemSlot', row: ItemRow, idx: number): void
  (e: 'removeItem', row: ItemRow, idx: number): void
  (e: 'clearItems'): void
  (e: 'selectAugmentTier', tier: AugTier): void
  (e: 'selectAugmentSlot', tier: AugTier, idx: number): void
  (e: 'removeAugment', tier: AugTier, idx: number): void
  (e: 'clearAugments'): void
  (e: 'submitStrategy'): void
}>()

const activeItemSlot = computed(() =>
  props.activeItemRow === 'core' ? props.activeCoreItemSlot : props.activeExtraItemSlot,
)

const onTitleInput = (e: Event) => {
  const v = (e.target as HTMLInputElement).value
  emit('update:strategyTitle', v)
}

const onRemarkInput = (e: Event) => {
  const v = (e.target as HTMLTextAreaElement).value
  emit('update:strategyRemark', v)
}
</script>

<style scoped>
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
  height: 132px;
  overflow: hidden;
}

.lol-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.95) contrast(1.05);
  transform: scale(1.02);
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
  grid-template-columns: repeat(3, 1fr);
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
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
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

@keyframes lolShimmer {
  0% {
    transform: translateX(-140%);
  }
  100% {
    transform: translateX(140%);
  }
}
</style>
