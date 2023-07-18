import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/css/main.css'
import './assets/iconfont/iconfont.css'
import 'element-plus/dist/index.css'
import lylLoading from './assets/js/lyl-loading'
const app = createApp(App)
const loading = new lylLoading()
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.provide('loading', loading)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')