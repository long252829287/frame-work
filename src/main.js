import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { 
  ElButton,
  ElInput,
  ElMessage,
  ElAvatar,
  ElCollapse,
  ElSlider
} from 'element-plus'
import './assets/iconfont/iconfont.css'
import 'element-plus/dist/index.css'
import lylLoading from './assets/js/lyl-loading'
// import * as ElementPlusIconsVue from '@element-plus/icons-vue'
const app = createApp(App)
const loading = new lylLoading()
// for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
//   app.component(key, component)
// }
app.component(ElButton.name, ElButton)
app.component(ElInput.name, ElInput)
app.component(ElMessage.name, ElMessage)
app.component(ElAvatar.name, ElAvatar)
app.component(ElCollapse.name, ElCollapse)
app.component(ElSlider.name, ElSlider)

app.provide('loading', loading)
app.use(createPinia())
app.use(router)
// app.use(ElementPlus)

app.mount('#app')