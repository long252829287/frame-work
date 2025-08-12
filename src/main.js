import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/iconfont/iconfont.css'
import 'element-plus/dist/index.css'
import lylLoading from './assets/js/lyl-loading'
import '@/assets/css/main.scss'
const app = createApp(App)
const loading = new lylLoading()

app.provide('loading', loading)
app.use(createPinia())
app.use(router)

app.mount('#app')