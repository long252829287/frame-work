<template>
  <div>
    <el-input v-model="input" placeholder="请输入内容" />
    <el-button @click="checkIsOwnId">检查是否存在重复的id</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { findDuplicateIdsInTreeWithContext } from '@/utils/checkIsOwnId'
const input = ref('')
const checkIsOwnId = () => {
  // 将input的值转换为json对象
  const jsonObj = JSON.parse(input.value)
  findDuplicateIdsInTreeWithContext(jsonObj, 'id')
}
</script>

<style lang="scss" scoped></style>