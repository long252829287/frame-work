import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'

// 导入全局主题样式
import './assets/scss/global.scss'
import './assets/css/tailwind.css'
import 'element-plus/dist/index.css'

// 导入主题系统
import { themeManager } from './utils/theme-switcher'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 初始化主题系统
themeManager.getCurrentTheme() // 这会应用保存的主题或默认主题

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
