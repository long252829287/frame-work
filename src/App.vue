<script setup>
import { onMounted } from "vue";
import { commonService } from './service'

function initPlatform() {
  let params = {
    username: 'admin',
    password: '123456'
  };
  commonService.toLogin(params).then(res => {
    console.log('res', res);
  });
  let params2 = {
    username: 'admin'
  }
  commonService.getUserInfo(params2).then(res => {
    console.log('111', res)
  })
}

onMounted(()=> {
  initPlatform();
});
</script>

<template>
  <RouterView />
</template>

<style scoped lang="scss">

</style>
