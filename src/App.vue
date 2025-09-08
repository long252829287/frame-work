<script setup lang="ts">
import headerComp from './components/header/headerComp.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <headerComp />
  <RouterView />
</template>

<style scoped>
:root {
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-brd: rgba(255, 255, 255, 0.18);
}
</style>
