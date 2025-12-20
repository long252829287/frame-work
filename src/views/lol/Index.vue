<template>
  <div class="lol-shell">
    <header class="lol-topbar">
      <div class="lol-brand" role="button" tabindex="0" @click="goHome">
        <span class="lol-logo" aria-hidden="true" />
        <span class="lol-brand-text">海克斯大乱斗</span>
      </div>
      <nav class="lol-nav" aria-label="Primary">
        <button class="lol-nav-item lol-nav-item--active" type="button">英雄</button>
        <button class="lol-nav-item" type="button" disabled>社区建设</button>
        <button class="lol-nav-item" type="button" disabled>排行榜</button>
      </nav>
      <div class="lol-actions">
        <button class="lol-icon-btn" type="button" title="返回上一页" @click="goBack">
          <el-icon>
            <ArrowLeft />
          </el-icon>
        </button>
        <button class="lol-icon-btn" type="button" title="返回主页" @click="goHome">
          <el-icon>
            <HomeFilled />
          </el-icon>
        </button>
        <button class="lol-avatar" type="button" title="Account">
          <img :src="userAvatar" :alt="displayName" class="rounded-full object-cover border-2 border-primary" />
        </button>
      </div>
    </header>
    <main class="lol-main">
      <section class="lol-left">
        <div class="lol-hero">
          <div class="lol-hero-text">
            <h3>选择英雄</h3>
            <p>探索海克斯大乱斗的统计数据、配置和策略。</p>
          </div>

          <div class="lol-search">
            <el-icon class="lol-search-icon">
              <Search />
            </el-icon>
            <input v-model="championQuery" class="lol-search-input" placeholder="请输入英雄名称" />
          </div>
        </div>

        <div class="lol-filters">
          <button v-for="r in roles" :key="r.key" type="button" class="lol-chip"
            :class="{ 'lol-chip--active': roleFilter === r.key }" @click="roleFilter = r.key">
            <span class="lol-chip-dot" aria-hidden="true" />
            {{ r.label }}
          </button>
        </div>

        <div class="lol-grid" aria-label="Champion grid">
          <template v-if="championsLoading && !champions.length">
            <div v-for="n in 10" :key="`sk-${n}`" class="lol-card lol-card--skeleton" />
          </template>

          <button v-for="c in filteredChampions" :key="c._id" type="button" class="lol-card"
            :class="{ 'lol-card--active': selectedChampion?._id === c._id }" @click="selectChampion(c)">
            <img class="lol-card-bg" :src="championCardImage(c)" :alt="c.name" loading="lazy" />
            <span class="lol-card-overlay" aria-hidden="true" />
            <div class="lol-card-meta">
              <div class="lol-card-name">{{ c.name }}</div>
              <div class="lol-card-role">{{ primaryRole(c) }}</div>
            </div>
          </button>

          <div v-if="!championsLoading && filteredChampions.length === 0" class="lol-empty">
            <div class="lol-empty-title">没找到对应英雄</div>
            <div class="lol-empty-sub">请尝试其他关键词或筛选条件。</div>
          </div>
        </div>
      </section>

      <aside class="lol-right">
        <div class="lol-panel">
          <template v-if="selectedChampion">
            <div class="lol-panel-head">
              <div class="lol-panel-title">
                <div class="lol-panel-name">{{ selectedChampion.name }}</div>
                <div class="lol-panel-sub">{{ selectedChampion.title }}</div>
              </div>
            </div>

            <div class="lol-panel-body">
              <div class="lol-hero-splash" :class="{ 'lol-hero-splash--loading': isSplashLoading }">
                <img :src="splashSrc" :alt="selectedChampion.name" loading="eager" decoding="async"
                  @load="onSplashLoad" />
                <div v-if="isSplashLoading" class="lol-splash-loader">
                  <LoadingComp :visible="true" :fullscreen="false" :overlay="false" :blocking="false" :dim="false"
                    text="正在加载中…" />
                </div>
              </div>

              <div v-if="strategiesLoading" class="lol-skel-block">
                <div class="lol-skel-line" />
                <div class="lol-skel-line lol-skel-line--sm" />
                <div class="lol-skel-orbs">
                  <div v-for="n in 4" :key="`sk-orb-${n}`" class="lol-orb lol-orb--skeleton" />
                </div>
              </div>

              <template v-else>
                <div v-if="strategies.length > 1" class="lol-tabs" role="tablist" aria-label="Strategies">
                  <button v-for="s in strategies" :key="s._id" type="button" class="lol-tab"
                    :class="{ 'lol-tab--active': selectedStrategyId === s._id }" @click="selectedStrategyId = s._id">
                    {{ s.title }}
                  </button>
                </div>

                <div class="lol-section">
                  <div class="lol-section-title">常规出装</div>
                  <div class="lol-orbs">
                    <div v-for="(it, idx) in coreBuildOrbs" :key="`core-${idx}`" class="lol-orb">
                      <img v-if="it" :src="it" alt="" />
                      <div v-else class="lol-orb-empty" />
                    </div>
                  </div>
                </div>

                <div class="lol-section">
                  <div class="lol-section-title">其他可选</div>
                  <div class="lol-orbs">
                    <div v-for="(it, idx) in extraBuildOrbs" :key="`extra-${idx}`" class="lol-orb">
                      <img v-if="it" :src="it" alt="" />
                      <div v-else class="lol-orb-empty" />
                    </div>
                  </div>
                </div>

                <div class="lol-section">
                  <div class="lol-section-title">海克斯推荐</div>
                  <div class="lol-orbs lol-orbs--aug">
                    <div v-for="(it, idx) in augmentOrbs" :key="`aug-${idx}`" class="lol-orb lol-orb--aug">
                      <img v-if="it" :src="it" alt="" />
                      <div v-else class="lol-orb-empty" />
                    </div>
                  </div>
                </div>

                <div class="lol-desc" v-if="selectedStrategy?.description">
                  {{ selectedStrategy.description }}
                </div>
                <div class="lol-desc lol-desc--empty" v-else>
                  暂无描述。
                </div>

                <div class="lol-cta">
                  <button class="lol-primary" type="button" :disabled="!selectedStrategy" @click="exportStrategyCard">
                    <el-icon>
                      <Download />
                    </el-icon>
                    导出攻略为一图流
                  </button>
                  <button class="lol-secondary" type="button" :disabled="!selectedChampion" @click="goCreate">
                    <el-icon>
                      <Plus />
                    </el-icon>
                    新建攻略
                  </button>
                  <button v-if="selectedStrategy" class="lol-like" type="button" :disabled="isLiking"
                    @click="toggleLike">
                    <el-icon>
                      <Star />
                    </el-icon>
                    <span>{{ selectedStrategy.stats?.likeCount ?? 0 }}</span>
                  </button>
                </div>

                <div v-if="!selectedStrategy && !strategies.length" class="lol-empty-inline">
                  <div class="lol-empty-title">没有攻略</div>
                  <div class="lol-empty-sub">成为第一个为这位英雄制定攻略的人。</div>
                </div>
              </template>
            </div>
          </template>

          <template v-else>
            <div class="lol-empty-inline">
              <div class="lol-empty-title">选择一个英雄</div>
              <div class="lol-empty-sub">请选择一个英雄以查看相关攻略</div>
            </div>
          </template>
        </div>

        <div class="lol-trending">
          <div class="lol-trending-head">
            <div class="lol-trending-title">热门攻略</div>
            <button class="lol-link" type="button" disabled>查看全部</button>
          </div>

          <div class="lol-trending-list">
            <template v-if="trendingLoading">
              <div v-for="n in 2" :key="`trend-sk-${n}`" class="lol-trend lol-trend--skeleton" />
            </template>

            <button v-for="s in trending" :key="s._id" class="lol-trend" type="button" @click="openTrending(s)">
              <img class="lol-trend-icon" :src="s.champion?.images?.square" :alt="s.championName" />
              <div class="lol-trend-meta">
                <div class="lol-trend-title2">{{ s.title }}</div>
                <div class="lol-trend-sub2">已经 {{ s.creatorName }} · {{ s.stats?.likeCount ?? 0 }} 喜欢</div>
              </div>
            </button>

            <div v-if="!trendingLoading && trending.length === 0" class="lol-empty lol-empty--tight">
              <div class="lol-empty-sub">目前还没有热门攻略</div>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <div class="lol-export-stage" aria-hidden="true">
      <div v-if="selectedChampion && selectedStrategy" ref="exportCardRef" class="lol-export-card">
        <div class="lol-export-hero">
          <img class="lol-export-bg" :src="exportSplash" alt="" />
          <div class="lol-export-overlay" />
          <div class="lol-export-meta">
            <div class="lol-export-name">{{ selectedChampion.name }}</div>
            <div class="lol-export-sub">{{ selectedStrategy.title }}</div>
          </div>
        </div>
        <div class="lol-export-body">
          <div class="lol-export-row">
            <div class="lol-export-label">推荐</div>
            <div class="lol-export-orbs">
              <div v-for="(it, idx) in coreBuildOrbs" :key="`exp-core-${idx}`" class="lol-export-orb">
                <img v-if="it" :src="it" alt="" />
              </div>
            </div>
          </div>
          <div class="lol-export-row">
            <div class="lol-export-label">其他</div>
            <div class="lol-export-orbs">
              <div v-for="(it, idx) in extraBuildOrbs" :key="`exp-extra-${idx}`" class="lol-export-orb">
                <img v-if="it" :src="it" alt="" />
              </div>
            </div>
          </div>
          <div class="lol-export-row">
            <div class="lol-export-label">强化</div>
            <div class="lol-export-orbs">
              <div v-for="(it, idx) in augmentOrbs" :key="`exp-aug-${idx}`" class="lol-export-orb">
                <img v-if="it" :src="it" alt="" />
              </div>
            </div>
          </div>
          <div v-if="selectedStrategy.description" class="lol-export-desc">
            {{ selectedStrategy.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Download, HomeFilled, Plus, Search, Star } from '@element-plus/icons-vue'
import domToImage from 'dom-to-image'
import { commonService } from '@/service'
import { useLolStore } from '@/stores/lol'
import { useAuthStore } from '@/stores/auth'

import type { Augment, Champion, Strategy } from '@/types'
import { LoadingComp } from '@/components/loading';

type RoleKey = 'all' | 'Fighter' | 'Mage' | 'Tank' | 'Support' | 'Marksman'
const router = useRouter()
const route = useRoute()
const lolStore = useLolStore()

const championsLoading = ref(false)
const championQuery = ref('')
const roleFilter = ref<RoleKey>('all')

const selectedChampion = ref<Champion | null>(null)
const strategiesLoading = ref(false)
const strategies = ref<Strategy[]>([])
const selectedStrategyId = ref('')

const trendingLoading = ref(false)
const trending = ref<Strategy[]>([])

const augmentMap = ref<Record<string, Augment>>({})
const isLiking = ref(false)
const likedState = ref<Record<string, boolean>>({})

const exportCardRef = ref<HTMLElement | null>(null)
const isSplashLoading = ref(false)
const splashSrc = ref('')
const pendingSplashFinalSrc = ref('')
const auth = useAuthStore()

let splashRequestId = 0

const roles = [
  { key: 'all' as const, label: '所有角色' },
  { key: 'Fighter' as const, label: '战士' },
  { key: 'Mage' as const, label: '法师' },
  { key: 'Tank' as const, label: '坦克' },
  { key: 'Support' as const, label: '辅助' },
  { key: 'Marksman' as const, label: '射手' },
]
const roleMap: Record<RoleKey, string> = {
  'Fighter': '战士',
  'Mage': '法师',
  'Tank': '坦克',
  'Support': '辅助',
  'Marksman': '射手',
  'all': '全部'
};

const champions = computed(() => lolStore.champions || [])

const displayName = computed(() => auth.user?.nickname || auth.user?.username || '用户')

const userAvatar = computed(
  () => 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
)
const primaryRole = (c: Champion): string => {
  const firstTag = c.tags?.[0];
  if (firstTag && firstTag in roleMap) {
    return roleMap[firstTag as RoleKey];
  }
  return '未知';
};

const filteredChampions = computed(() => {
  const q = championQuery.value.trim().toLowerCase()
  const list = champions.value
  const byRole =
    roleFilter.value === 'all'
      ? list
      : list.filter(c => (c.tags || []).map(t => String(t)).includes(roleFilter.value))

  if (!q) return byRole
  return byRole.filter(c => {
    const name = c.name?.toLowerCase() || ''
    const title = c.title?.toLowerCase() || ''
    const key = c.key?.toLowerCase() || ''
    return name.includes(q) || title.includes(q) || key.includes(q)
  })
})

const selectedStrategy = computed(() => {
  if (!selectedStrategyId.value) return null
  return strategies.value.find(s => s._id === selectedStrategyId.value) || null
})

const getStrategyItemImage = (s: Strategy, position: number) => {
  const found = s.items.find(i => i.position === position)
  return found?.itemImage || found?.item?.image || null
}

const coreBuildOrbs = computed(() => {
  const s = selectedStrategy.value
  if (!s) return Array(6).fill(null) as Array<string | null>
  const imgs = [0, 1, 2, 3].map(p => getStrategyItemImage(s, p)).filter(Boolean) as string[]
  return [...imgs, ...Array(Math.max(0, 6 - imgs.length)).fill(null)]
})

const extraBuildOrbs = computed(() => {
  const s = selectedStrategy.value
  if (!s) return Array(6).fill(null) as Array<string | null>
  const imgs = [6, 7, 8, 9].map(p => getStrategyItemImage(s, p)).filter(Boolean) as string[]
  return [...imgs, ...Array(Math.max(0, 6 - imgs.length)).fill(null)]
})

const augmentOrbs = computed(() => {
  const s = selectedStrategy.value
  if (!s?.augmentIds?.length) return Array(6).fill(null) as Array<string | null>
  const icons = s.augmentIds
    .slice(0, 3)
    .map(id => augmentMap.value[id]?.icon)
    .filter(Boolean) as string[]
  return [...icons, ...Array(Math.max(0, 3 - icons.length)).fill(null)]
})

const exportSplash = computed(() => {
  const c = selectedChampion.value
  return c?.images?.loading || c?.images?.splash || c?.images?.square || ''
})

const goBack = () => router.back()
const goHome = () => router.push({ name: 'home' })

const goCreate = () => {
  if (!selectedChampion.value) return
  router.push({
    name: 'lol-create',
    query: { championKey: selectedChampion.value.key },
    state: { champion: selectedChampion.value },
  } as any)
}

const normalizeAugmentList = (payload: any): Augment[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.augments)) return payload.augments
  return []
}

const loadAugments = async () => {
  if (Object.keys(augmentMap.value).length) return
  try {
    const cached = typeof window !== 'undefined' ? window.localStorage.getItem('lol-hex-augments-map-v1') : null
    if (cached) {
      augmentMap.value = JSON.parse(cached)
      return
    }
  } catch {
    // ignore
  }

  try {
    const res = await commonService.apiGetAugments({ mode: 'hex_brawl', isActive: true, limit: 200 })
    const list = normalizeAugmentList(res?.data?.data)
    const next: Record<string, Augment> = {}
    for (const a of list) next[a.augmentId] = a
    augmentMap.value = next
    try {
      window.localStorage.setItem('lol-hex-augments-map-v1', JSON.stringify(next))
    } catch {
      // ignore
    }
  } catch {
    const next: Record<string, Augment> = {}
    for (const a of lolStore.augmentList || []) next[a.augmentId] = a
    augmentMap.value = next
  }
}

const fetchStrategies = async (championKey: string, preferStrategyId?: string) => {
  strategiesLoading.value = true
  try {
    const res = await commonService.apiGetStrategies({ championKey, mode: 'hex_brawl' })
    const list = res?.data?.data?.strategies || []
    strategies.value = list
    const target = preferStrategyId && list.some(s => s._id === preferStrategyId) ? preferStrategyId : list[0]?._id
    selectedStrategyId.value = target || ''
  } catch (e) {
    console.error(e)
    try {
      const res2 = await commonService.apiGetStrategies({ championKey })
      const list2 = res2?.data?.data?.strategies || []
      strategies.value = list2
      selectedStrategyId.value = list2[0]?._id || ''
    } catch {
      strategies.value = []
      selectedStrategyId.value = ''
    }
  } finally {
    strategiesLoading.value = false
  }
}

const prefetchImage = (url: string) =>
  new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('image load error'))
    img.src = url
  })

const syncSplash = (c: Champion) => {
  const placeholder = c.images.loading || c.images.square || c.images.splash || ''
  const final = c.images.splash || c.images.loading || c.images.square || ''

  splashRequestId += 1
  const reqId = splashRequestId

  splashSrc.value = placeholder || final
  pendingSplashFinalSrc.value = final || placeholder
  isSplashLoading.value = !!pendingSplashFinalSrc.value

  if (final && final !== splashSrc.value) {
    void prefetchImage(final)
      .then(() => {
        if (reqId !== splashRequestId) return
        splashSrc.value = final
      })
      .catch(() => {
        // ignore
      })
  }
}

const selectChampion = async (c: Champion) => {
  if (selectedChampion.value?._id === c._id) return
  selectedChampion.value = c
  syncSplash(c)
  await Promise.all([fetchStrategies(c.key), loadAugments()])
}
const onSplashLoad = () => {
  if (splashSrc.value && splashSrc.value === pendingSplashFinalSrc.value) {
    isSplashLoading.value = false
  }
}

const openTrending = async (s: Strategy) => {
  const champ = lolStore.getChampionByKey(s.championKey)
  if (!champ) return
  selectedChampion.value = champ
  syncSplash(champ)
  await Promise.all([fetchStrategies(champ.key, s._id), loadAugments()])
}

const exportStrategyCard = async () => {
  if (!exportCardRef.value) return
  try {
    ElMessage.info('Generating image…')
    const dataUrl = await domToImage.toPng(exportCardRef.value, { quality: 0.96 })
    const link = document.createElement('a')
    link.download = `${selectedChampion.value?.name || 'strategy'}-${selectedStrategy.value?.title || 'card'}.png`
    link.href = dataUrl
    link.click()
    ElMessage.success('Exported')
  } catch (e) {
    console.error(e)
    ElMessage.error('Failed to export')
  }
}

const toggleLike = async () => {
  const s = selectedStrategy.value
  if (!s) return
  if (isLiking.value) return
  isLiking.value = true
  try {
    const isLiked = !!likedState.value[s._id]
    const res = await commonService.apiLikeStrategy(s._id, isLiked ? 'unlike' : 'like')
    const data = res?.data?.data
    likedState.value = { ...likedState.value, [s._id]: !!data?.isLiked }
    const nextCount = typeof data?.likeCount === 'number' ? data.likeCount : s.stats.likeCount
    strategies.value = strategies.value.map(it =>
      it._id === s._id ? { ...it, stats: { ...it.stats, likeCount: nextCount } } : it,
    )
  } catch (e) {
    console.error(e)
    ElMessage.error('Like failed')
  } finally {
    isLiking.value = false
  }
}

const championCardImage = (c: Champion) => c.images.square || c.images.loading || c.images.splash

const boot = async () => {
  championsLoading.value = true
  try {
    if (!lolStore.champions.length) {
      const res = await commonService.apiGetChampions()
      lolStore.champions = res?.data?.data?.champions || []
    }
    const keyFromQuery = String(route.query.championKey || '')
    const initial = keyFromQuery ? lolStore.getChampionByKey(keyFromQuery) : undefined
    const first = initial || filteredChampions.value[0] || lolStore.champions[0]
    if (first) await selectChampion(first)
  } catch (e: any) {
    ElMessage.error(e?.message || 'Failed to load LOL data')
  } finally {
    championsLoading.value = false
  }
}

const loadTrending = async () => {
  trendingLoading.value = true
  try {
    const res = await commonService.apiGetPopularStrategies(10)
    const list = res?.data?.data?.strategies || []
    trending.value = list
      .filter(s => (s.mode === 'hex_brawl' || s.mapType === 'aram') && s.champion?.images?.square)
      .slice(0, 2)
  } catch {
    trending.value = []
  } finally {
    trendingLoading.value = false
  }
}

onMounted(() => {
  boot()
  // loadTrending()
})

watch(
  () => route.query.championKey,
  key => {
    const k = String(key || '')
    const champ = k ? lolStore.getChampionByKey(k) : undefined
    if (champ) selectChampion(champ)
  },
)
</script>

<style scoped lang="scss">
.lol-shell {
  --lol-bg0: #0b1220;
  --lol-bg1: #0b1b22;
  --lol-surface: rgba(255, 255, 255, 0.06);
  --lol-surface-2: rgba(255, 255, 255, 0.08);
  --lol-border: rgba(255, 255, 255, 0.12);
  --lol-border-soft: rgba(255, 255, 255, 0.08);
  --lol-text: rgba(248, 250, 252, 0.92);
  --lol-dim: rgba(248, 250, 252, 0.66);
  --lol-faint: rgba(248, 250, 252, 0.44);
  --lol-accent: #3b82f6;
  --lol-accent-2: #22d3ee;
  --lol-shadow: 0 22px 60px rgba(0, 0, 0, 0.42);
  --lol-shadow-soft: 0 10px 28px rgba(0, 0, 0, 0.3);

  height: 100%;
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.22);
  overflow: hidden;
  background:
    radial-gradient(1200px circle at 16% 12%, rgba(59, 130, 246, 0.16), transparent 55%),
    radial-gradient(900px circle at 78% 20%, rgba(34, 211, 238, 0.12), transparent 55%),
    radial-gradient(900px circle at 64% 92%, rgba(255, 159, 10, 0.08), transparent 58%),
    linear-gradient(180deg, var(--lol-bg0) 0%, var(--lol-bg1) 100%);
  color: var(--lol-text);
}

.lol-topbar {
  height: 56px;
  display: grid;
  grid-template-columns: 220px 1fr 220px;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
}

.lol-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.lol-logo {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(34, 211, 238, 0.9) 100%);
  box-shadow: 0 10px 24px rgba(59, 130, 246, 0.18);
}

.lol-brand-text {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.2px;
}

.lol-nav {
  justify-self: center;
  display: inline-flex;
  gap: 8px;
  padding: 6px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(14px);
}

.lol-nav-item {
  height: 30px;
  padding: 0 14px;
  border-radius: 9999px;
  color: var(--lol-dim);
  font-size: 12px;
  font-weight: 800;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease;
}

.lol-nav-item--active {
  background: rgba(59, 130, 246, 0.16);
  color: var(--lol-text);
}

.lol-nav-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lol-actions {
  justify-self: end;
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.lol-icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--lol-text);
  cursor: pointer;
  transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
}

.lol-icon-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.lol-avatar {
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--lol-text);
  font-weight: 900;
  cursor: pointer;
}

.lol-main {
  height: calc(100% - 56px);
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 18px;
  padding: 14px 18px 18px;
  overflow: hidden;
}

.lol-left {
  min-width: 0;
  overflow: auto;
  padding-right: 6px;
}

.lol-hero {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
  align-items: center;
  margin-bottom: 14px;
}

.lol-hero-text h3 {
  margin: 0;
  font-size: 30px;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--lol-accent);
}

.lol-hero-text p {
  margin: 10px 0 0;
  color: var(--lol-dim);
  font-size: 13px;
}

.lol-search {
  height: 42px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  box-shadow: var(--lol-shadow-soft);
  backdrop-filter: blur(14px);
}

.lol-search-icon {
  color: var(--lol-faint);
}

.lol-search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--lol-text);
  font-size: 13px;
  font-weight: 800;
}

.lol-search-input::placeholder {
  color: var(--lol-faint);
}

.lol-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.lol-chip {
  height: 32px;
  padding: 0 12px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--lol-dim);
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, color 160ms ease;
}

.lol-chip-dot {
  width: 10px;
  height: 10px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.14);
}

.lol-chip--active {
  background: rgba(59, 130, 246, 0.16);
  border-color: rgba(59, 130, 246, 0.28);
  color: var(--lol-text);
}

.lol-chip--active .lol-chip-dot {
  background: rgba(59, 130, 246, 0.92);
}

.lol-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 120px));
  gap: 12px;
  align-content: start;
  justify-content: start;
}

.lol-card {
  position: relative;
  aspect-ratio: 1 / 1;
  min-height: 120px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.20);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: var(--lol-shadow-soft);
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  text-align: left;
  transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
}

.lol-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: var(--lol-shadow);
}

.lol-card--active {
  border-color: rgba(59, 130, 246, 0.46);
  box-shadow:
    0 18px 48px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(59, 130, 246, 0.22);
}

.lol-card-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.92) contrast(1.05);
  transform: scale(1.06);
}

.lol-card-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.66) 100%),
    radial-gradient(420px circle at 24% 16%, rgba(59, 130, 246, 0.16), transparent 55%);
}

.lol-card-meta {
  position: absolute;
  left: 10px;
  bottom: 10px;
}

.lol-card-name {
  font-weight: 950;
  font-size: 12px;
  letter-spacing: -0.01em;
}

.lol-card-role {
  font-size: 10px;
  font-weight: 950;
  color: rgba(59, 130, 246, 0.9);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.lol-card--skeleton {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: none;
  cursor: default;
}

.lol-right {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  overflow: auto;
  padding-right: 6px;
}

.lol-panel {
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: var(--lol-shadow);
  overflow: hidden;
  backdrop-filter: blur(16px);
}

.lol-panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 10px;
}

.lol-panel-name {
  font-size: 22px;
  font-weight: 950;
  letter-spacing: -0.02em;
}

.lol-panel-sub {
  font-size: 12px;
  color: var(--lol-dim);
  margin-top: 4px;
}

.lol-panel-body {
  padding: 10px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.lol-hero-splash {
  position: relative;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  padding: 6px;
  overflow: hidden;
  min-height: 200px;
}

.lol-hero-splash img {
  opacity: 1;
  transition: opacity 0.3s ease;
  width: 100%;
  display: block;
  border-radius: 14px;
  object-fit: cover;
  max-height: 240px;
}

.lol-splash-loader {
  position: absolute;
  inset: 6px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  z-index: 2;
}

.lol-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--lol-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.lol-hero-splash--loading img {
  opacity: 0.72;
  filter: blur(6px) saturate(0.95);
  transform: scale(1.02);
  transition: opacity 0.22s ease, filter 0.22s ease, transform 0.22s ease;
}

.lol-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.lol-tab {
  height: 26px;
  padding: 0 10px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.18);
  color: var(--lol-dim);
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

.lol-tab--active {
  background: rgba(59, 130, 246, 0.16);
  border-color: rgba(59, 130, 246, 0.28);
  color: var(--lol-text);
}

.lol-section-title {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--lol-faint);
  font-weight: 950;
}

.lol-orbs {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.lol-orbs--aug {
  grid-template-columns: repeat(6, 1fr);
}

.lol-orb {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.lol-orb--aug {
  border-radius: 16px;
}

.lol-orb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lol-orb-empty {
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.10), transparent 60%),
    rgba(255, 255, 255, 0.04);
}

.lol-orb--skeleton {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.lol-desc {
  font-size: 12px;
  color: var(--lol-dim);
  line-height: 1.5;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.16);
  padding: 10px 12px;
  max-height: 92px;
  overflow: hidden;
}

.lol-desc--empty {
  color: var(--lol-faint);
}

.lol-cta {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.lol-primary,
.lol-secondary,
.lol-like {
  height: 44px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 950;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 160ms ease, filter 160ms ease, background 160ms ease, border-color 160ms ease;
}

.lol-primary {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(34, 211, 238, 0.92) 100%);
  color: #071422;
  box-shadow: 0 18px 40px rgba(59, 130, 246, 0.22);
}

.lol-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.lol-secondary {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
  color: var(--lol-text);
}

.lol-like {
  background: rgba(0, 0, 0, 0.18);
  border-color: rgba(255, 255, 255, 0.08);
  color: var(--lol-dim);
  height: 38px;
}

.lol-primary:hover:not(:disabled),
.lol-secondary:hover:not(:disabled),
.lol-like:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: saturate(1.04);
}

.lol-secondary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.lol-trending {
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: var(--lol-shadow-soft);
  padding: 14px;
  backdrop-filter: blur(16px);
}

.lol-trending-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}

.lol-trending-title {
  font-size: 14px;
  font-weight: 950;
}

.lol-link {
  border: 0;
  background: transparent;
  color: rgba(59, 130, 246, 0.9);
  font-size: 12px;
  font-weight: 900;
  cursor: not-allowed;
  opacity: 0.6;
}

.lol-trending-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lol-trend {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  text-align: left;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.lol-trend:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.07);
}

.lol-trend-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.lol-trend-title2 {
  font-weight: 950;
  font-size: 12px;
  color: var(--lol-text);
}

.lol-trend-sub2 {
  font-size: 11px;
  color: var(--lol-faint);
  margin-top: 4px;
}

.lol-trend--skeleton {
  height: 56px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.lol-empty {
  padding: 18px;
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.14);
  text-align: center;
  grid-column: 1 / -1;
}

.lol-empty--tight {
  padding: 12px;
}

.lol-empty-title {
  font-weight: 950;
}

.lol-empty-sub {
  margin-top: 8px;
  color: var(--lol-dim);
  font-size: 12px;
}

.lol-empty-inline {
  padding: 16px;
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.14);
  text-align: center;
}

.lol-skel-block {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 14px;
}

.lol-skel-line {
  height: 12px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
}

.lol-skel-line--sm {
  width: 60%;
  margin-top: 10px;
}

.lol-skel-orbs {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.lol-export-stage {
  position: fixed;
  left: -9999px;
  top: 0;
  width: 640px;
}

.lol-export-card {
  width: 640px;
  border-radius: 18px;
  overflow: hidden;
  background:
    radial-gradient(900px circle at 16% 12%, rgba(59, 130, 246, 0.18), transparent 56%),
    linear-gradient(180deg, #0b1220 0%, #0b1b22 100%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55);
  color: var(--lol-text);
}

.lol-export-hero {
  position: relative;
  height: 240px;
}

.lol-export-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lol-export-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0.78) 100%);
}

.lol-export-meta {
  position: absolute;
  left: 18px;
  bottom: 16px;
}

.lol-export-name {
  font-size: 24px;
  font-weight: 980;
}

.lol-export-sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--lol-dim);
  font-weight: 900;
}

.lol-export-body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lol-export-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lol-export-label {
  width: 84px;
  font-size: 12px;
  font-weight: 950;
  color: rgba(59, 130, 246, 0.92);
}

.lol-export-orbs {
  display: flex;
  gap: 8px;
}

.lol-export-orb {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
}

.lol-export-orb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lol-export-desc {
  margin-top: 6px;
  font-size: 12px;
  color: var(--lol-dim);
  line-height: 1.5;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(0, 0, 0, 0.16);
  padding: 10px 12px;
}

@media (max-width: 1200px) {
  .lol-main {
    grid-template-columns: 1fr;
  }

  .lol-hero {
    grid-template-columns: 1fr;
  }

  .lol-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .lol-topbar {
    grid-template-columns: 1fr auto;
  }

  .lol-nav {
    display: none;
  }

  .lol-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
