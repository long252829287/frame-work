import fetch from '../fetch'
import type {
  ApiLoginData,
  NoteItem,
  PaginatedList,
  CredentialItem,
  RevealPasswordResult,
  // LOL Strategy System Types
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
  ItemQueryParams,
  Strategy,
  StrategyListResponse,
  CreateStrategyPayload,
  UpdateStrategyPayload,
  StrategyQueryParams,
} from '@/types'
import type { SharedNote, SharedQuadrantNote, User } from '@/types/notes'

export default {
  async apiRegister(payload: { username: string; password: string; nickname?: string }) {
    return fetch.post<{ message?: string } | Record<string, unknown>>('/api/auth/register', payload)
  },

  async apiLogin(payload: { username: string; password: string }) {
    return fetch.post<ApiLoginData>('/api/auth/login', payload)
  },

  async apiLogout() {
    return fetch.post<{ message?: string } | Record<string, unknown>>('/api/auth/logout')
  },

  // Notes APIs
  async apiGetNotes() {
    return fetch.get<PaginatedList<NoteItem> | NoteItem[]>('/api/notes/notes')
  },

  async apiGetNote(id: string) {
    return fetch.get<NoteItem>(`/api/notes/notes/${id}`)
  },

  async apiCreateNote(payload: { content: string; title?: string; tags?: string[] }) {
    return fetch.post<NoteItem>('/api/notes/notes', payload)
  },

  async apiUpdateNote(
    id: string,
    payload: {
      content?: string
      title?: string
      tags?: string[]
      x_axis?: number
      y_axis?: number
      order?: number
    },
  ) {
    return fetch.put<NoteItem>(`/api/notes/notes/${id}`, payload)
  },

  async apiDeleteNote(id: string) {
    return fetch.delete<{ success?: boolean }>(`/api/notes/notes/${id}`)
  },

  // Credentials APIs
  async apiCreateCredential(payload: {
    account: string
    password: string
    website: string
    notes?: string
  }) {
    return fetch.post<CredentialItem>('/api/credentials', payload)
  },

  async apiListCredentials() {
    return fetch.get<PaginatedList<CredentialItem> | CredentialItem[]>('/api/credentials')
  },

  async apiGetCredential(id: string) {
    return fetch.get<CredentialItem>(`/api/credentials/${id}`)
  },

  async apiRevealCredentialPassword(id: string) {
    return fetch.post<RevealPasswordResult>(`/api/credentials/${id}/reveal`)
  },

  async apiUpdateCredential(
    id: string,
    payload: { account?: string; password?: string; website?: string; notes?: string },
  ) {
    return fetch.put<CredentialItem>(`/api/credentials/${id}`, payload)
  },

  async apiDeleteCredential(id: string) {
    return fetch.delete<{ success?: boolean }>(`/api/credentials/${id}`)
  },

  // Shared Notes APIs
  async apiGetSharedNotes() {
    return fetch.get<{ data: { notes: SharedNote[] } }>('/api/shared-notes')
  },

  async apiGetSharedNote(id: string) {
    return fetch.get<{ data: SharedNote }>(`/api/shared-notes/${id}`)
  },

  async apiCreateSharedNote(payload: { title: string; participants: string[] }) {
    return fetch.post<SharedNote>('/api/shared-notes', payload)
  },

  async apiUpdateSharedNote(id: string, payload: { title?: string; participants?: string[] }) {
    return fetch.put<SharedNote>(`/api/shared-notes/${id}`, payload)
  },

  async apiDeleteSharedNote(id: string) {
    return fetch.delete<{ success?: boolean }>(`/api/shared-notes/${id}`)
  },

  async apiGetSharedNoteContent(id: string) {
    return fetch.get<{ data: { notes: SharedQuadrantNote[] } }>(`/api/shared-notes/${id}/notes`)
  },

  async apiCreateSharedNoteItem(
    sharedNoteId: string,
    payload: {
      title?: string
      content: string
      tags?: string[]
      x_axis: number
      y_axis: number
      order: number
    },
  ) {
    return fetch.post<SharedQuadrantNote>(`/api/shared-notes/${sharedNoteId}/notes`, payload)
  },

  async apiUpdateSharedNoteItem(
    noteId: string,
    payload: {
      title?: string
      content?: string
      tags?: string[]
      x_axis?: number
      y_axis?: number
      order?: number
    },
  ) {
    return fetch.put<SharedQuadrantNote>(`/api/shared-notes/notes/${noteId}`, payload)
  },

  async apiDeleteSharedNoteItem(noteId: string) {
    return fetch.delete<{ success?: boolean }>(`/api/shared-notes/notes/${noteId}`)
  },

  async apiGetAllUsers() {
    return fetch.get<{ data: User[] }>('/api/users')
  },

  // LOL Strategy System APIs

  // Champions APIs
  async apiGetChampions(params?: ChampionQueryParams) {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.tags) queryParams.append('tags', params.tags.join(','))
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
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
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.order) queryParams.append('order', params.order)

    const query = queryParams.toString()
    return fetch.get<ApiResponse<ItemListResponse>>(`/api/items${query ? `?${query}` : ''}`)
  },

  async apiGetItem(identifier: string) {
    return fetch.get<ApiResponse<ItemWithRelated>>(`/api/items/${identifier}`)
  },

  async apiGetItemTags() {
    return fetch.get<ApiResponse<{ tags: string[]; stats: Record<string, number>; total: number }>>('/api/items/tags/list')
  },

  async apiGetItemsByMap(mapType: 'sr' | 'ha' | 'aram') {
    return fetch.get<ApiResponse<ItemListResponse>>(`/api/items/map/${mapType}`)
  },

  async apiSearchItems(keyword: string) {
    return fetch.get<ApiResponse<{ keyword: string; items: Item[]; total: number }>>(`/api/items/search/${keyword}`)
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
    return fetch.get<ApiResponse<{ total: number; byTags: Record<string, number>; byMaps: Record<string, number>; lastUpdated: string }>>('/api/items/stats/summary')
  },

  // Strategies APIs
  async apiGetStrategies(params?: StrategyQueryParams) {
    const queryParams = new URLSearchParams()
    if (params?.championKey) queryParams.append('championKey', params.championKey)
    if (params?.mapType) queryParams.append('mapType', params.mapType)
    if (params?.creatorId) queryParams.append('creatorId', params.creatorId)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.isRecommended !== undefined) queryParams.append('isRecommended', params.isRecommended.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
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

  async apiGetStrategiesByChampion(championKey: string, params?: { mapType?: 'sr' | 'aram' | 'both'; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams()
    if (params?.mapType) queryParams.append('mapType', params.mapType)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const query = queryParams.toString()
    return fetch.get<ApiResponse<StrategyListResponse>>(`/api/strategies/champion/${championKey}${query ? `?${query}` : ''}`)
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

  async apiGetMyStrategies(params?: { status?: 'draft' | 'published' | 'archived'; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const query = queryParams.toString()
    return fetch.get<ApiResponse<StrategyListResponse>>(`/api/strategies/my${query ? `?${query}` : ''}`)
  },

  async apiLikeStrategy(id: string) {
    return fetch.post<ApiResponse<{ liked: boolean; likeCount: number }>>(`/api/strategies/${id}/like`)
  },
}
