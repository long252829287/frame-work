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
.lol-index {
  padding: 20px;
  margin-top: 90px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.strategy-tabs {
  :deep(.el-tabs__header) {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 20px;
  }

  :deep(.el-tabs__nav-wrap) {
    &::after {
      display: none;
    }
  }

  :deep(.el-tabs__item) {
    color: rgba(255, 255, 255, 0.7);
    font-size: 16px;
    font-weight: 500;

    &.is-active {
      color: #c8aa6e;
    }

    &:hover {
      color: #fff;
    }
  }

  :deep(.el-tabs__active-bar) {
    background-color: #c8aa6e;
  }
}

.strategies-container {
  min-height: 400px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;

  :deep(.el-empty__description) {
    color: rgba(255, 255, 255, 0.6);
  }
}

.strategies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.strategy-card {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%);
  border: 2px solid rgba(200, 170, 110, 0.2);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #c8aa6e;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(200, 170, 110, 0.2);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;

  .champion-icon {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    border: 2px solid #c8aa6e;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .header-info {
    flex: 1;
    min-width: 0;

    h3 {
      color: #fff;
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 4px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .champion-name {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }
  }
}

.card-body {
  margin-bottom: 15px;

  .description {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    line-height: 1.6;
    margin: 0 0 10px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;

    :deep(.el-tag) {
      background: rgba(200, 170, 110, 0.1);
      border-color: rgba(200, 170, 110, 0.3);
      color: #c8aa6e;
    }
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .stats {
    display: flex;
    gap: 15px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .creator,
  .date {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
  }
}

// Floating Action Button
.fab {
  position: fixed;
  right: 40px;
  bottom: 40px;
  width: 64px;
  height: 64px;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(200, 170, 110, 0.4);
  z-index: 1000;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(200, 170, 110, 0.6);
  }

  &:active {
    transform: scale(0.95);
  }
}

@media (max-width: 768px) {
  .strategies-grid {
    grid-template-columns: 1fr;
  }

  .fab {
    right: 20px;
    bottom: 20px;
    width: 56px;
    height: 56px;
    font-size: 20px;
  }
}
</style>
