import fetch from '../fetch'
import type {
  ApiLoginData,
  NoteItem,
  PaginatedList,
  CredentialItem,
  RevealPasswordResult,
  StudySubject,
  MarkdownFile,
} from '@/types'

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

  // Study APIs
  async apiCreateStudySubject(payload: { name: string; description?: string }) {
    return fetch.post<StudySubject>('/api/study/subjects', payload)
  },

  async apiListStudySubjects() {
    return fetch.get<PaginatedList<StudySubject> | StudySubject[]>('/api/study/subjects')
  },

  async apiGetStudySubject(id: string) {
    return fetch.get<StudySubject>(`/api/study/subjects/${id}`)
  },

  async apiUpdateStudySubject(
    id: string,
    payload: { name?: string; description?: string; files?: string[] },
  ) {
    return fetch.put<StudySubject>(`/api/study/subjects/${id}`, payload)
  },

  async apiDeleteStudySubject(id: string) {
    return fetch.delete<{ success?: boolean }>(`/api/study/subjects/${id}`)
  },

  async apiGetMarkdownFile(subjectId: string, fileName: string) {
    return fetch.get<MarkdownFile>(`/api/study/subjects/${subjectId}/files/${fileName}`)
  },

  async apiCreateMarkdownFile(subjectId: string, payload: { name: string; content: string }) {
    return fetch.post<MarkdownFile>(`/api/study/subjects/${subjectId}/files`, payload)
  },

  async apiUpdateMarkdownFile(subjectId: string, fileName: string, payload: { content: string }) {
    return fetch.put<MarkdownFile>(`/api/study/subjects/${subjectId}/files/${fileName}`, payload)
  },

  async apiDeleteMarkdownFile(subjectId: string, fileName: string) {
    return fetch.delete<{ success?: boolean }>(`/api/study/subjects/${subjectId}/files/${fileName}`)
  },
}
