<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-md">
    <h3>检查是否存在重复的id</h3>
    <el-input type="textarea" v-model="input" placeholder="请输入内容" />
    <el-input v-model="key" placeholder="请输入key" class="key-input" />
    <el-button type="primary" @click="checkIsOwnId" round>开始</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { findDuplicateIdsInTreeWithContext } from '@/utils/checkIsOwnId'
const input = ref('')
const key = ref('id')
const checkIsOwnId = () => {
  const jsonObj = JSON.parse(input.value)
  findDuplicateIdsInTreeWithContext(jsonObj, key.value);
}
</script>

<style lang="scss" scoped>
.tool-container {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  >h3 {
    color: var(--color-text-primary);
  }
}

.key-input {
  width: 100px;
}
</style>
