<template>
  <div class="lol-index">
    <el-tabs v-model="activeTab" class="strategy-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="全部攻略" name="all">
        <div v-loading="loading" class="strategies-container">
          <div v-if="allStrategies.length === 0" class="empty-state">
            <el-empty description="暂无攻略" />
          </div>
          <div v-else class="strategies-grid">
            <div v-for="strategy in allStrategies" :key="strategy._id" class="strategy-card"
              @click="viewStrategy(strategy._id)">
              <div class="card-header">
                <img :src="strategy.champion.images.square" :alt="strategy.championName" class="champion-icon" />
                <div class="header-info">
                  <h3>{{ strategy.title }}</h3>
                  <span class="champion-name">{{ strategy.championName }}</span>
                </div>
              </div>
              <div class="card-body">
                <p class="description">{{ strategy.description }}</p>
                <div class="tags">
                  <el-tag v-for="tag in strategy.tags" :key="tag" size="small">{{ tag }}</el-tag>
                </div>
              </div>
              <div class="card-footer">
                <div class="stats">
                  <span><el-icon>
                      <View />
                    </el-icon> {{ strategy.stats.viewCount }}</span>
                  <span><el-icon>
                      <Star />
                    </el-icon> {{ strategy.stats.likeCount }}</span>
                </div>
                <span class="creator">{{ strategy.creatorName }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="我的攻略" name="my">
        <div v-loading="loading" class="strategies-container">
          <div v-if="myStrategies.length === 0" class="empty-state">
            <el-empty description="你还没有创建任何攻略">
              <el-button type="primary" @click="addStrategy">创建第一个攻略</el-button>
            </el-empty>
          </div>
          <div v-else class="strategies-grid">
            <div v-for="strategy in myStrategies" :key="strategy._id" class="strategy-card"
              @click="viewStrategy(strategy._id)">
              <div class="card-header">
                <img :src="strategy.champion.images.square" :alt="strategy.championName" class="champion-icon" />
                <div class="header-info">
                  <h3>{{ strategy.title }}</h3>
                  <span class="champion-name">{{ strategy.championName }}</span>
                </div>
                <el-tag :type="strategy.status === 'published' ? 'success' : 'info'" size="small">
                  {{ strategy.status === 'published' ? '已发布' : strategy.status === 'draft' ? '草稿' : '已归档' }}
                </el-tag>
              </div>
              <div class="card-body">
                <p class="description">{{ strategy.description }}</p>
                <div class="tags">
                  <el-tag v-for="tag in strategy.tags" :key="tag" size="small">{{ tag }}</el-tag>
                </div>
              </div>
              <div class="card-footer">
                <div class="stats">
                  <span><el-icon>
                      <View />
                    </el-icon> {{ strategy.stats.viewCount }}</span>
                  <span><el-icon>
                      <Star />
                    </el-icon> {{ strategy.stats.likeCount }}</span>
                </div>
                <span class="date">{{ formatDate(strategy.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Floating Action Button -->
    <el-button
      class="fab"
      type="primary"
      :icon="Plus"
      circle
      size="large"
      @click="addStrategy"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, View, Star } from '@element-plus/icons-vue'
import { commonService } from '@/service'
import { useLolStore } from '@/stores/lol'
import { useAuthStore } from '@/stores/auth'
import type { Strategy } from '@/types'

const router = useRouter()
const lolStore = useLolStore()
const authStore = useAuthStore()

const activeTab = ref('all')
const loading = ref(false)
const allStrategies = ref<Strategy[]>([])
const myStrategies = ref<Strategy[]>([])

const init = async () => {
  loading.value = true
  try {
    await lolStore.initializeData()

    // 验证数据是否加载成功
    if (lolStore.champions.length === 0) {
      throw new Error('英雄数据加载失败')
    }

    await loadStrategies()
  } catch (error: any) {
    console.error('Failed to initialize:', error)
    ElMessage.error(error.message || '加载数据失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
}

const loadStrategies = async () => {
  try {
    const [allRes, myRes] = await Promise.all([
      commonService.apiGetStrategies({ status: 'published' }),
      authStore.isAuthenticated ? commonService.apiGetMyStrategies() : Promise.resolve(null)
    ])

    allStrategies.value = allRes?.data?.data?.strategies || []
    myStrategies.value = myRes?.data?.data?.strategies || []
  } catch (error) {
    console.error('Failed to load strategies:', error)
  }
}

const handleTabChange = (tabName: string) => {
  if (tabName === 'my' && !authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/login')
  }
}

const addStrategy = () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push('/lol/create')
}

const viewStrategy = (id: string) => {
  router.push(`/lol/strategy/${id}`)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(() => {
  init()
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/themes/modern-minimal.scss' as theme;

.lol-index {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-lg);
  padding-top: calc(64px + var(--spacing-2xl));
  min-height: calc(100vh - 64px);
  background: var(--color-bg-secondary);
}

.strategy-tabs {
  margin-bottom: var(--spacing-2xl);

  :deep(.el-tabs__header) {
    background: var(--color-bg-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-sm);
    border: 1px solid var(--color-border-primary);
  }

  :deep(.el-tabs__nav-wrap) {
    &::after {
      display: none;
    }
  }

  :deep(.el-tabs__item) {
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    transition: color var(--transition-fast);

    &.is-active {
      color: var(--color-accent-primary);
    }

    &:hover {
      color: var(--color-text-primary);
    }
  }

  :deep(.el-tabs__active-bar) {
    background-color: var(--color-accent-primary);
  }
}

.strategies-container {
  min-height: 400px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-3xl) var(--spacing-lg);

  :deep(.el-empty__description) {
    color: var(--color-text-secondary);
  }
}

.strategies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.strategy-card {
  @include theme.card;
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: var(--color-accent-primary);
    border-radius: 50%;
    opacity: 0;
    transition: all var(--transition-base);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-accent-primary);

    &::before {
      opacity: 0.05;
      width: 150px;
      height: 150px;
    }
  }

  &:active {
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  position: relative;
  z-index: 1;

  .champion-icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-md);
    border: 2px solid var(--color-border-secondary);
    box-shadow: var(--shadow-sm);
    transition: transform var(--transition-fast);
  }

  .header-info {
    flex: 1;
    min-width: 0;

    h3 {
      color: var(--color-text-primary);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      margin: 0 0 var(--spacing-xs) 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: -0.01em;
    }

    .champion-name {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }
  }

  .strategy-card:hover & .champion-icon {
    transform: scale(1.05);
  }
}

.card-body {
  margin-bottom: var(--spacing-lg);
  position: relative;
  z-index: 1;

  .description {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.6;
    margin: 0 0 var(--spacing-md) 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tags {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;

    :deep(.el-tag) {
      background: var(--color-bg-secondary);
      border-color: var(--color-border-secondary);
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
    }
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-primary);
  position: relative;
  z-index: 1;

  .stats {
    display: flex;
    gap: var(--spacing-md);
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);

    span {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      transition: color var(--transition-fast);

      &:hover {
        color: var(--color-text-secondary);
      }
    }
  }

  .creator,
  .date {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
  }
}

// Floating Action Button
.fab {
  @include theme.button-primary;
  position: fixed;
  right: var(--spacing-2xl);
  bottom: var(--spacing-2xl);
  width: 64px;
  height: 64px;
  font-size: 24px;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-fixed);
  transition: all var(--transition-base);
  border: none;

  &:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-2xl);
  }

  &:active {
    transform: scale(0.95);
  }
}

// Responsive Design
@media (max-width: 768px) {
  .lol-index {
    padding: var(--spacing-xl) var(--spacing-md);
    padding-top: calc(56px + var(--spacing-xl));
  }

  .strategies-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .fab {
    right: var(--spacing-lg);
    bottom: var(--spacing-lg);
    width: 56px;
    height: 56px;
    font-size: 20px;
  }
}
</style>
