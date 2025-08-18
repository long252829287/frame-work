export interface ImageAsset {
  url: string
  width?: number
  height?: number
  alt?: string
}

export interface VideoAsset {
  url: string
  durationSec?: number
  cover?: ImageAsset
}
