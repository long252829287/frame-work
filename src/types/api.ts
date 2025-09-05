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
  id: string
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

export interface StudySubject {
  id: string
  name: string
  description?: string
  files: string[] // Array of markdown file names
  createdAt?: string
  updatedAt?: string
}

export interface MarkdownFile {
  name: string
  content: string
}
