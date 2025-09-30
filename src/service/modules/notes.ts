import fetch from '../fetch'
import type { NoteItem, PaginatedList } from '@/types'

export default {
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
}