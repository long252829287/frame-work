<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter, useRoute } from 'vue-router'
import SearchInput from '@/components/search-input.vue'
import softDrag from '@/components/soft-drag.vue'
import enter from '../static/homePage/enter_toPage.png'
import mainImg from '../static/avatar/main.jpg'

const router = useRouter()
const route = useRoute()
const moduleList = ref([
  {name: '第一模块', summary: '点击观看小猴跳舞', color:'#9773FF',src: '/play'},
  {name: '第二模块', summary: '绿色', color:'#3EC053'},
  {name: '第三模块', summary: '蓝色', color:'#1DB2FF'},
  {name: '第四模块', summary: '橙色', color:'#F7A554'},
  {name: '第五模块', summary: '青色', color:'#00AFD1'},
  {name: '第六模块', summary: '粉色', color:'#FF6F8E'},
  {name: '第七模块', summary: '黄色', color:'#D1C425'},
  {name: '第八模块', summary: '湛清', color:'#05739D'},
])
const data = reactive({
  
})

function toDetail(module) {
  router.push({path: module.src})
}

onMounted(()=> {
});
</script>

<template>
  <div class="homePage">
    <header>
      <div class="header-container">
        <el-avatar class="avatar" icon="UserFilled" :src="mainImg"/>
        <SearchInput/>
      </div>
    </header>
    <main>
      <div class="modules">
        <div class="module" v-for="(module, index)  in moduleList" :key="index" @click="toDetail(module)">
          <p class="module-name">{{module.name}}</p>
          <p class="module-summary">{{module.summary}}</p>
          <div class="module-enter">
            <span class="module-enter-text">点击查看</span>
            <img class="module-enter-img" :src="enter" alt="">
          </div>
        </div>
      </div>
    </main>
    <footer>
      <p class="footer">备案号: 豫ICP备2021034223号-1</p>
    </footer>
  </div>
</template>

<style scoped lang="scss">
@mixin default-padding {
  padding: 0 20px;
}
.homePage {
  background: #F5F6F8;
  // background: rgba(255,255,255,.4);
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
header {
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  border-bottom: #e5e5e5;
  background: #fff;
  box-shadow: 0px 2px 10px rgba(32,39,54,0.03);
  z-index: 999;
  .header-container {
    display: flex;
    align-items: center;
    max-width: 1560px;
    justify-content: space-between;
    padding: 0 12px;
    width: 100%;
    // background: #232222;
  }
  @media screen and (max-width: 720px) {
    background: #fff;
  }
}
main {
  flex: 1;
  padding: 20px;
  @include flex-center;
  margin-top: 60px;
}
.modules {
  transform: translate(0%, 0%);
  display: grid;
  justify-content: center;
  grid-template-columns: 320px 320px 320px 320px;
  grid-gap: 20px;
  justify-items: center;
}
@media screen and (max-width: 1400px) {
  .modules {
    grid-template-columns: 320px 320px;
  }
}
@media screen and (max-width: 740px) {
  .modules {
    grid-template-columns: 320px;
  }
}
.module {
  width: 100%;
  height: 224px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 1px 0 rgba(17, 38, 78, 0.1);
  cursor: pointer;
  transition: all .2s;
  padding: 30px;
  background: #111;
  position: relative;
  border: none;
  outline: none;
  letter-spacing: 2px; // 字间距
  text-transform: uppercase; // 转换为大写
  .module-summary {
    margin-bottom: auto;
    padding-top: 12px;
    color: #fff;
    font-size: 14px;
    opacity: 0.8;
  }
  .module-enter {
    height: 20px;
    line-height: 20px;
    position: relative;
    .module-enter-text {
      width: 0;
      height: 20px;
      white-space: nowrap;
      display: inline-block;
      overflow: hidden;
      font-size: 14px;
      color: #FFFFFF;
    }
    .module-enter-img {
      position: absolute;
      left: 0;
      margin-left: 4px;
      margin-top: 1px;
      width: 16px;
      height: 14px;
      opacity: 0.4;
      transform: translate(0, 2px);
    }
  }
  &:hover {
    transform: scale(0.97);
    .module-enter-text {
      transition: width 0.4s ease 0s;
      width: 80px;
    }
    .module-enter-img {
      opacity: 1;
      left: 60px;
      transition: opacity 0.6s, left 0.6s;
    }
  }
  &:not(:hover) {
    .module-enter-text {
      transition: width 0.3s ease 0s;
      width: 0;
    }
  }
  .module-name {
    display: flex;
    width: 100%;
    color: $light_frame_1;
    font-size: 28px;
  }
}
.module:nth-of-type(n):hover {
  background: linear-gradient(90deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4);
  background-size: 400%;
  z-index: 1;
  animation: glow 8s linear infinite;
}
.module:nth-of-type(2n):hover {
  background: linear-gradient(90deg, #fa7199, #f5ce62, #e43603, #fa7199);
  background-size: 400%;
  z-index: 1;
  animation: glow 8s linear infinite;
}
.module:nth-of-type(3n):hover {
  background: linear-gradient(90deg, #983498, #d890d8, #f8dcf8, #602060);
  background-size: 400%;
  z-index: 1;
  animation: glow 8s linear infinite;
}
.module:nth-of-type(4n):hover {
  background: linear-gradient(90deg, #db3700,  #ff8c6a, #ffd2c4,  #8a1f00);
  background-size: 400%;
  z-index: 1;
  animation: glow 8s linear infinite;
}
.module:nth-of-type(5n):hover {
  background: linear-gradient(90deg, #507010, #003300, #a0dc40, #077752);
  background-size: 400%;
  z-index: 1;
  animation: glow 8s linear infinite;
}
.module:nth-of-type(6n):hover {
  background: linear-gradient(90deg, #007ca6, #15b9ff, #cef3ff, #00637b);
  background-size: 400%;
  z-index: 1;
  animation: glow 8s linear infinite;
}
.module:nth-of-type(7n):hover {
  background: linear-gradient(90deg, #002cae, #7d9aff, #d0dcff, #001c7b);
  background-size: 400%;
  z-index: 1;
  animation: glow 8s linear infinite;
}
.module:nth-of-type(8n):hover {
  background: linear-gradient(90deg, #ff51b0, #ff8cc6, #ffe1f0,  #bf0069);
  background-size: 400%;
  z-index: 1;
  animation: glow 8s linear infinite;
}
.module:before {
  content: '';
  position: absolute;
  background:  inherit;
  top: -5px;
  right: -5px;
  bottom: -5px;
  left: -5px;
  border: 12px;
  filter: blur(5px);
  transition: opacity 0.5s;
  opacity: 1;
  z-index: -1;
}
@keyframes glow {
  0%{
      background-position: 0%;
  }
  100%{
      background-position: 400%;
  }
}
footer {
  @include default-padding;
}
.footer {
  line-height: 60px;
  float: right;
}
</style>
