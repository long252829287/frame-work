export interface PaginatedList<T> {
  data: {
    notes: T[]
    count: number
  }
}

// Auth
export interface ApiLoginData {
  token: string
  user: { uid: string; username: string; nickname?: string }
}

// Notes
export interface NoteItem {
  _id: string
  title?: string
  content: string
  tags?: string[]
  x_axis?: number
  y_axis?: number
  createdAt?: string
  updatedAt?: string
}

// Credentials
export interface CredentialItem {
  id: string
  account: string
  website: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface RevealPasswordResult {
  password: string
}

// LOL Strategy System Types

// Common API Response Types
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  error?: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Champion Types
export interface ChampionImages {
  square: string
  splash: string
  loading: string
  passive?: string
}

export interface ChampionStats {
  difficulty: number
}

export interface Champion {
  _id: string
  riotId: string
  key: string
  name: string
  title: string
  description: string
  images: ChampionImages
  tags: string[]
  stats: ChampionStats
  version: string
  createdAt?: string
  updatedAt?: string
}

export interface ChampionListResponse {
  champions: Champion[]
  pagination: PaginationInfo
}

export interface ChampionTagsResponse {
  tags: string[]
  stats: Record<string, number>
  total: number
}

export interface ChampionSearchResponse {
  keyword: string
  champions: Champion[]
  total: number
}

export interface ChampionStatsResponse {
  total: {
    all: number
    enabled: number
    disabled: number
  }
  byTags: Record<string, number>
  byDifficulty: Record<string, number>
  byVersion: Record<string, number>
  lastUpdated: string
}

// Item Types
export interface ItemGold {
  total: number
  base: number
  sell: number
  purchasable: boolean
}

export interface ItemMaps {
  sr: boolean
  ha: boolean
  aram: boolean
}

export interface Item {
  _id: string
  riotId: string
  name: string
  description: string
  plaintext: string
  image: string
  gold: ItemGold
  tags: string[]
  maps: ItemMaps
  from?: string[]
  into?: string[]
  depth: number
  isBoots?: boolean
  isMythic?: boolean
  isLegendary?: boolean
  version: string
  createdAt?: string
  updatedAt?: string
}

export interface ItemWithRelated extends Item {
  fromItems?: Item[]
  intoItems?: Item[]
}

export interface ItemListResponse {
  items: Item[]
  pagination: PaginationInfo
  filters: {
    search: string | null
    tags: string[] | null
    map: string | null
    priceRange: { min: number | null; max: number | null }
    purchasable: boolean | null
  }
}

// Strategy Types
export interface StrategyItem {
  item: Item
  itemName: string
  itemImage: string
  position: number
}

export interface StrategyCreator {
  _id: string
  username: string
  profile: {
    displayName: string
    avatar?: string
  }
}

export interface StrategyStats {
  viewCount: number
  favoriteCount: number
  likeCount: number
}

export interface Strategy {
  _id: string
  title: string
  champion: Champion
  championKey: string
  championName: string
  items: StrategyItem[]
  mapType: 'sr' | 'aram' | 'both'
  description: string
  tags: string[]
  creator: StrategyCreator
  creatorName: string
  stats: StrategyStats
  status: 'draft' | 'published' | 'archived'
  isPublic: boolean
  isRecommended: boolean
  createdAt: string
  updatedAt: string
}

export interface StrategyListResponse {
  strategies: Strategy[]
  pagination: PaginationInfo
}

export interface CreateStrategyPayload {
  title: string
  championId: string
  items: {
    itemId: string
    position: number
  }[]
  mapType: 'sr' | 'aram' | 'both'
  description: string
  tags: string[]
}

export interface UpdateStrategyPayload {
  title?: string
  championId?: string
  items?: {
    itemId: string
    position: number
  }[]
  mapType?: 'sr' | 'aram' | 'both'
  description?: string
  tags?: string[]
  isPublic?: boolean
}

// Query Parameter Types
export interface ChampionQueryParams {
  search?: string
  tags?: string[]
  page?: number
  limit?: number
  sort?: 'name' | 'createdAt' | 'key'
  order?: 'asc' | 'desc'
}

export interface ItemQueryParams {
  search?: string
  tags?: string[]
  map?: 'sr' | 'ha' | 'aram'
  minPrice?: number
  maxPrice?: number
  depth?: number
  purchasable?: boolean
  mythic?: boolean
  legendary?: boolean
  boots?: boolean
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface StrategyQueryParams {
  championKey?: string
  mapType?: 'sr' | 'aram' | 'both'
  creatorId?: string
  search?: string
  isRecommended?: boolean
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  status?: 'draft' | 'published' | 'archived'
}
