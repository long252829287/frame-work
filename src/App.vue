<script setup>
import { commonService } from './service'
import { useStore } from '@/store'

const store = useStore();

function initPlatform() {
  let params = {
    username: 'admin',
    password: '123456'
  };
  commonService.toLogin(params).then(res => {
    sessionStorage.setItem('csrfToken', res.data.token)
    store.setToken(res.data.token);
  });
  let params2 = {
    username: 'admin'
  }
  commonService.getUserInfo(params2).then(res => {
  })
}

onMounted(()=> {
  // initPlatform();
});
</script>

<template>
  <RouterView />
</template>

<style scoped lang="scss">
@import "../src/assets/css/main.scss";
</style>
