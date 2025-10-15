<template>
  <div class="strategy-detail">
    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else-if="!strategy" class="not-found">
      <el-empty description="攻略不存在" />
      <el-button type="primary" @click="router.push('/lol')">返回列表</el-button>
    </div>

    <div v-else class="content">
      <div class="header">
        <div class="champion-info">
          <img :src="strategy.champion.images.square" :alt="strategy.championName" class="champion-icon" />
          <div class="info-text">
            <h1>{{ strategy.title }}</h1>
            <div class="meta">
              <span class="champion-name">{{ strategy.championName }}</span>
              <el-tag :type="mapTypeTag(strategy.mapType)">
                {{ mapTypeName(strategy.mapType) }}
              </el-tag>
              <span class="creator">作者: {{ strategy.creatorName }}</span>
            </div>
          </div>
        </div>

        <div class="actions">
          <el-button :icon="isLiked ? Star : StarFilled" @click="handleLike">
            {{ strategy.stats.likeCount }}
          </el-button>
          <el-button v-if="canEdit" type="primary" @click="handleEdit">
            编辑
          </el-button>
        </div>
      </div>

      <div class="stats-bar">
        <div class="stat-item">
          <el-icon><View /></el-icon>
          <span>{{ strategy.stats.viewCount }} 浏览</span>
        </div>
        <div class="stat-item">
          <el-icon><Star /></el-icon>
          <span>{{ strategy.stats.likeCount }} 点赞</span>
        </div>
        <div class="stat-item">
          <el-icon><Clock /></el-icon>
          <span>{{ formatDate(strategy.updatedAt) }}</span>
        </div>
      </div>

      <div class="description-section">
        <h2>攻略描述</h2>
        <p>{{ strategy.description }}</p>
        <div v-if="strategy.tags.length > 0" class="tags">
          <el-tag v-for="tag in strategy.tags" :key="tag" size="small">{{ tag }}</el-tag>
        </div>
      </div>

      <div v-if="strategy.runes" class="runes-section">
        <h2>符文配置</h2>
        <div class="runes-content">
          <div class="rune-tree primary">
            <div class="tree-header">
              <img :src="strategy.runes.primaryTreeIcon" :alt="strategy.runes.primaryTreeName" />
              <h3>{{ strategy.runes.primaryTreeName }} (主系)</h3>
            </div>
            <div class="runes-list">
              <div
                v-for="rune in strategy.runes.primaryRunes"
                :key="rune.id"
                class="rune-item"
                :class="{ keystone: rune.slotIndex === 0 }"
              >
                <img :src="rune.icon" :alt="rune.name" />
                <span>{{ rune.name }}</span>
              </div>
            </div>
          </div>

          <div class="rune-tree secondary">
            <div class="tree-header">
              <img :src="strategy.runes.secondaryTreeIcon" :alt="strategy.runes.secondaryTreeName" />
              <h3>{{ strategy.runes.secondaryTreeName }} (副系)</h3>
            </div>
            <div class="runes-list">
              <div v-for="rune in strategy.runes.secondaryRunes" :key="rune.id" class="rune-item">
                <img :src="rune.icon" :alt="rune.name" />
                <span>{{ rune.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="items-section">
        <h2>装备配置</h2>
        <div class="items-content">
          <div class="items-group">
            <h3>核心装备</h3>
            <div class="items-list">
              <div v-for="item in coreItems" :key="item.item._id" class="item-card">
                <img :src="item.item.image" :alt="item.itemName" />
                <div class="item-info">
                  <span class="item-name">{{ item.itemName }}</span>
                  <span class="item-price">{{ item.item.gold.total }}金币</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="alternativeItems.length > 0" class="items-group">
            <h3>备选装备</h3>
            <div class="items-list">
              <div v-for="item in alternativeItems" :key="item.item._id" class="item-card">
                <img :src="item.item.image" :alt="item.itemName" />
                <div class="item-info">
                  <span class="item-name">{{ item.itemName }}</span>
                  <span class="item-price">{{ item.item.gold.total }}金币</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, View, Star, StarFilled, Clock } from '@element-plus/icons-vue'
import { commonService } from '@/service'
import { useAuthStore } from '@/stores/auth'
import type { Strategy, StrategyItem } from '@/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const strategy = ref<Strategy | null>(null)
const isLiked = ref(false)

const coreItems = computed(() => {
  if (!strategy.value) return []
  return strategy.value.items.filter(item => item.position < 6)
})

const alternativeItems = computed(() => {
  if (!strategy.value) return []
  return strategy.value.items.filter(item => item.position >= 6)
})

const canEdit = computed(() => {
  if (!authStore.user || !strategy.value) return false
  return authStore.user.uid === strategy.value.creator._id
})

async function loadStrategy() {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await commonService.apiGetStrategy(id)
    strategy.value = res?.data?.data || null
  } catch (error) {
    console.error('Failed to load strategy:', error)
    ElMessage.error('加载攻略失败')
  } finally {
    loading.value = false
  }
}

async function handleLike() {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (!strategy.value) return

  try {
    // 切换点赞状态
    const action = isLiked.value ? 'unlike' : 'like'
    const res = await commonService.apiLikeStrategy(strategy.value._id, action)
    const data = res?.data?.data

    if (data) {
      isLiked.value = data.isLiked
      strategy.value.stats.likeCount = data.likeCount
      ElMessage.success(data.isLiked ? '点赞成功' : '已取消点赞')
    }
  } catch (error: any) {
    console.error('Failed to like strategy:', error)
    ElMessage.error(error?.response?.data?.message || '操作失败')
  }
}

function handleEdit() {
  if (!strategy.value) return
  router.push(`/lol/edit/${strategy.value._id}`)
}

function mapTypeName(type: string) {
  const map: Record<string, string> = {
    sr: '召唤师峡谷',
    aram: '极地大乱斗',
    both: '通用'
  }
  return map[type] || type
}

function mapTypeTag(type: string) {
  const map: Record<string, any> = {
    sr: 'success',
    aram: 'warning',
    both: 'info'
  }
  return map[type] || 'info'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadStrategy()
})
</script>

<style lang="scss" scoped>
.strategy-detail {
  padding: 20px;
  margin-top: 90px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.loading,
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;

  .is-loading {
    font-size: 48px;
    color: #c8aa6e;
  }

  span {
    color: rgba(255, 255, 255, 0.7);
    font-size: 18px;
  }
}

.content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 30px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(200, 170, 110, 0.3);
}

.champion-info {
  display: flex;
  gap: 20px;
  flex: 1;

  .champion-icon {
    width: 120px;
    height: 120px;
    border-radius: 12px;
    border: 3px solid #c8aa6e;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .info-text {
    flex: 1;

    h1 {
      color: #fff;
      font-size: 32px;
      font-weight: bold;
      margin: 0 0 15px 0;
      background: linear-gradient(135deg, #c8aa6e 0%, #f0e6d2 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;

      .champion-name {
        color: rgba(255, 255, 255, 0.9);
        font-size: 18px;
        font-weight: 500;
      }

      .creator {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
      }
    }
  }
}

.actions {
  display: flex;
  gap: 10px;
}

.stats-bar {
  display: flex;
  gap: 30px;
  padding: 15px 0;
  margin-bottom: 30px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;

    .el-icon {
      font-size: 18px;
      color: #c8aa6e;
    }
  }
}

.description-section,
.runes-section,
.items-section {
  margin-bottom: 40px;

  h2 {
    color: #c8aa6e;
    font-size: 24px;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid rgba(200, 170, 110, 0.3);
  }

  h3 {
    color: rgba(255, 255, 255, 0.9);
    font-size: 18px;
    margin-bottom: 15px;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    line-height: 1.8;
    margin-bottom: 15px;
  }

  .tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    :deep(.el-tag) {
      background: rgba(200, 170, 110, 0.1);
      border-color: rgba(200, 170, 110, 0.3);
      color: #c8aa6e;
    }
  }
}

.runes-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.rune-tree {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  border: 2px solid rgba(200, 170, 110, 0.2);

  &.primary {
    border-color: rgba(200, 170, 110, 0.5);
  }

  .tree-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    img {
      width: 48px;
      height: 48px;
      border-radius: 8px;
    }

    h3 {
      color: #fff;
      font-size: 18px;
      margin: 0;
    }
  }

  .runes-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rune-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &.keystone {
      border: 2px solid #c8aa6e;
      background: rgba(200, 170, 110, 0.1);

      img {
        width: 52px;
        height: 52px;
      }

      span {
        font-size: 16px;
        font-weight: bold;
      }
    }

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #c8aa6e;
    }

    span {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }
  }
}

.items-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.items-group {
  h3 {
    color: rgba(255, 255, 255, 0.9);
    font-size: 18px;
    margin-bottom: 15px;
  }

  .items-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }
}

.item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(200, 170, 110, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #c8aa6e;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(200, 170, 110, 0.2);
  }

  img {
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
    border-radius: 8px;
  }

  .item-info {
    text-align: center;

    .item-name {
      display: block;
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 5px;
    }

    .item-price {
      display: block;
      color: #c8aa6e;
      font-size: 12px;
    }
  }
}

@media (max-width: 1024px) {
  .runes-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 20px;
  }

  .champion-info {
    flex-direction: column;
    align-items: center;
    text-align: center;

    .info-text h1 {
      font-size: 24px;
    }
  }

  .stats-bar {
    flex-wrap: wrap;
    gap: 15px;
  }

  .items-list {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
