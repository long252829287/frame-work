export type RoutePath = '/login' | '/register' | '/notes' | '/credentials' | '/study'

export interface InternalLink {
  path: RoutePath
  query?: Record<string, string | number | boolean>
}
