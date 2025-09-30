import authService from './modules/auth'
import notesService from './modules/notes'
import credentialsService from './modules/credentials'
import sharedNotesService from './modules/shared-notes'
import usersService from './modules/users'
import lolService from './modules/lol'

// 兼容性导出 - 保持原有使用方式
const commonService = {
  ...authService,
  ...notesService,
  ...credentialsService,
  ...sharedNotesService,
  ...usersService,
  ...lolService,
}

export {
  commonService,
  authService,
  notesService,
  credentialsService,
  sharedNotesService,
  usersService,
  lolService,
}
