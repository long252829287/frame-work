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
  <div></div>
  <p>{{user.name}}</p>
</template>
