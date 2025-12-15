import { defineStore } from 'pinia'
import { ref } from 'vue'
import { commonService } from '@/service'
import type { Champion, Item, Augment } from '@/types'

export const useLolStore = defineStore('lol', () => {
  const champions = ref<Champion[]>([])
  const items = ref<Item[]>([])
  const augmentList = ref<Augment[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)
  let initPromise: Promise<void> | null = null

  const CACHE_KEY = 'lol-cache-v1'
  const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

  function readCache() {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.localStorage.getItem(CACHE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as { ts: number; champions?: Champion[]; augmentList?: Augment[] }
      if (!parsed?.ts || Date.now() - parsed.ts > CACHE_TTL_MS) return null
      return parsed
    } catch {
      return null
    }
  }

  function writeCache(payload: { champions?: Champion[]; augmentList?: Augment[] }) {
    if (typeof window === 'undefined') return
    try {
      const existing = readCache() || { ts: Date.now() }
      const next = {
        ts: Date.now(),
        champions: payload.champions ?? existing.champions ?? [],
        augmentList: payload.augmentList ?? existing.augmentList ?? [],
      }
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(next))
    } catch {
      // ignore quota / serialization errors
    }
  }

  // Hydrate cached champions/augmentList immediately for faster first paint
  const cached = readCache()
  if (cached) {
    if (cached.champions?.length) champions.value = cached.champions
    if (cached.augmentList?.length) augmentList.value = cached.augmentList
  }

  async function initializeData() {
    if (isInitialized.value) {
      console.log('LoL data already initialized, skipping...')
      return
    }
    if (initPromise) {
      return initPromise
    }

    isLoading.value = true
    console.log('Starting LoL data initialization...')

    initPromise = (async () => {
      const championsPromise = commonService.apiGetChampions()
      const itemsPromise = commonService.apiGetItems()
      const augmentListPromise = commonService.apiGetAugmentList()

      try {
        const championsRes = await championsPromise
        champions.value = championsRes?.data?.data?.champions || []
        writeCache({ champions: champions.value })

        const [itemsRes, augmentListRes] = await Promise.all([itemsPromise, augmentListPromise])
        items.value = itemsRes?.data?.data?.items || []
        augmentList.value = augmentListRes?.data?.data || []
        writeCache({ champions: champions.value, augmentList: augmentList.value })

        console.log('LoL data loaded:', {
          champions: champions.value.length,
          items: items.value.length,
          augmentList: augmentList.value.length,
        })

        isInitialized.value = true
      } catch (error) {
        await Promise.allSettled([itemsPromise, augmentListPromise])
        console.error('Failed to initialize LOL data:', error)
        throw error // 重新抛出错误以便上层处理
      } finally {
        isLoading.value = false
        initPromise = null
      }
    })()

    return initPromise
  }

  function getChampionByKey(key: string) {
    return champions.value.find(c => c.key === key)
  }

  function getItemById(id: string) {
    return items.value.find(i => i._id === id || i.riotId === id)
  }

  return {
    champions,
    items,
    isLoading,
    isInitialized,
    augmentList,
    initializeData,
    getChampionByKey,
    getItemById,
  }
})
