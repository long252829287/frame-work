<template>
  <div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { commonService } from '@/service';
const res = await commonService.apiGetChampions();
console.log('res', res.data.data.champions);
</script>

<style lang="scss" scoped></style>
