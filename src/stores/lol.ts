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

  async function initializeData() {
    if (isInitialized.value) {
      console.log('LoL data already initialized, skipping...')
      return
    }

    isLoading.value = true
    console.log('Starting LoL data initialization...')

    try {
      const [championsRes, itemsRes, hexListRes] = await Promise.all([
        commonService.apiGetChampions(),
        commonService.apiGetItems(),
        commonService.apiGetHexList(),
      ])
      champions.value = championsRes?.data?.data?.champions || []
      items.value = itemsRes?.data?.data?.items || []
      hexList.value = hexListRes?.data?.data || []

      console.log('LoL data loaded:', {
        champions: champions.value.length,
        items: items.value.length,
        hexList: hexList.value.length,
      })

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
