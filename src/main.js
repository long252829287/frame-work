import './assets/css/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
const app = createApp(App)
const pinia = createPinia()
// 将 Pinia 实例挂载到 Vue 实例中
app.use(pinia)
app.use(router)

app.mount('#app')
