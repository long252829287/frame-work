<script setup>
import { onMounted } from "vue"
const user = {
  name: 'liuyl'
};
onMounted(()=> {
 console.log(123);
});
</script>

<template>
  <p>{{user.name}}</p>
</template>
