<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref } from 'vue'
const name = ref('liuyl')
const age = ref(18)
</script>

<template>
  <div>
    <h1>{{ name }}</h1>
    <h1>{{ age }}</h1>
  </div>
  <RouterView />
</template>

<style scoped>
:root {
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-brd: rgba(255, 255, 255, 0.18);
}
</style>
