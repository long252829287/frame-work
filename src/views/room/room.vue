<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter, useRoute } from 'vue-router'
import SearchInput from '@/components/search-input.vue'
import { commonService } from '../../service'

const router = useRouter()
const route = useRoute()
const data = reactive({
  
})

function toDetail(module) {
  router.push({path: module.src})
}

function getLiveStream(roomNumber) {
  let param = {
    rid: roomNumber
  }
  commonService.postLiveStream(param).then(res => {
    const url = res.data.m3u8;
    if (res.data.m3u8 != null) router.push({name: 'play', query: {url: url}})
  })
}

function search(val) {
  getLiveStream(val.searchVal);
}

function toBack() {
  router.go(-1)
}
onMounted(()=> {
});
</script>

<template>
  <div class="room">
    <header>
      <div class="header-container">
        <div class="go-back">
          <i class="iconfont icon-arrow-left" @click="toBack"></i>
        </div>
        <SearchInput @search="search"/>
      </div>
    </header>
    <main>
    </main>
    <footer>
      <p class="footer"></p>
    </footer>
  </div>
</template>

<style scoped lang="scss">
@mixin default-padding {
  padding: 0 20px;
}
.room {
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
main {
  flex: 1;
  padding: 20px;
  @include flex-center;
  margin-top: 60px;
}
footer {
  @include default-padding;
}
.footer {
  line-height: 60px;
  float: right;
}
</style>
