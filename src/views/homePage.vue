<script setup>
import { ref, onMounted, reactive } from "vue";
import SearchInput from '@/components/search-input.vue'
import softDrag from '@/components/soft-drag.vue'
import enter from '../static/homePage/enter_toPage.png'

const moduleList = ref([
  {name: '第一模块', summary: '紫色', color:'#9773FF'},
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

onMounted(()=> {
});
</script>

<template>
  <div class="homePage">
    <header>
      <el-avatar class="avatar" icon="UserFilled" />
      <SearchInput/>
    </header>
    <main>
      <div class="modules">
        <div class="module" v-for="(module, index)  in moduleList" :key="index">
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
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
}
header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @include default-padding;
}
main {
  flex: 1;
  position: relative;
}
.modules {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  justify-content: center;
  grid-template-columns: 320px 320px 320px 320px;
  grid-gap: 20px;
  justify-items: center;
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
    font-size: $normal-size;
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
  float: right;
}
</style>
