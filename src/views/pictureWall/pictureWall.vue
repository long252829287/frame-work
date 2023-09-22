<script setup>
import { ref } from 'vue';
import { useInView } from '@/hooks/useInView';
import Header from '@/components/header/header.vue'

const imgRef = ref(null);

useInView(imgRef);
</script>

<template>
  <Header title="照片墙"></Header>
  <div class="picture-wall">
    <div v-for="(_, idx) in new Array(200).fill(1)" :key="idx">
      <img
        ref="imgRef"
        src="https://via.placeholder.com/300"
        :data-src="`https://picsum.photos/300/${300 + idx}`"
        alt="b"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 定义淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 应用淡入动画到元素 */
.fade-in {
  animation: fadeIn 0.6s ease-in;
}
.picture-wall {
  padding: 70px 0 10px;
  display: grid;
  grid-template-columns: 300px 300px 300px 300px 300px;
  grid-gap: 20px;
  align-items: center;
  justify-content: center;
  background: #F5F6F8;
  > div {
    width: 300px;
    height: auto;
    > img {
      border-radius: 8px;
      box-shadow: 0 13px 27px -5px #32325d40, 0 8px 16px -8px #0000004d, 0 -6px 16px -6px #00000008;
      height: 100%;
      max-width: 100%;
      cursor: pointer;
    }
    >img:hover {
      transition: .4s;
      transform: scale(1.05);
    }
  }
}
@media screen and (max-width: 1650px) {
  .picture-wall {
    grid-template-columns: 300px 300px 300px 300px;
  }
}
@media screen and (max-width: 1300px) {
  .picture-wall {
    grid-template-columns: 300px 300px 300px;
  }
}
@media screen and (max-width: 900px) {
  .picture-wall {
    grid-template-columns: 300px 300px;
  }
}
@media screen and (max-width: 680px) {
  .picture-wall {
    grid-template-columns: 300px;
  }
}
</style>
