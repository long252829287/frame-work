<template>
  <div class="pixelated-canvas-container">
    <el-form class="controls" label-width="auto" :model="formLabelAlign" label-position="left">
      <el-form-item :label="`格子边长: ${cellSize}px`">
        <div class="slider-container">
          <el-slider v-model.number="cellSize" :min="5" :max="100" size="small" class="mobile-slider"
            @change="debouncedProcessImage" />
          <el-input-number v-model="cellSize" :min="5" :max="100" size="small" class="slider-input"
            @change="debouncedProcessImage" />
        </div>
      </el-form-item>
      <el-form-item :label="`缩放比例: ${Math.round(scaleFactor * 100)}%`">
        <div class="slider-container">
          <el-slider v-model.number="scaleFactor" :min="0.3" :max="3" :step="0.1" size="small" class="mobile-slider"
            @change="debouncedProcessImage" />
          <el-input-number v-model="scaleFactor" :min="0.3" :max="3" :step="0.1" size="small" class="slider-input"
            @change="debouncedProcessImage" />
        </div>
      </el-form-item>
      <el-form-item label="颜色格式">
        <el-select v-model="colorFormat" placeholder="" style="width: 120px">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="操作">
        <div class="button-group">
          <el-button @click="resetScale">重置缩放</el-button>
          <el-button @click="autoScale">自适应缩放</el-button>
          <el-button @click="analyzeColors" type="primary">开始解析</el-button>
          <el-button @click="downloadImage" type="primary">下载图片</el-button>
        </div>
      </el-form-item>
    </el-form>

    <div class="canvas-wrapper">
      <div v-if="isLoading" class="loading-overlay">
        <span>正在解析中... {{ progress }} % </span>
      </div>

      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, reactive } from 'vue'
import Color from 'color'
import colorData from '../../json/oshshabi.json'

// 组件状态
const canvasRef = ref<HTMLCanvasElement>()
const cellSize = ref(20)
const scaleFactor = ref(1)
const colorFormat = ref('hex')
const isLoading = ref(false)
const progress = ref(0)

// 表单配置
const formLabelAlign = reactive({})

// 选项配置
const options = [
  { value: 'hex', label: 'HEX' },
  { value: 'rgb', label: 'RGB' },
  { value: 'hsl', label: 'HSL' }
]

// 防抖处理
let debounceTimer: number | null = null
const debouncedProcessImage = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    processImage()
  }, 300)
}

// 处理图片的主要逻辑
const processImage = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 这里添加图片处理逻辑
  console.log('Processing image with cellSize:', cellSize.value, 'scaleFactor:', scaleFactor.value)
}

// 重置缩放
const resetScale = () => {
  scaleFactor.value = 1
  processImage()
}

// 自适应缩放
const autoScale = () => {
  // 计算自适应缩放逻辑
  scaleFactor.value = 1.5
  processImage()
}

// 分析颜色
const analyzeColors = () => {
  isLoading.value = true
  progress.value = 0

  // 模拟分析过程
  const interval = setInterval(() => {
    progress.value += 10
    if (progress.value >= 100) {
      clearInterval(interval)
      isLoading.value = false
      console.log('Color analysis completed')
    }
  }, 200)
}

// 下载图片
const downloadImage = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const link = document.createElement('a')
  link.download = 'pixelated-image.png'
  link.href = canvas.toDataURL()
  link.click()
}

// 监听参数变化
watch([cellSize, scaleFactor], () => {
  debouncedProcessImage()
})

// 组件挂载时初始化
onMounted(() => {
  if (canvasRef.value) {
    const canvas = canvasRef.value
    canvas.width = 800
    canvas.height = 600
    processImage()
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/themes/stardew-valley.scss' as stardew;

.pixelated-canvas-container {
  margin-top: 20px;
  background: linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%);
  min-height: 100vh;
  padding: 20px;
  position: relative;

  @include stardew.texture-bg;

  >* {
    position: relative;
    z-index: 1;
  }
}

.controls {
  @include stardew.card;
  margin-bottom: 20px;
  gap: 8px;
  padding: 20px;
  max-width: 100%;
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;
}

.controls :deep(.el-form-item) {
  margin-bottom: 16px;

  .el-form-item__label {
    font-weight: 600;
    color: #5D4037;
    white-space: nowrap;
    font-size: 14px;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
  }
}

// 滑块容器响应式布局
.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}

.mobile-slider {
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    width: 100%;
  }
}

.slider-input {
  width: 80px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
  }
}

// 按钮组响应式布局
.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .el-button {
      flex: 1;
      min-width: 0;
    }
  }
}

// 按钮样式 - 使用主题系统
.controls :deep(.el-button) {
  @include stardew.button('default');

  &.el-button--primary {
    @include stardew.button('secondary');
  }
}

// 下拉选择框样式
.controls :deep(.el-select) {
  .el-select__wrapper {
    @include stardew.input;
  }
}

// 滑块样式
.controls :deep(.el-slider) {
  .el-slider__runway {
    background: #A0522D;
    border-radius: 4px;
  }

  .el-slider__bar {
    background: linear-gradient(90deg, #228B22 0%, #32CD32 100%);
    border-radius: 4px;
  }

  .el-slider__button {
    background: #FAFAFA;
    border: 2px solid #8B4513;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }
}

// 数字输入框样式
.controls :deep(.el-input-number) {
  .el-input__wrapper {
    @include stardew.input;
  }

  .el-input__inner {
    color: #5D4037;
    font-weight: 500;
  }
}

.canvas-wrapper {
  position: relative;
  display: inline-block;
  @include stardew.card;
  padding: 16px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(139, 69, 19, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 12px;
}

.loading-overlay span {
  @include stardew.button('secondary');
  padding: 12px 24px;
  border-radius: 8px;
}

canvas {
  max-width: 100%;
  border: 3px solid #8B4513;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(139, 69, 19, 0.1),
  0 4px 12px rgba(0, 0, 0, 0.3);
  background: #FAFAFA;
}

.loading-indicator {
  padding: 20px;
  @include stardew.card;
  text-align: center;
  color: #5D4037;
  font-weight: 500;
}

// 响应式调整
@media (max-width: 768px) {
  .pixelated-canvas-container {
    padding: 12px;
    margin-top: 12px;
  }

  .controls {
    padding: 16px;
    margin-bottom: 16px;
  }

  .canvas-wrapper {
    padding: 12px;
  }
}
</style>