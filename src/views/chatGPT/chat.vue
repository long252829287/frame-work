<script setup>
import SearchInput from '@/components/search-input.vue';
import Header from '@/components/header/header.vue'
import { commonService } from '../../service';

const loading = inject('loading');
const route = useRoute();
const router = useRouter();

function search(val) {
  let params = {
    rid: val.value
  }
  commonService.postHuyaLiveStream(params).then(res => {
    if (res.data.fileUrl != null) {
      loading.hideLoading();
      router.push({
        name: 'play',
        query: { url: res.data.fileUrl, isLive: true },
      });
    } else {
      loading.hideLoading();
    }
  })
}

function toBack() {
  router.go(-1);
}
</script>

<template>
  <div class="chat">
    <Header></Header>
  </div>
</template>

<style lang="scss" scoped>
.room {
  background: #f5f6f8;
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
  border-bottom: #e5e5e5;
  background: #fff;
  box-shadow: 0px 2px 10px rgba(32, 39, 54, 0.03);
  z-index: 999;
  .header-container {
    display: flex;
    align-items: center;
    max-width: 1560px;
    justify-content: space-between;
    padding: 0 12px 0 0;
    width: 100%;
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
  }
  @media screen and (max-width: 720px) {
    background: #fff;
  }
}
</style>