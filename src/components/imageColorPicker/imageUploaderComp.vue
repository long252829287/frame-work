<template>
  <div class="image-uploader">
    <el-button type="primary" for="file-upload" class="custom-file-upload"
      onclick="this.nextElementSibling.click()">上传图片</el-button>
    <input id="file-upload" type="file" accept="image/png, image/jpeg, image/jpg" @change="handleImageUpload" />
    <p class="file-upload-tips" v-if="!imageUrl">请选择一张本地图片</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 定义 emit 事件，用于向父组件传递图片 URL
const emit = defineEmits<{
  (e: 'image-loaded', url: string): void
}>()

const imageUrl = ref<string | null>(null)

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]

    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value)
    }

    // 创建新的对象 URL
    const newImageUrl = URL.createObjectURL(file)
    imageUrl.value = newImageUrl

    // 通过 emit 将 URL 传递给父组件
    emit('image-loaded', newImageUrl)
  }
}
</script>

<style lang="scss" scoped>
.image-uploader input[type='file'] {
  display: none;
}

.custom-file-upload {
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
}

.file-upload-tips {
  font-size: 12px;
  color: #fff;
  margin-top: 10px;
}
</style>
