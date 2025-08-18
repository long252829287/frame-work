// Generic API response helpers
export interface PaginatedList<T> {
  items?: T[]
  list?: T[]
  total?: number
}

// Auth
export interface ApiLoginData {
  token: string
  user: { uid: string; username: string; nickname?: string }
}

// Notes
export interface NoteItem {
  id: string
  title?: string
  content: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}
