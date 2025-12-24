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
  let championsPromise: Promise<void> | null = null
  let augmentsPromise: Promise<void> | null = null
  let itemsPromise: Promise<void> | null = null

  const CACHE_KEY = 'lol-cache-v2'
  const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

  function readCache() {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.localStorage.getItem(CACHE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as { ts: number; champions?: Champion[]; items?: Item[]; augmentList?: Augment[] }
      if (!parsed?.ts || Date.now() - parsed.ts > CACHE_TTL_MS) return null
      return parsed
    } catch {
      return null
    }
  }

  function writeCache(payload: { champions?: Champion[]; items?: Item[]; augmentList?: Augment[] }) {
    if (typeof window === 'undefined') return
    try {
      const existing = readCache() || { ts: Date.now() }
      const next = {
        ts: Date.now(),
        champions: payload.champions ?? existing.champions ?? [],
        items: payload.items ?? existing.items ?? [],
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
    if (cached.items?.length) items.value = cached.items
    if (cached.augmentList?.length) augmentList.value = cached.augmentList
    if (cached.champions?.length && cached.items?.length && cached.augmentList?.length) isInitialized.value = true
  }

  const normalizeAugments = (payload: any): Augment[] => {
    if (Array.isArray(payload)) return payload.filter(Boolean)
    if (Array.isArray(payload?.augments)) return payload.augments.filter(Boolean)
    return []
  }

  async function ensureChampions() {
    if (champions.value.length) return
    if (championsPromise) return championsPromise
    championsPromise = (async () => {
      const res = await commonService.apiGetChampions()
      champions.value = res?.data?.data?.champions || []
      writeCache({ champions: champions.value })
    })().finally(() => {
      championsPromise = null
    })
    return championsPromise
  }

  async function ensureAugments() {
    if (augmentList.value.length) return
    if (augmentsPromise) return augmentsPromise
    augmentsPromise = (async () => {
      const res = await commonService.apiGetAugments({ mode: 'hex_brawl', isActive: true, limit: 500 })
      augmentList.value = normalizeAugments(res?.data?.data)
      writeCache({ augmentList: augmentList.value })
    })().finally(() => {
      augmentsPromise = null
    })
    return augmentsPromise
  }

  async function ensureItems() {
    if (items.value.length) return
    if (itemsPromise) return itemsPromise
    itemsPromise = (async () => {
      const res = await commonService.apiGetItems({ mode: 'hex_brawl' })
      items.value = res?.data?.data?.items || []
      writeCache({ items: items.value })
    })().finally(() => {
      itemsPromise = null
    })
    return itemsPromise
  }

  async function initializeData(options?: { includeItems?: boolean }) {
    const includeItems = options?.includeItems === true

    const alreadyReady = champions.value.length && augmentList.value.length && (!includeItems || items.value.length)
    if (isInitialized.value && alreadyReady) {
      console.log('LoL data already initialized, skipping...')
      return
    }
    if (initPromise) return initPromise

    isLoading.value = true
    console.log('Starting LoL data initialization...')

    initPromise = (async () => {
      try {
        const jobs = [ensureChampions(), ensureAugments()]
        if (includeItems) jobs.push(ensureItems())
        await Promise.all(jobs)
        if (champions.value.length && augmentList.value.length && (!includeItems || items.value.length)) {
          isInitialized.value = true
        }

        console.log('LoL data loaded:', {
          champions: champions.value.length,
          items: items.value.length,
          augmentList: augmentList.value.length,
        })
      } catch (error) {
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
