<script setup>
import { commonService } from '../../service';
import RoomMain from './components/room-main.vue';
import Header from '@/components/header/header.vue';
import { ElMessage  } from 'element-plus';
const loading = inject('loading');
const router = new useRouter()
const headerProps = ref({
  type: 2,
  title: '直播',
  placeholder: '请输入斗鱼房间号'
});

function getLiveStream(roomNumber) {
  let param = {
    rid: roomNumber,
  };
  commonService
    .postLiveStream(param)
    .then((res) => {
      if (res.data.fileUrl != null) {
        loading.hideLoading();
        router.push({
          name: 'play',
          query: { url: res.data.fileUrl, isLive: true },
        });
      } else {
        loading.hideLoading();
        ElMessage({
          type: 'warning',
          message: '房间号错误或未开播',
          center: true,
        });
      }
    })
    .catch((err) => {
      loading.hideLoading();
    });
}

function search(val) {
  loading.showLoading();
  getLiveStream(val);
}

onMounted(() => {
});
</script>

<template>
  <div class="room">
    <Header v-bind="headerProps" @search="search"></Header>
    <RoomMain></RoomMain>
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
  background: #f5f6f8;
  // background: rgba(255,255,255,.4);
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

footer {
  @include default-padding;
}
.footer {
  line-height: 60px;
  float: right;
}
</style>
