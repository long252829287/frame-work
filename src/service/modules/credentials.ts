import fetch from '../fetch'
import type { CredentialItem, PaginatedList, RevealPasswordResult } from '@/types'

export default {
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
}