import fetch from '../fetch'
import type { ApiLoginData, NoteItem, PaginatedList } from '@/types'

// Auth APIs

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

  async apiUpdateNote(id: string, payload: { content?: string; title?: string; tags?: string[] }) {
    return fetch.put<NoteItem>(`/api/notes/notes/${id}`, payload)
  },

  async apiDeleteNote(id: string) {
    return fetch.delete<{ success?: boolean }>(`/api/notes/notes/${id}`)
  },
}
