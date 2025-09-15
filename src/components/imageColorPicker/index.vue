<template>
  <div>
    <ImageUploader @image-loaded="onImageLoaded" />
    <PixelatedCanvas v-if="imageUrl" :image-url="imageUrl" :key="imageUrl" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ImageUploader from './imageUploaderComp.vue';
import PixelatedCanvas from './pixelatedCanvasComp.vue';

const imageUrl = ref<string | null>(null);

const onImageLoaded = (url: string) => {
  imageUrl.value = url;
};
</script>