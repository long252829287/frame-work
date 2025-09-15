<template>
  <div class="image-uploader">
    <label for="file-upload" class="custom-file-upload">
      点击上传图片
    </label>
    <input id="file-upload" type="file" accept="image/png, image/jpeg, image/jpg" @change="handleImageUpload" />
    <p v-if="!imageUrl">请选择一张本地图片</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 定义 emit 事件，用于向父组件传递图片 URL
const emit = defineEmits<{
  (e: 'image-loaded', url: string): void
}>();

const imageUrl = ref<string | null>(null);

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];

    // 如果之前有 URL，先释放掉，防止内存泄漏
    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value);
    }

    // 创建新的对象 URL
    const newImageUrl = URL.createObjectURL(file);
    imageUrl.value = newImageUrl;

    // 通过 emit 将 URL 传递给父组件
    emit('image-loaded', newImageUrl);
  }
};
</script>

<style scoped>
.image-uploader input[type="file"] {
  display: none;
}

.custom-file-upload {
  border: 1px solid #ccc;
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
  background-color: #f0f0f0;
  border-radius: 4px;
}
</style>