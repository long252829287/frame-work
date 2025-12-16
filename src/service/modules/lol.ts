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
  Strategy,
  StrategyListResponse,
  StrategyByChampionResponse,
  StrategyLikeResponse,
  CreateStrategyPayload,
  UpdateStrategyPayload,
  StrategyQueryParams,
  Augment,
  AugmentListResponse,
  AugmentQueryParams
} from '@/types'

export default {
  // 获取全部英雄列表
  async apiGetChampions(params?: ChampionQueryParams) {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.tags) queryParams.append('tags', params.tags.join(','))
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.order) queryParams.append('order', params.order)

    const query = queryParams.toString()
    return fetch.get<ApiResponse<ChampionListResponse>>(`/api/champions${query ? `?${query}` : ''}`)
  },
  // 获取指定英雄详情
  async apiGetChampion(identifier: string) {
    return fetch.get<ApiResponse<Champion>>(`/api/champions/${identifier}`)
  },
  // 获取英雄标签列表
  async apiGetChampionTags() {
    return fetch.get<ApiResponse<ChampionTagsResponse>>('/api/champions/tags/list')
  },
  // 搜索英雄
  async apiSearchChampions(keyword: string) {
    return fetch.get<ApiResponse<ChampionSearchResponse>>(`/api/champions/search/${keyword}`)
  },
  // 根据标签获取英雄列表
  async apiGetChampionsByTags(tags: string) {
    return fetch.get<ApiResponse<ChampionListResponse>>(`/api/champions/by-tags/${tags}`)
  },
  // 获取英雄统计信息
  async apiGetChampionStats() {
    return fetch.get<ApiResponse<ChampionStatsResponse>>('/api/champions/stats/summary')
  },

  // 获取装备列表
  async apiGetItems(params?: ItemQueryParams) {
    const queryParams = new URLSearchParams()
    if (params?.mode) queryParams.append('mode', params.mode)
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
  // 获取指定装备详情
  async apiGetItem(identifier: string) {
    return fetch.get<ApiResponse<ItemWithRelated>>(`/api/items/${identifier}`)
  },
  // 获取装备标签列表
  async apiGetItemTags() {
    return fetch.get<ApiResponse<ItemTagsResponse>>('/api/items/tags/list')
  },
  // 根据地图类型获取装备列表
  async apiGetItemsByMap(mapType: 'sr' | 'ha' | 'aram') {
    return fetch.get<ApiResponse<ItemListResponse>>(`/api/items/map/${mapType}`)
  },
  // 搜索装备
  async apiSearchItems(keyword: string) {
    return fetch.get<ApiResponse<ItemSearchResponse>>(`/api/items/search/${keyword}`)
  },
  // 根据标签获取装备列表
  async apiGetItemsByTags(tags: string) {
    return fetch.get<ApiResponse<ItemListResponse>>(`/api/items/by-tags/${tags}`)
  },
  // 根据价格区间获取装备列表
  async apiGetItemsByPriceRange(minPrice: number, maxPrice: number) {
    return fetch.get<ApiResponse<ItemListResponse>>(`/api/items/price-range/${minPrice}/${maxPrice}`)
  },
  // 获取可购买装备列表
  async apiGetPurchasableItems() {
    return fetch.get<ApiResponse<ItemListResponse>>('/api/items/purchasable')
  },
  // 获取装备统计信息
  async apiGetItemStats() {
    return fetch.get<ApiResponse<ItemStatsResponse>>('/api/items/stats/summary')
  },
  // 获取攻略列表
  async apiGetStrategies(params?: StrategyQueryParams) {
    const queryParams = new URLSearchParams()
    if (params?.championKey) queryParams.append('championKey', params.championKey)
    if (params?.mapType) queryParams.append('mapType', params.mapType)
    if (params?.mode) queryParams.append('mode', params.mode)
    if (params?.creatorId) queryParams.append('creatorId', params.creatorId)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.isRecommended !== undefined) queryParams.append('isRecommended', params.isRecommended.toString())
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.order) queryParams.append('order', params.order)
    if (params?.status) queryParams.append('status', params.status)

    const query = queryParams.toString()
    return fetch.get<ApiResponse<StrategyListResponse>>(`/api/strategies${query ? `?${query}` : ''}`)
  },
  // 创建新攻略
  async apiCreateStrategy(payload: CreateStrategyPayload) {
    return fetch.post<ApiResponse<Strategy>>('/api/strategies', payload)
  },
  // 获取指定攻略详情
  async apiGetStrategy(id: string) {
    return fetch.get<ApiResponse<Strategy>>(`/api/strategies/${id}`)
  },
  // 更新指定攻略
  async apiUpdateStrategy(id: string, payload: UpdateStrategyPayload) {
    return fetch.put<ApiResponse<Strategy>>(`/api/strategies/${id}`, payload)
  },
  // 删除指定攻略
  async apiDeleteStrategy(id: string) {
    return fetch.delete<ApiResponse<{ success: boolean }>>(`/api/strategies/${id}`)
  },
  // 根据英雄获取对应的攻略列表
  async apiGetStrategiesByChampion(championKey: string, params?: { mapType?: 'sr' | 'aram' | 'both' }) {
    const queryParams = new URLSearchParams()
    if (params?.mapType) queryParams.append('mapType', params.mapType)

    const query = queryParams.toString()
    return fetch.get<ApiResponse<StrategyByChampionResponse>>(`/api/strategies/champion/${championKey}${query ? `?${query}` : ''}`)
  },
  // 获取热门攻略
  async apiGetPopularStrategies(limit?: number) {
    const query = limit ? `?limit=${limit}` : ''
    return fetch.get<ApiResponse<StrategyListResponse>>(`/api/strategies/popular${query}`)
  },
  // 获取推荐攻略
  async apiGetRecommendedStrategies(limit?: number) {
    const query = limit ? `?limit=${limit}` : ''
    return fetch.get<ApiResponse<StrategyListResponse>>(`/api/strategies/recommended${query}`)
  },
  // 获取用户的攻略列表
  async apiGetUserStrategies(userId: string) {
    return fetch.get<ApiResponse<StrategyListResponse>>(`/api/strategies/user/${userId}`)
  },
  // 获取当前登录用户的攻略列表
  async apiGetMyStrategies(params?: { status?: 'draft' | 'published' | 'archived' }) {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)

    const query = queryParams.toString()
    return fetch.get<ApiResponse<StrategyListResponse>>(`/api/strategies/my${query ? `?${query}` : ''}`)
  },
  // 点赞指定攻略
  async apiLikeStrategy(id: string, action: 'like' | 'unlike' = 'like') {
    return fetch.post<ApiResponse<StrategyLikeResponse>>(`/api/strategies/${id}/like`, { action })
  },
  async apiGetAugments(params?: AugmentQueryParams) {
    const queryParams = new URLSearchParams()
    if (params?.mode) queryParams.append('mode', params.mode)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.tags?.length) queryParams.append('tags', params.tags.join(','))
    if (params?.tier !== undefined) queryParams.append('tier', String(params.tier))
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive))
    if (params?.limit !== undefined) queryParams.append('limit', String(params.limit))
    if (params?.offset !== undefined) queryParams.append('offset', String(params.offset))

    const query = queryParams.toString()
    return fetch.get<ApiResponse<AugmentListResponse | Augment[]>>(`/api/augments${query ? `?${query}` : ''}`)
  },
  async apiGetAugmentList() {
    return fetch.get<ApiResponse<AugmentListResponse | Augment[]>>('/api/augments')
  }
}
