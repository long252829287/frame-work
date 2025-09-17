<template>
  <div class="tool-container">
    <h3>检查是否存在重复的id</h3>
    <el-input type="textarea" v-model="input" placeholder="请输入内容" />
    <el-button type="primary" @click="checkIsOwnId" round size="small">开始</el-button>
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

<style lang="scss" scoped>
.tool-container {
  padding: 20px;
  margin-top: 90px;
  width: 400px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
