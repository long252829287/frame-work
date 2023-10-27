<script setup>
import {
  onMounted,
  onBeforeUnmount,
  ref
} from 'vue';
import SearchInput from '@/components/search-input.vue';
import { useRouter } from 'vue-router';
import mainImg from '@/static/avatar/main.jpg'
const emit = defineEmits(['search']);
const router = useRouter(); 
defineProps({
  title: String,
  type: [String, Number],
  placeholder: {
    type: String,
    default: '请输入感兴趣的内容'
  }
})
let progress = ref(0);
const scrollHandler = function() {
  progress.value = ((document.documentElement.scrollTop / (document.documentElement.scrollHeight - document.documentElement.clientHeight)) * 100).toFixed(2);
};

function toBack() {
  router.go(-1);
}

function search(val) {
  emit('search', val.value);
}

function toLogin() {
  router.push({
    name: 'login',
  })
}
onMounted(() => {
  window.addEventListener('scroll', scrollHandler);
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', scrollHandler)
})
</script>

<template>
  <header>
    <div class="header-container">
      <el-avatar v-if="type == 1" class="avatar" icon="UserFilled" :src="mainImg" @click="toLogin"/>
      <div v-else class="go-back" @click="toBack">
        <i class="iconfont icon-arrow-left"></i>
      </div>
      <h3>{{title}}</h3>
      <SearchInput :placeholder="placeholder" @search="search"/>
    </div>
    <div class="progress" :style="{width: progress + '%'}"></div>
  </header>
</template>

<style lang="scss" scoped>
header {
  width: 100vw;
  display: flex;
  height: 60px;
  align-items: center;
  justify-content: center;
  position: fixed;
  border-bottom: #e5e5e5;
  top: 0;
  background: #fff;
  box-shadow: 0px 2px 10px rgba(32,39,54,0.03);
  z-index: 999;
  .header-container {
    display: flex;
    align-items: center;
    max-width: 1630px;
    padding: 0 12px;
    width: 100%;
    .avatar {
      cursor: pointer;
    }
    .go-back {
      width: 70px;
      text-align: center;
      > i {
        font-size: 24px;
        color: #9199a1;
        line-height: 60px;
        width: 100%;
        transition: 0.3s all linear;
      }
      &:hover {
        background-color: #ebeff3;
        color: rgb(34, 33, 33);
        cursor: pointer;
      }
    }
    > h3 {
      margin: 0 auto 0 10px;
    }
    @media (max-width: 720px) {
      > h3 {
        display: none;
      }
    }
  }
  @media screen and (max-width: 720px) {
    background: #fff;
  }
  .progress {
    position: fixed;
    top: 60px;
    left: 0;
    height: 3px;
    background-color: #0A74DA;
  }
}
</style>