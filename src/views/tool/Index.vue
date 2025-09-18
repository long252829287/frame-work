<template>
  <div class="tool-container">
    <h3>检查是否存在重复的id</h3>
    <el-input type="textarea" v-model="input" placeholder="请输入内容" />
    <el-input v-model="key" placeholder="请输入key" style="width: 100px;" />
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
  padding: 20px;
  margin-top: 90px;
  width: 400px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  >h3 {
    color: #fff;
  }
}
</style>
