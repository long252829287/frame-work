import { defineStore } from 'pinia'
import { ref } from 'vue'
import { commonService } from '@/service'
import type { Champion, Item, RuneTree } from '@/types'

export const useLolStore = defineStore('lol', () => {
  const champions = ref<Champion[]>([])
  const items = ref<Item[]>([])
  const runeTrees = ref<RuneTree[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)

  async function initializeData() {
    if (isInitialized.value) {
      console.log('LoL data already initialized, skipping...')
      return
    }

    isLoading.value = true
    console.log('Starting LoL data initialization...')

    try {
      const [championsRes, itemsRes, runesRes] = await Promise.all([
        commonService.apiGetChampions(),
        commonService.apiGetItems(),
        commonService.apiGetRunes()
      ])

      champions.value = championsRes?.data?.data?.champions || []
      items.value = itemsRes?.data?.data?.items || []
      runeTrees.value = runesRes?.data?.data?.runeTrees || []

      console.log('LoL data loaded:', {
        champions: champions.value.length,
        items: items.value.length,
        runeTrees: runeTrees.value.length
      })

      if (runeTrees.value.length > 0) {
        console.log('First rune tree:', runeTrees.value[0])
      }

      isInitialized.value = true
    } catch (error) {
      console.error('Failed to initialize LOL data:', error)
      throw error // 重新抛出错误以便上层处理
    } finally {
      isLoading.value = false
    }
  }

  function getChampionByKey(key: string) {
    return champions.value.find(c => c.key === key)
  }

  function getItemById(id: string) {
    return items.value.find(i => i._id === id || i.riotId === id)
  }

  function getRuneTreeById(id: string) {
    return runeTrees.value.find(r => r.id === id)
  }

  return {
    champions,
    items,
    runeTrees,
    isLoading,
    isInitialized,
    initializeData,
    getChampionByKey,
    getItemById,
    getRuneTreeById,
  }
})
