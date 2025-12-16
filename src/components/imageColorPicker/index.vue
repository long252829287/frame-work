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
  padding: 14px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  display: flex;
  justify-content: center;
}

.pixel-analysis {
  background: transparent;
}


.function-selector :deep(.el-radio-group) {
  .el-radio-button__inner {
    background: rgba(255, 255, 255, 0.55);
    border-color: rgba(255, 255, 255, 0.65);
    color: var(--color-text-secondary);
    font-weight: 500;
    padding: 12px 20px;
  }

  .el-radio-button__original-radio:checked+.el-radio-button__inner {
    background: var(--color-accent-primary);
    border-color: rgba(0, 122, 255, 0.45);
    color: var(--color-text-inverse);
    box-shadow: var(--shadow-lg);
  }

  .el-radio-button:hover .el-radio-button__inner {
    background: rgba(255, 255, 255, 0.75);
    border-color: rgba(0, 122, 255, 0.25);
    color: var(--color-text-primary);
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
