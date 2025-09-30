import fetch from '../fetch'
import type {
  ApiResponse,
  Champion,
  ChampionListResponse,
  ChampionTagsResponse,
  ChampionSearchResponse,
  ChampionStatsResponse,
  ChampionQueryParams,
  Item,
  ItemWithRelated,
  ItemListResponse,
  ItemTagsResponse,
  ItemSearchResponse,
  ItemStatsResponse,
  ItemQueryParams,
  RuneTree,
  RuneTreeListResponse,
  RuneTreeNamesResponse,
  RuneValidationPayload,
  RuneValidationResponse,
  RuneStatsResponse,
  Strategy,
  StrategyListResponse,
  StrategyByChampionResponse,
  StrategyLikeResponse,
  CreateStrategyPayload,
  UpdateStrategyPayload,
  StrategyQueryParams,
} from '@/types'

export default {
  // Champions APIs
  async apiGetChampions(params?: ChampionQueryParams) {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.tags) queryParams.append('tags', params.tags.join(','))
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.order) queryParams.append('order', params.order)

    const query = queryParams.toString()
    return fetch.get<ApiResponse<ChampionListResponse>>(`/api/champions${query ? `?${query}` : ''}`)
  },

  async apiGetChampion(identifier: string) {
    return fetch.get<ApiResponse<Champion>>(`/api/champions/${identifier}`)
  },

  async apiGetChampionTags() {
    return fetch.get<ApiResponse<ChampionTagsResponse>>('/api/champions/tags/list')
  },

  async apiSearchChampions(keyword: string) {
    return fetch.get<ApiResponse<ChampionSearchResponse>>(`/api/champions/search/${keyword}`)
  },

  async apiGetChampionsByTags(tags: string) {
    return fetch.get<ApiResponse<ChampionListResponse>>(`/api/champions/by-tags/${tags}`)
  },

  async apiGetChampionStats() {
    return fetch.get<ApiResponse<ChampionStatsResponse>>('/api/champions/stats/summary')
  },

  // Items APIs
  async apiGetItems(params?: ItemQueryParams) {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.tags) queryParams.append('tags', params.tags.join(','))
    if (params?.map) queryParams.append('map', params.map)
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString())
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString())
    if (params?.depth) queryParams.append('depth', params.depth.toString())
    if (params?.purchasable !== undefined) queryParams.append('purchasable', params.purchasable.toString())
    if (params?.mythic !== undefined) queryParams.append('mythic', params.mythic.toString())
    if (params?.legendary !== undefined) queryParams.append('legendary', params.legendary.toString())
    if (params?.boots !== undefined) queryParams.append('boots', params.boots.toString())
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.order) queryParams.append('order', params.order)

    const query = queryParams.toString()
    return fetch.get<ApiResponse<ItemListResponse>>(`/api/items${query ? `?${query}` : ''}`)
  },

  async apiGetItem(identifier: string) {
    return fetch.get<ApiResponse<ItemWithRelated>>(`/api/items/${identifier}`)
  },

  async apiGetItemTags() {
    return fetch.get<ApiResponse<ItemTagsResponse>>('/api/items/tags/list')
  },

  async apiGetItemsByMap(mapType: 'sr' | 'ha' | 'aram') {
    return fetch.get<ApiResponse<ItemListResponse>>(`/api/items/map/${mapType}`)
  },

  async apiSearchItems(keyword: string) {
    return fetch.get<ApiResponse<ItemSearchResponse>>(`/api/items/search/${keyword}`)
  },

  async apiGetItemsByTags(tags: string) {
    return fetch.get<ApiResponse<ItemListResponse>>(`/api/items/by-tags/${tags}`)
  },

  async apiGetItemsByPriceRange(minPrice: number, maxPrice: number) {
    return fetch.get<ApiResponse<ItemListResponse>>(`/api/items/price-range/${minPrice}/${maxPrice}`)
  },

  async apiGetPurchasableItems() {
    return fetch.get<ApiResponse<ItemListResponse>>('/api/items/purchasable')
  },

  async apiGetItemStats() {
    return fetch.get<ApiResponse<ItemStatsResponse>>('/api/items/stats/summary')
  },

  // Runes APIs
  async apiGetRunes() {
    return fetch.get<ApiResponse<RuneTreeListResponse>>('/api/runes')
  },

  async apiGetRuneTree(treeId: string) {
    return fetch.get<ApiResponse<RuneTree>>(`/api/runes/${treeId}`)
  },

  async apiGetRune(runeId: string) {
    return fetch.get<ApiResponse<{ id: string; name: string; icon: string; description: string }>>(`/api/runes/rune/${runeId}`)
  },

  async apiValidateRunes(payload: RuneValidationPayload) {
    return fetch.post<ApiResponse<RuneValidationResponse>>('/api/runes/validate', payload)
  },

  async apiGetRuneTreeNames() {
    return fetch.get<ApiResponse<RuneTreeNamesResponse>>('/api/runes/trees/names')
  },

  async apiGetRuneStats() {
    return fetch.get<ApiResponse<RuneStatsResponse>>('/api/runes/stats/summary')
  },

  // Strategies APIs
  async apiGetStrategies(params?: StrategyQueryParams) {
    const queryParams = new URLSearchParams()
    if (params?.championKey) queryParams.append('championKey', params.championKey)
    if (params?.mapType) queryParams.append('mapType', params.mapType)
    if (params?.creatorId) queryParams.append('creatorId', params.creatorId)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.isRecommended !== undefined) queryParams.append('isRecommended', params.isRecommended.toString())
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.order) queryParams.append('order', params.order)
    if (params?.status) queryParams.append('status', params.status)

    const query = queryParams.toString()
    return fetch.get<ApiResponse<StrategyListResponse>>(`/api/strategies${query ? `?${query}` : ''}`)
  },

  async apiCreateStrategy(payload: CreateStrategyPayload) {
    return fetch.post<ApiResponse<Strategy>>('/api/strategies', payload)
  },

  async apiGetStrategy(id: string) {
    return fetch.get<ApiResponse<Strategy>>(`/api/strategies/${id}`)
  },

  async apiUpdateStrategy(id: string, payload: UpdateStrategyPayload) {
    return fetch.put<ApiResponse<Strategy>>(`/api/strategies/${id}`, payload)
  },

  async apiDeleteStrategy(id: string) {
    return fetch.delete<ApiResponse<{ success: boolean }>>(`/api/strategies/${id}`)
  },

  async apiGetStrategiesByChampion(championKey: string, params?: { mapType?: 'sr' | 'aram' | 'both' }) {
    const queryParams = new URLSearchParams()
    if (params?.mapType) queryParams.append('mapType', params.mapType)

    const query = queryParams.toString()
    return fetch.get<ApiResponse<StrategyByChampionResponse>>(`/api/strategies/champion/${championKey}${query ? `?${query}` : ''}`)
  },

  async apiGetPopularStrategies(limit?: number) {
    const query = limit ? `?limit=${limit}` : ''
    return fetch.get<ApiResponse<StrategyListResponse>>(`/api/strategies/popular${query}`)
  },

  async apiGetRecommendedStrategies(limit?: number) {
    const query = limit ? `?limit=${limit}` : ''
    return fetch.get<ApiResponse<StrategyListResponse>>(`/api/strategies/recommended${query}`)
  },

  async apiGetUserStrategies(userId: string) {
    return fetch.get<ApiResponse<StrategyListResponse>>(`/api/strategies/user/${userId}`)
  },

  async apiGetMyStrategies(params?: { status?: 'draft' | 'published' | 'archived' }) {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)

    const query = queryParams.toString()
    return fetch.get<ApiResponse<StrategyListResponse>>(`/api/strategies/my${query ? `?${query}` : ''}`)
  },

  async apiLikeStrategy(id: string) {
    return fetch.post<ApiResponse<StrategyLikeResponse>>(`/api/strategies/${id}/like`)
  },
}