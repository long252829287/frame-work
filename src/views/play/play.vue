<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import VideoPlayer from '../../components/videoPlay/videoPlayer.vue';

const router = useRouter();
const isCollect = false;


function toBack() {
  router.go(-1)
}
onMounted(() => {});
</script>

<template>
  <div class="Play">
    <div class="course-detail-header">
      <div class="l">
        <div class="go-back">
          <i class="iconfont icon-arrow-left" @click="toBack"></i>
        </div>
        <div class="collect" @click="isCollect = !isCollect">
          <i class="iconfont icon-star-o">
            <span>{{ isCollect ? '已收藏' : '收藏' }}</span>
          </i>
        </div>
      </div>
    </div>
    <div class="course-detail-content">
      <div class="content-left display-center">
        <ul class="left-list">
          <li>
            <span>1</span>
          </li>
          <li>
            <span>2</span>
          </li>
          <li>
            <span>3</span>
          </li>
          <li>
            <span>4</span>
          </li>
        </ul>
      </div>
      <div class="content-center">
        <Video-player></Video-player>
      </div>
      <div class="content-right display-center" @click="toExpand()">back</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.Play {
  display: flex;
  flex-direction: column;
  background: #fff;
  box-sizing: border-box;
  height: 100%;
  .course-detail-header {
    position: relative;
    padding-right: 24px;
    height: 60px;
    display: block;
    .l {
      display: flex;
      align-items: center;
      justify-content: space-between;
      line-height: 60px;
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
      .collect {
        display: flex;
        align-items: center;
        transition: 0.3s all linear;
        > i {
          font-size: 20px;
          color: #b2b8bd;
          display: flex;
          align-items: center;
          > span {
            margin-left: 4px;
            font-size: 14px;
          }
        }
        &:hover {
          cursor: pointer;
          color: rgb(34, 33, 33);
        }
      }
    }
  }
  .course-detail-content {
    display: flex;
    background-color: #1c1f21;
    position: relative;
    height: 808px;
    .display-center {
      height: 100%;
      width: 60px;
      display: flex;
      flex-direction: column;
      align-content: center;
      justify-content: center;
    }
    .content-left {
      min-width: 60px;
      ul > li {
        color: rgba(255, 255, 255, 0.4);
        height: 72px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        &:hover {
          background: #26292c;
          color: #fff;
          cursor: pointer;
        }
      }
    }
    .content-center {
      flex: 1;
      padding: 16px 0;
    }
    .content-right {
      min-width: 60px;
      > i {
        color: rgba(255, 255, 255, 0.4);
        font-size: 22px;
      }
    }
  }
}
</style>
