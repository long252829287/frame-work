<template>
  <div>
    <!-- 功能选择器 -->
    <div class="function-selector">
      <el-radio-group v-model="currentMode" @change="onModeChange">
        <el-radio-button value="pixel">像素化分析</el-radio-button>
        <el-radio-button value="grid">网格解析</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 像素化分析模式 -->
    <div v-if="currentMode === 'pixel'" class="pixel-analysis">
      <ImageUploader @image-loaded="onImageLoaded" />
      <PixelatedCanvas v-if="imageUrl" :image-url="imageUrl" :key="imageUrl" />
    </div>

    <!-- 网格解析模式 -->
    <div v-if="currentMode === 'grid'">
      <GridParser />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ImageUploader from './imageUploaderComp.vue'
import PixelatedCanvas from './pixelatedCanvasComp.vue'
import GridParser from './gridParserComp.vue'

const currentMode = ref<'pixel' | 'grid'>('pixel')
const imageUrl = ref<string | null>(null)

const onImageLoaded = (url: string) => {
  imageUrl.value = url
}

const onModeChange = () => {
  // 切换模式时清空图片URL，避免状态混乱
  imageUrl.value = null
}
</script>

<style lang="scss" scoped>
.function-selector {
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%);
  border-radius: 8px;
  display: flex;
  justify-content: center;
}

.pixel-analysis {
  background: linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%);
}


.function-selector :deep(.el-radio-group) {
  .el-radio-button__inner {
    background: #FAFAFA;
    border-color: #8B4513;
    color: #5D4037;
    font-weight: 500;
    padding: 12px 20px;
  }

  .el-radio-button__original-radio:checked+.el-radio-button__inner {
    background: #8B4513;
    border-color: #8B4513;
    color: #FAFAFA;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .el-radio-button:hover .el-radio-button__inner {
    background: #D2691E;
    border-color: #D2691E;
    color: #FAFAFA;
  }
}

@media (max-width: 768px) {
  .function-selector {
    padding: 12px;
    margin-bottom: 16px;
  }

  .function-selector :deep(.el-radio-group) {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .el-radio-button {
      flex: 1;
      margin: 0;
    }

    .el-radio-button__inner {
      width: 100%;
      text-align: center;
    }
  }
}
</style>
