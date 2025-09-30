import fetch from '../fetch'
import type { SharedNote, SharedQuadrantNote } from '@/types/notes'

export default {
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
}