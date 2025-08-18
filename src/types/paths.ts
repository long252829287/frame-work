export type RoutePath = '/login' | '/register' | '/notes'

export interface InternalLink {
  path: RoutePath
  query?: Record<string, string | number | boolean>
}
