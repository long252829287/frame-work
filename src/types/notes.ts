export interface QuadrantNote {
  _id: string
  title: string
  content: string
  tags?: string[]
  x_axis: number
  y_axis: number
  order: number
  createdBy?: string
  color?: string
}

export interface SharedNote {
  _id: string
  title: string
  createdBy: string
  participants: string[]
  createdAt?: string
  updatedAt?: string
}

export interface SharedQuadrantNote extends QuadrantNote {
  createdBy: string
  sharedNoteId: string
}

export interface User {
  _id: string
  username: string
  nickname?: string
}
