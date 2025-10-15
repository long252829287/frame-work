<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="header">
      <h1>创建攻略</h1>
      <el-button @click="handleCancel">取消</el-button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <el-icon class="is-loading" :size="48"><Loading /></el-icon>
      <p>正在加载数据...</p>
    </div>

    <template v-else-if="isInitialized">
      <el-steps :active="currentStep" finish-status="success" align-center class="steps">
      <el-step title="选择英雄" />
      <el-step title="选择符文" />
      <el-step title="选择装备" />
      <el-step title="完成创建" />
    </el-steps>

    <div class="step-content">
      <!-- Step 1: Champion Selection -->
      <div v-if="currentStep === 0" class="step-champion">
        <h2>选择英雄</h2>
        <div class="search-bar">
          <el-input
            v-model="championSearch"
            placeholder="搜索英雄名称..."
            clearable
            size="large"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="tags-filter">
          <el-tag
            v-for="tag in championTags"
            :key="tag"
            :type="selectedTags.includes(tag) ? 'warning' : 'info'"
            class="tag-item"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>

        <div class="champions-grid">
          <div
            v-for="champion in filteredChampions"
            :key="champion._id"
            class="champion-card"
            :class="{ selected: selectedChampion?._id === champion._id }"
            @click="selectChampion(champion)"
          >
            <img :src="champion.images.square" :alt="champion.name" />
            <div class="champion-info">
              <span class="champion-name">{{ champion.name }}</span>
              <span class="champion-title">{{ champion.title }}</span>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <el-button type="primary" size="large" :disabled="!selectedChampion" @click="nextStep">
            下一步
          </el-button>
        </div>
      </div>

      <!-- Step 2: Rune Selection -->
      <div v-if="currentStep === 1" class="step-rune">
        <h2>选择符文</h2>
        <RuneSelector v-model="selectedRunes" :rune-trees="lolStore.runeTrees" />

        <div class="step-actions">
          <el-button size="large" @click="prevStep">上一步</el-button>
          <el-button type="primary" size="large" :disabled="!isRunesValid" @click="nextStep">
            下一步
          </el-button>
        </div>
      </div>

      <!-- Step 3: Item Selection -->
      <div v-if="currentStep === 2" class="step-items">
        <h2>选择装备</h2>

        <div class="items-section">
          <h3>核心装备 (6件)</h3>
          <div class="items-slots core-items">
            <div
              v-for="i in 6"
              :key="'core-' + i"
              class="item-slot"
              @click="selectItemSlot('core', i - 1)"
            >
              <div v-if="coreItems[i - 1]" class="item-selected">
                <img :src="coreItems[i - 1]!.image" :alt="coreItems[i - 1]!.name" />
                <el-icon class="remove-icon" @click.stop="removeItem('core', i - 1)">
                  <Close />
                </el-icon>
              </div>
              <div v-else class="item-empty">
                <el-icon><Plus /></el-icon>
              </div>
            </div>
          </div>

          <h3>备选装备 (可选,最多6件)</h3>
          <div class="items-slots alternative-items">
            <div
              v-for="i in 6"
              :key="'alt-' + i"
              class="item-slot"
              @click="selectItemSlot('alternative', i - 1)"
            >
              <div v-if="alternativeItems[i - 1]" class="item-selected">
                <img :src="alternativeItems[i - 1]!.image" :alt="alternativeItems[i - 1]!.name" />
                <el-icon class="remove-icon" @click.stop="removeItem('alternative', i - 1)">
                  <Close />
                </el-icon>
              </div>
              <div v-else class="item-empty">
                <el-icon><Plus /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- Item Selection Dialog -->
        <el-dialog v-model="itemDialogVisible" title="选择装备" width="80%" :close-on-click-modal="false">
          <el-input
            v-model="itemSearch"
            placeholder="搜索装备..."
            clearable
            class="item-search"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <div class="items-list">
            <div
              v-for="item in filteredItems"
              :key="item._id"
              class="item-card"
              @click="selectItem(item)"
            >
              <img :src="item.image" :alt="item.name" />
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-price">{{ item.gold.total }}金币</span>
              </div>
            </div>
          </div>
        </el-dialog>

        <div class="step-actions">
          <el-button size="large" @click="prevStep">上一步</el-button>
          <el-button type="primary" size="large" :disabled="coreItems.filter(Boolean).length !== 6" @click="nextStep">
            下一步
          </el-button>
        </div>
      </div>

      <!-- Step 4: Final Confirmation -->
      <div v-if="currentStep === 3" class="step-confirm">
        <h2>完成创建</h2>

        <el-form :model="strategyForm" label-width="100px" class="strategy-form">
          <el-form-item label="攻略标题" required>
            <el-input v-model="strategyForm.title" placeholder="请输入攻略标题" />
          </el-form-item>

          <el-form-item label="地图类型" required>
            <el-radio-group v-model="strategyForm.mapType">
              <el-radio value="sr">召唤师峡谷</el-radio>
              <el-radio value="aram">极地大乱斗</el-radio>
              <el-radio value="both">通用</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="攻略描述" required>
            <el-input
              v-model="strategyForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入攻略描述..."
            />
          </el-form-item>

          <el-form-item label="标签">
            <el-tag
              v-for="tag in strategyForm.tags"
              :key="tag"
              closable
              @close="removeTag(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="tagInputVisible"
              ref="tagInputRef"
              v-model="tagInput"
              size="small"
              style="width: 100px"
              @keyup.enter="addTag"
              @blur="addTag"
            />
            <el-button v-else size="small" @click="showTagInput">+ 添加标签</el-button>
          </el-form-item>
        </el-form>

        <div class="preview">
          <h3>预览</h3>
          <div class="preview-content">
            <div class="preview-champion">
              <img :src="selectedChampion?.images.square" :alt="selectedChampion?.name" />
              <span>{{ selectedChampion?.name }}</span>
            </div>

            <div class="preview-runes">
              <h4>符文配置</h4>
              <div class="runes-display">
                <div v-if="selectedRunes.primaryRunes?.length" class="primary-runes">
                  <span>主系:</span>
                  <img
                    v-for="rune in selectedRunes.primaryRunes"
                    :key="rune.id"
                    :src="rune.icon"
                    :alt="rune.name"
                    :title="rune.name"
                  />
                </div>
                <div v-if="selectedRunes.secondaryRunes?.length" class="secondary-runes">
                  <span>副系:</span>
                  <img
                    v-for="rune in selectedRunes.secondaryRunes"
                    :key="rune.id"
                    :src="rune.icon"
                    :alt="rune.name"
                    :title="rune.name"
                  />
                </div>
              </div>
            </div>

            <div class="preview-items">
              <h4>核心装备</h4>
              <div class="items-display">
                <img
                  v-for="(item, idx) in coreItems.filter(Boolean)"
                  :key="idx"
                  :src="item!.image"
                  :alt="item!.name"
                  :title="item!.name"
                />
              </div>

              <h4 v-if="alternativeItems.some(Boolean)">备选装备</h4>
              <div v-if="alternativeItems.some(Boolean)" class="items-display">
                <img
                  v-for="(item, idx) in alternativeItems.filter(Boolean)"
                  :key="idx"
                  :src="item!.image"
                  :alt="item!.name"
                  :title="item!.name"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <el-button size="large" @click="prevStep">上一步</el-button>
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            :disabled="!isFormValid"
            @click="submitStrategy"
          >
            {{ submitting ? '创建中...' : '创建攻略' }}
          </el-button>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus, Close, Loading } from '@element-plus/icons-vue'
import { commonService } from '@/service'
import { useLolStore } from '@/stores/lol'
import RuneSelector from '@/components/lol/RuneSelector.vue'
import type { Champion, Item } from '@/types'

const router = useRouter()
const lolStore = useLolStore()

// 初始化标志
const isInitialized = ref(false)
const isLoading = ref(false)

const currentStep = ref(0)
const championSearch = ref('')
const selectedTags = ref<string[]>([])
const selectedChampion = ref<Champion | null>(null)
const selectedRunes = ref<any>({})
const coreItems = ref<(Item | null)[]>(Array(6).fill(null))
const alternativeItems = ref<(Item | null)[]>(Array(6).fill(null))
const itemDialogVisible = ref(false)
const itemSearch = ref('')
const currentItemSlot = ref<{ type: 'core' | 'alternative'; index: number } | null>(null)
const tagInputVisible = ref(false)
const tagInput = ref('')
const tagInputRef = ref()
const submitting = ref(false)

const strategyForm = ref({
  title: '',
  mapType: 'sr' as 'sr' | 'aram' | 'both',
  description: '',
  tags: [] as string[]
})

const championTags = computed(() => {
  const tags = new Set<string>()
  lolStore.champions.forEach(c => c.tags.forEach(t => tags.add(t)))
  return Array.from(tags)
})

const filteredChampions = computed(() => {
  let champions = lolStore.champions

  if (championSearch.value) {
    const search = championSearch.value.toLowerCase()
    champions = champions.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.title.toLowerCase().includes(search)
    )
  }

  if (selectedTags.value.length > 0) {
    champions = champions.filter(c =>
      selectedTags.value.some(tag => c.tags.includes(tag))
    )
  }

  return champions
})

const filteredItems = computed(() => {
  let items = lolStore.items.filter(item => item.gold.purchasable)

  if (itemSearch.value) {
    const search = itemSearch.value.toLowerCase()
    items = items.filter(i =>
      i.name.toLowerCase().includes(search) ||
      i.plaintext.toLowerCase().includes(search)
    )
  }

  return items
})

const isRunesValid = computed(() => {
  return selectedRunes.value.primaryRunes?.length === 4 &&
         selectedRunes.value.secondaryRunes?.length === 2
})

const isFormValid = computed(() => {
  return strategyForm.value.title.trim() !== '' &&
         strategyForm.value.description.trim() !== ''
})

function toggleTag(tag: string) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

function selectChampion(champion: Champion) {
  selectedChampion.value = champion
}

function selectItemSlot(type: 'core' | 'alternative', index: number) {
  currentItemSlot.value = { type, index }
  itemDialogVisible.value = true
}

function selectItem(item: Item) {
  if (!currentItemSlot.value) return

  const { type, index } = currentItemSlot.value
  if (type === 'core') {
    coreItems.value[index] = item
  } else {
    alternativeItems.value[index] = item
  }

  itemDialogVisible.value = false
  currentItemSlot.value = null
  itemSearch.value = ''
}

function removeItem(type: 'core' | 'alternative', index: number) {
  if (type === 'core') {
    coreItems.value[index] = null
  } else {
    alternativeItems.value[index] = null
  }
}

function showTagInput() {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !strategyForm.value.tags.includes(tag)) {
    strategyForm.value.tags.push(tag)
  }
  tagInput.value = ''
  tagInputVisible.value = false
}

function removeTag(tag: string) {
  const index = strategyForm.value.tags.indexOf(tag)
  if (index > -1) {
    strategyForm.value.tags.splice(index, 1)
  }
}

function nextStep() {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function handleCancel() {
  router.push('/lol')
}

async function submitStrategy() {
  if (!selectedChampion.value) {
    ElMessage.error('请选择英雄')
    return
  }

  submitting.value = true

  try {
    // 构建装备列表 - 核心装备位置 0-5，备选装备位置 6-11
    const coreItemsList = coreItems.value
      .map((item, idx) => item ? { itemId: item._id, position: idx } : null)
      .filter(Boolean) as Array<{ itemId: string; position: number }>;

    const alternativeItemsList = alternativeItems.value
      .map((item, idx) => item ? { itemId: item._id, position: idx + 6 } : null)
      .filter(Boolean) as Array<{ itemId: string; position: number }>;

    const payload = {
      title: strategyForm.value.title,
      championId: selectedChampion.value._id,
      items: [...coreItemsList, ...alternativeItemsList],
      runes: selectedRunes.value,
      mapType: strategyForm.value.mapType,
      description: strategyForm.value.description,
      tags: strategyForm.value.tags
    }

    await commonService.apiCreateStrategy(payload)
    ElMessage.success('攻略创建成功')
    router.push('/lol')
  } catch (error: any) {
    console.error('Failed to create strategy:', error)
    ElMessage.error(error?.response?.data?.message || '创建攻略失败')
  } finally {
    submitting.value = false
  }
}

// 初始化数据
async function initializeData() {
  if (isInitialized.value) return

  isLoading.value = true
  try {
    await lolStore.initializeData()

    // 验证数据是否加载成功
    if (lolStore.champions.length === 0) {
      throw new Error('英雄数据加载失败，请刷新页面重试')
    }
    if (lolStore.items.length === 0) {
      throw new Error('装备数据加载失败，请刷新页面重试')
    }
    if (lolStore.runeTrees.length === 0) {
      throw new Error('符文数据加载失败，请刷新页面重试')
    }

    isInitialized.value = true
    console.log('LoL data initialized:', {
      champions: lolStore.champions.length,
      items: lolStore.items.length,
      runeTrees: lolStore.runeTrees.length
    })
  } catch (error: any) {
    console.error('Failed to initialize data:', error)
    ElMessage.error(error.message || '数据加载失败')
    // 3秒后返回列表页
    setTimeout(() => {
      router.push('/lol')
    }, 3000)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  initializeData()
})
</script>

<style lang="scss" scoped>
.strategy-create {
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 20px;

    p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 16px;
    }
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  h1 {
    color: #fff;
    font-size: 32px;
    font-weight: bold;
    margin: 0;
    background: linear-gradient(135deg, #c8aa6e 0%, #f0e6d2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.steps {
  margin-bottom: 40px;

  :deep(.el-step__title) {
    color: rgba(255, 255, 255, 0.7);

    &.is-finish,
    &.is-process {
      color: #c8aa6e;
    }
  }

  :deep(.el-step__icon.is-text) {
    border-color: rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 0.7);
  }

  :deep(.el-step__icon.is-finish),
  :deep(.el-step__icon.is-process) {
    border-color: #c8aa6e;
    color: #c8aa6e;
  }

  :deep(.el-step__line) {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

.step-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 30px;
  min-height: 500px;

  h2 {
    color: #fff;
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
  }

  h3 {
    color: #c8aa6e;
    font-size: 18px;
    margin: 20px 0 15px 0;
  }

  h4 {
    color: rgba(255, 255, 255, 0.9);
    font-size: 16px;
    margin: 15px 0 10px 0;
  }
}

// Step 1: Champion Selection
.search-bar {
  margin-bottom: 20px;
}

.tags-filter {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;

  .tag-item {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}

.champions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
}

.champion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(200, 170, 110, 0.5);
    transform: translateY(-2px);
  }

  &.selected {
    border-color: #c8aa6e;
    background: rgba(200, 170, 110, 0.2);
    box-shadow: 0 0 20px rgba(200, 170, 110, 0.3);
  }

  img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .champion-info {
    text-align: center;

    .champion-name {
      display: block;
      color: #fff;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 2px;
    }

    .champion-title {
      display: block;
      color: rgba(255, 255, 255, 0.6);
      font-size: 11px;
    }
  }
}

// Step 3: Item Selection
.items-section {
  margin-bottom: 30px;
}

.items-slots {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.item-slot {
  aspect-ratio: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(200, 170, 110, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #c8aa6e;
    transform: scale(1.05);
  }
}

.item-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 32px;
}

.item-selected {
  width: 100%;
  height: 100%;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-icon {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    padding: 4px;
    color: #fff;
    cursor: pointer;

    &:hover {
      background: rgba(255, 0, 0, 0.7);
    }
  }
}

.item-search {
  margin-bottom: 20px;
}

.items-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  max-height: 500px;
  overflow-y: auto;
}

.item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #c8aa6e;
    transform: scale(1.05);
  }

  img {
    width: 60px;
    height: 60px;
    margin-bottom: 8px;
  }

  .item-info {
    text-align: center;

    .item-name {
      display: block;
      color: #fff;
      font-size: 12px;
      margin-bottom: 4px;
    }

    .item-price {
      display: block;
      color: #c8aa6e;
      font-size: 11px;
    }
  }
}

// Step 4: Confirmation
.strategy-form {
  margin-bottom: 30px;

  :deep(.el-form-item__label) {
    color: rgba(255, 255, 255, 0.8);
  }
}

.preview {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;

  h3 {
    color: #c8aa6e;
    font-size: 20px;
    margin: 0 0 20px 0;
  }
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-champion {
  display: flex;
  align-items: center;
  gap: 15px;

  img {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    border: 2px solid #c8aa6e;
  }

  span {
    color: #fff;
    font-size: 20px;
    font-weight: bold;
  }
}

.runes-display,
.items-display {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  span {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    min-width: 50px;
  }

  img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #c8aa6e;
  }
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .champions-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }

  .items-slots {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
