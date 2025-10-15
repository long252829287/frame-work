<template>
  <div class="rune-selector">
    <!-- Empty State -->
    <div v-if="runeTrees.length === 0" class="empty-state">
      <p>符文数据加载中...</p>
    </div>

    <div v-else class="rune-trees">
      <!-- Primary Tree -->
      <div class="tree-section primary">
        <h3>主系符文</h3>
        <div class="tree-icons">
          <div
            v-for="tree in runeTrees"
            :key="tree.id"
            class="tree-icon"
            :class="{ selected: selectedPrimaryTree === tree.id }"
            @click="selectPrimaryTree(tree.id)"
          >
            <img :src="tree.icon" :alt="tree.name" />
            <span>{{ tree.name }}</span>
          </div>
        </div>

        <div v-if="selectedPrimaryTree" class="rune-slots">
          <div v-for="(slot, index) in primaryTreeData?.slots" :key="index" class="slot">
            <div class="slot-runes">
              <div
                v-for="rune in slot.runes"
                :key="rune.id"
                class="rune-item"
                :class="{
                  selected: selectedPrimaryRunes.some(r => r.id === rune.id),
                  keystone: index === 0
                }"
                @click="selectPrimaryRune(rune, index)"
              >
                <img :src="rune.icon" :alt="rune.name" />
                <div class="rune-tooltip">{{ rune.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary Tree -->
      <div class="tree-section secondary">
        <h3>副系符文</h3>
        <div class="tree-icons">
          <div
            v-for="tree in availableSecondaryTrees"
            :key="tree.id"
            class="tree-icon"
            :class="{ selected: selectedSecondaryTree === tree.id }"
            @click="selectSecondaryTree(tree.id)"
          >
            <img :src="tree.icon" :alt="tree.name" />
            <span>{{ tree.name }}</span>
          </div>
        </div>

        <div v-if="selectedSecondaryTree" class="rune-slots secondary-slots">
          <div v-for="(slot, index) in secondaryTreeData?.slots.slice(1)" :key="index" class="slot">
            <div class="slot-runes">
              <div
                v-for="rune in slot.runes"
                :key="rune.id"
                class="rune-item"
                :class="{ selected: selectedSecondaryRunes.some(r => r.id === rune.id) }"
                @click="selectSecondaryRune(rune, index + 1)"
              >
                <img :src="rune.icon" :alt="rune.name" />
                <div class="rune-tooltip">{{ rune.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Runes Summary -->
    <div v-if="selectedPrimaryRunes.length > 0 || selectedSecondaryRunes.length > 0" class="selected-summary">
      <h4>已选符文</h4>
      <div class="summary-content">
        <div v-if="selectedPrimaryRunes.length > 0" class="summary-section">
          <span class="summary-label">主系 ({{ primaryTreeData?.name }}):</span>
          <div class="summary-runes">
            <img v-for="rune in selectedPrimaryRunes" :key="rune.id" :src="rune.icon" :alt="rune.name" :title="rune.name" />
          </div>
        </div>
        <div v-if="selectedSecondaryRunes.length > 0" class="summary-section">
          <span class="summary-label">副系 ({{ secondaryTreeData?.name }}):</span>
          <div class="summary-runes">
            <img v-for="rune in selectedSecondaryRunes" :key="rune.id" :src="rune.icon" :alt="rune.name" :title="rune.name" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import type { RuneTree, Rune } from '@/types'

interface Props {
  runeTrees: RuneTree[]
  modelValue?: {
    primaryTreeId: string
    primaryRunes: Array<{ id: string; name: string; icon: string; slotIndex: number }>
    secondaryTreeId: string
    secondaryRunes: Array<{ id: string; name: string; icon: string; slotIndex: number }>
  }
}

const props = defineProps<Props>()

onMounted(() => {
  console.log('RuneSelector mounted with runeTrees:', props.runeTrees.length)
  if (props.runeTrees.length > 0) {
    console.log('Sample rune tree:', props.runeTrees[0])
  }
})
const emit = defineEmits<{
  'update:modelValue': [value: {
    primaryTreeId: string
    primaryRunes: Array<{ id: string; name: string; icon: string; slotIndex: number }>
    secondaryTreeId: string
    secondaryRunes: Array<{ id: string; name: string; icon: string; slotIndex: number }>
  }]
}>()

const selectedPrimaryTree = ref<string>('')
const selectedSecondaryTree = ref<string>('')
const selectedPrimaryRunes = ref<Array<{ id: string; name: string; icon: string; slotIndex: number }>>([])
const selectedSecondaryRunes = ref<Array<{ id: string; name: string; icon: string; slotIndex: number }>>([])

const primaryTreeData = computed(() => props.runeTrees.find(t => t.id === selectedPrimaryTree.value))
const secondaryTreeData = computed(() => props.runeTrees.find(t => t.id === selectedSecondaryTree.value))
const availableSecondaryTrees = computed(() => props.runeTrees.filter(t => t.id !== selectedPrimaryTree.value))

// Initialize from modelValue
if (props.modelValue) {
  selectedPrimaryTree.value = props.modelValue.primaryTreeId
  selectedSecondaryTree.value = props.modelValue.secondaryTreeId
  selectedPrimaryRunes.value = props.modelValue.primaryRunes
  selectedSecondaryRunes.value = props.modelValue.secondaryRunes
}

function selectPrimaryTree(treeId: string) {
  selectedPrimaryTree.value = treeId
  selectedPrimaryRunes.value = []

  if (selectedSecondaryTree.value === treeId) {
    selectedSecondaryTree.value = ''
    selectedSecondaryRunes.value = []
  }

  emitValue()
}

function selectSecondaryTree(treeId: string) {
  selectedSecondaryTree.value = treeId
  selectedSecondaryRunes.value = []
  emitValue()
}

function selectPrimaryRune(rune: Rune, slotIndex: number) {
  const existingIndex = selectedPrimaryRunes.value.findIndex(r => r.slotIndex === slotIndex)

  if (existingIndex !== -1) {
    selectedPrimaryRunes.value[existingIndex] = {
      id: rune.id,
      name: rune.name,
      icon: rune.icon,
      slotIndex
    }
  } else {
    selectedPrimaryRunes.value.push({
      id: rune.id,
      name: rune.name,
      icon: rune.icon,
      slotIndex
    })
  }

  selectedPrimaryRunes.value.sort((a, b) => a.slotIndex - b.slotIndex)
  emitValue()
}

function selectSecondaryRune(rune: Rune, slotIndex: number) {
  const existingIndex = selectedSecondaryRunes.value.findIndex(r => r.slotIndex === slotIndex)

  if (existingIndex !== -1) {
    selectedSecondaryRunes.value[existingIndex] = {
      id: rune.id,
      name: rune.name,
      icon: rune.icon,
      slotIndex
    }
  } else {
    if (selectedSecondaryRunes.value.length >= 2) {
      selectedSecondaryRunes.value.shift()
    }
    selectedSecondaryRunes.value.push({
      id: rune.id,
      name: rune.name,
      icon: rune.icon,
      slotIndex
    })
  }

  selectedSecondaryRunes.value.sort((a, b) => a.slotIndex - b.slotIndex)
  emitValue()
}

function emitValue() {
  if (selectedPrimaryTree.value && selectedSecondaryTree.value &&
      selectedPrimaryRunes.value.length === 4 && selectedSecondaryRunes.value.length === 2) {
    emit('update:modelValue', {
      primaryTreeId: selectedPrimaryTree.value,
      primaryRunes: selectedPrimaryRunes.value,
      secondaryTreeId: selectedSecondaryTree.value,
      secondaryRunes: selectedSecondaryRunes.value
    })
  }
}
</script>

<style lang="scss" scoped>
.rune-selector {
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 16px;
  }
}

.rune-trees {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.tree-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  border: 2px solid transparent;
  transition: all 0.3s ease;

  &.primary {
    border-color: #c8aa6e;
  }

  &.secondary {
    border-color: #4a9eff;
  }

  h3 {
    color: #fff;
    font-size: 18px;
    margin-bottom: 15px;
    text-align: center;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}

.tree-icons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tree-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  &.selected {
    border-color: #c8aa6e;
    background: rgba(200, 170, 110, 0.2);
    box-shadow: 0 0 20px rgba(200, 170, 110, 0.3);
  }

  img {
    width: 48px;
    height: 48px;
    margin-bottom: 5px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  }

  span {
    color: #fff;
    font-size: 12px;
    text-align: center;
  }
}

.rune-slots {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.slot {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 10px;
}

.slot-runes {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.rune-item {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  border-radius: 50%;
  padding: 3px;

  &:hover {
    transform: scale(1.1);
    border-color: rgba(255, 255, 255, 0.5);

    .rune-tooltip {
      opacity: 1;
      visibility: visible;
    }
  }

  &.selected {
    border-color: #c8aa6e;
    box-shadow: 0 0 15px rgba(200, 170, 110, 0.5);
  }

  &.keystone img {
    width: 56px;
    height: 56px;
  }

  img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: block;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6));
  }
}

.rune-tooltip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 10;
}

.secondary-slots {
  .slot:first-child {
    display: none;
  }
}

.selected-summary {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  border: 2px solid #c8aa6e;

  h4 {
    color: #c8aa6e;
    font-size: 16px;
    margin-bottom: 15px;
    text-align: center;
  }
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.summary-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.summary-label {
  color: #fff;
  font-size: 14px;
  min-width: 120px;
  font-weight: bold;
}

.summary-runes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #c8aa6e;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  }
}

@media (max-width: 1024px) {
  .rune-trees {
    grid-template-columns: 1fr;
  }
}
</style>
