import fetch from '../fetch'
import type { User } from '@/types/notes'

export default {
  async apiGetAllUsers() {
    return fetch.get<{ data: User[] }>('/api/users')
  },
}