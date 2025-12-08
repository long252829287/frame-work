<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center mr-1 flex-wrap">
      <div v-for="item in lolStore.champions" :key="item._id" class="rounded-lg shadow-sm">
        <img :src="item.images.square" alt="">
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useLolStore } from '@/stores/lol'

const lolStore = useLolStore()
const loading = ref(false)

const init = async () => {
  loading.value = true
  try {
    await lolStore.initializeData()
    console.log('lolStore', lolStore.champions);
  } catch (error: any) {
    console.error('Failed to initialize:', error)
    ElMessage.error(error.message || '加载数据失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  init()
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/themes/modern-minimal.scss' as theme;
</style>
