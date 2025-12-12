import { defineStore } from 'pinia'
import { ref } from 'vue'
import { commonService } from '@/service'
import type { Champion, Item, Hex } from '@/types'

export const useLolStore = defineStore('lol', () => {
  const champions = ref<Champion[]>([])
  const items = ref<Item[]>([])
  const hexList = ref<Hex[]>([])
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
      const parsed = JSON.parse(raw) as { ts: number; champions?: Champion[]; hexList?: Hex[] }
      if (!parsed?.ts || Date.now() - parsed.ts > CACHE_TTL_MS) return null
      return parsed
    } catch {
      return null
    }
  }

  function writeCache(payload: { champions?: Champion[]; hexList?: Hex[] }) {
    if (typeof window === 'undefined') return
    try {
      const existing = readCache() || { ts: Date.now() }
      const next = {
        ts: Date.now(),
        champions: payload.champions ?? existing.champions ?? [],
        hexList: payload.hexList ?? existing.hexList ?? [],
      }
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(next))
    } catch {
      // ignore quota / serialization errors
    }
  }

  // Hydrate cached champions/hexList immediately for faster first paint
  const cached = readCache()
  if (cached) {
    if (cached.champions?.length) champions.value = cached.champions
    if (cached.hexList?.length) hexList.value = cached.hexList
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
      const hexListPromise = commonService.apiGetHexList()

      try {
        const championsRes = await championsPromise
        champions.value = championsRes?.data?.data?.champions || []
        writeCache({ champions: champions.value })

        const [itemsRes, hexListRes] = await Promise.all([itemsPromise, hexListPromise])
        items.value = itemsRes?.data?.data?.items || []
        hexList.value = hexListRes?.data?.data || []
        writeCache({ champions: champions.value, hexList: hexList.value })

        console.log('LoL data loaded:', {
          champions: champions.value.length,
          items: items.value.length,
          hexList: hexList.value.length,
        })

        isInitialized.value = true
      } catch (error) {
        await Promise.allSettled([itemsPromise, hexListPromise])
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
    hexList,
    initializeData,
    getChampionByKey,
    getItemById,
  }
})
