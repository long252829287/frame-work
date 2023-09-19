<script lang="ts" setup>
import { ref } from 'vue'

const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  }
]
</script>

<template>
  <main>
    <div class="left-tip">
      <div class="demo-collapse"></div>
      </div>
    <div class="right-table"></div>
  </main>
</template>

<style lang="scss" scoped>
main {
  flex: 1;
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 20px;
  .left-tip {
    width: 30%;
  }
  .right-table {
    width: 50%
  }
}
</style>