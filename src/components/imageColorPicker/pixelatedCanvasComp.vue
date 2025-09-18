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

const formLabelAlign = reactive({
  name: '',
  region: '',
  type: '',
})
type PaletteColor = {
  name: string
  r: number
  g: number
  b: number
}

const colorMap = new Map<string, string | string[]>(Object.entries(colorData))
const mardPalette: PaletteColor[] = []
for (const [name, hexArray] of colorMap.entries()) {
  const originalHex = hexArray[0]
  const colorInstance = Color(originalHex)
  mardPalette.push({
    name: name,
    r: colorInstance.red(),
    g: colorInstance.green(),
    b: colorInstance.blue(),
  })
}

const colorMatchCache = new Map<string, string>()
const props = defineProps<{
  imageUrl: string
}>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const cellSize = ref(20)
const scaleFactor = ref(1.0) // 新增缩放比例
const isLoading = ref(false)
const colorFormat = ref<'rgb' | 'hex' | 'hsl'>('hex')
const progress = ref(0)
const options = [
  { value: 'hex', label: 'HEX' },
  { value: 'rgb', label: 'RGB' },
  { value: 'hsl', label: 'HSL' },
]

let pixelatedColorData: { r: number; g: number; b: number; a: number }[] = []
let originalImageWidth = 0
let originalImageHeight = 0
let scaledImageWidth = 0
let scaledImageHeight = 0
let isAnalyzed = ref(false)

function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined

  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
// 主处理函数
const processImage = () => {
  const margin = 30
  if (!props.imageUrl || !canvasRef.value) return
  isLoading.value = true
  isAnalyzed.value = false
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    isLoading.value = false
    return
  }

  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = props.imageUrl

  img.onload = () => {
    // 保存原始尺寸
    originalImageWidth = img.width
    originalImageHeight = img.height

    // 计算缩放后的尺寸
    scaledImageWidth = Math.round(originalImageWidth * scaleFactor.value)
    scaledImageHeight = Math.round(originalImageHeight * scaleFactor.value)

    canvas.width = scaledImageWidth + margin
    canvas.height = scaledImageHeight + margin

    // 创建临时canvas来处理缩放
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    tempCanvas.width = scaledImageWidth
    tempCanvas.height = scaledImageHeight

    // 在临时canvas上绘制缩放后的图片
    tempCtx.drawImage(img, 0, 0, scaledImageWidth, scaledImageHeight)
    const imageData = tempCtx.getImageData(0, 0, scaledImageWidth, scaledImageHeight)

    const worker = new Worker(new URL('../../workers/pixelate.worker.ts', import.meta.url), {
      type: 'module',
    })

    worker.postMessage({ imageData, cellSize: cellSize.value })

    worker.onmessage = (event) => {
      const { type, percentage, data } = event.data
      if (type === 'progress') {
        progress.value = percentage;
      } else if (type === 'complete') {
        pixelatedColorData = data
        drawPixelatedImage(pixelatedColorData)
        isLoading.value = false
        worker.terminate()
      }
    }

    img.onerror = () => {
      console.error('图片加载失败')
      isLoading.value = false
    }
  }
}

const debouncedProcessImage = debounce(processImage, 300) // 延迟300毫秒
// 绘制函数
const drawPixelatedImage = (
  colors: { r: number; g: number; b: number; a: number }[],
  showText: boolean = false,
) => {
  const margin = 30
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  let colorIndex = 0

  ctx.fillStyle = '#666'
  ctx.font = '10px Arial'

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let y = 0; y < scaledImageHeight; y += cellSize.value) {
    const label = y / cellSize.value + 1
    const textY = y + margin + cellSize.value / 2
    ctx.fillText(label.toString(), margin / 2, textY)
  }

  for (let x = 0; x < scaledImageWidth; x += cellSize.value) {
    const label = x / cellSize.value + 1
    const textX = x + margin + cellSize.value / 2
    ctx.fillText(label.toString(), textX, margin / 2)
  }

  for (let y = 0; y < scaledImageHeight; y += cellSize.value) {
    for (let x = 0; x < scaledImageWidth; x += cellSize.value) {
      if (colorIndex < colors.length) {
        const color = colors[colorIndex]

        const drawX = x + margin
        const drawY = y + margin
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`
        ctx.fillRect(drawX, drawY, cellSize.value, cellSize.value)

        if (showText) {
          drawColorText(ctx, drawX, drawY, color)
        }
        colorIndex++
      }
    }
  }
}

watch(() => props.imageUrl, processImage, { immediate: true })
watch(() => scaleFactor.value, debouncedProcessImage)

onMounted(processImage)

const analyzeColors = () => {
  if (pixelatedColorData.length > 0) {
    isAnalyzed.value = true
    drawPixelatedImage(pixelatedColorData, true)
  }
}

// 重置缩放比例
const resetScale = () => {
  scaleFactor.value = 1.0
}

// 自适应缩放 - 让小图片放大到合适尺寸
const autoScale = () => {
  if (originalImageWidth === 0 || originalImageHeight === 0) return

  const minDesiredSize = 400 // 最小期望尺寸
  const maxDesiredSize = 800 // 最大期望尺寸

  const maxOriginalSize = Math.max(originalImageWidth, originalImageHeight)

  if (maxOriginalSize < minDesiredSize) {
    // 图片太小，放大
    scaleFactor.value = minDesiredSize / maxOriginalSize
  } else if (maxOriginalSize > maxDesiredSize) {
    // 图片太大，缩小
    scaleFactor.value = maxDesiredSize / maxOriginalSize
  } else {
    // 尺寸合适，保持原样
    scaleFactor.value = 1.0
  }
}

const drawColorText = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: { r: number; g: number; b: number },
) => {
  let displayText = '' // 最终要显示的文字

  const cacheKey = `${color.r},${color.g},${color.b}`

  // 如果缓存中已有结果，直接使用
  if (colorMatchCache.has(cacheKey)) {
    displayText = colorMatchCache.get(cacheKey)!
  } else {
    // 如果没有缓存，则开始计算
    let minDistance = Infinity
    let closestMatchName = ''

    for (const paletteColor of mardPalette) {
      const distance =
        Math.pow(color.r - paletteColor.r, 2) +
        Math.pow(color.g - paletteColor.g, 2) +
        Math.pow(color.b - paletteColor.b, 2)

      // 如果找到了一个更近的颜色，就更新记录
      if (distance < minDistance) {
        minDistance = distance
        closestMatchName = paletteColor.name
      }
    }

    displayText = closestMatchName
    // 将计算结果存入缓存
    colorMatchCache.set(cacheKey, displayText)
  }

  const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000
  ctx.fillStyle = brightness > 128 ? 'black' : 'white'

  const fontSize = Math.max(8, Math.min(12, cellSize.value / 3))
  ctx.font = `${fontSize}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillText(displayText, x + cellSize.value / 2, y + cellSize.value / 2)
}

watch(colorFormat, () => {
  if (isAnalyzed.value) {
    drawPixelatedImage(pixelatedColorData, true)
  }
})

const downloadImage = () => {
  if (!canvasRef.value) return
  const link = document.createElement('a')
  link.href = canvasRef.value.toDataURL('image/png')
  link.download = 'pixelated_image.png'
  link.click()
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/themes/theme-manager.scss' as theme;

.pixelated-canvas-container {
  margin-top: #{theme.theme-spacing('xl')};
  background: #{theme.theme-bg('bg-primary')};
  min-height: 100vh;
  padding: #{theme.theme-spacing('xl')};
  position: relative;

  @include theme.theme-texture-bg;

  >* {
    position: relative;
    z-index: 1;
  }
}

.controls {
  @include theme.theme-card;
  margin-bottom: #{theme.theme-spacing('xl')};
  gap: #{theme.theme-spacing('sm')};
  padding: #{theme.theme-spacing('xl')};
  max-width: 100%;
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;
}

.controls :deep(.el-form-item) {
  margin-bottom: #{theme.theme-spacing('lg')};

  .el-form-item__label {
    font-weight: #{theme.$font-weight-semibold};
    color: #{theme.theme-color('text-primary')};
    white-space: nowrap;
    font-size: 14px;
    text-shadow: 1px 1px 2px #{theme.$shadow-light};
  }
}

// 滑块容器响应式布局
.slider-container {
  display: flex;
  align-items: center;
  gap: #{theme.theme-spacing('md')};
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: #{theme.theme-spacing('sm')};
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
  gap: #{theme.theme-spacing('sm')};
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
  @include theme.theme-button('default');

  &.el-button--primary {
    @include theme.theme-button('secondary');
  }
}

// 下拉选择框样式
.controls :deep(.el-select) {
  .el-select__wrapper {
    @include theme.theme-input;
  }
}

// 滑块样式
.controls :deep(.el-slider) {
  .el-slider__runway {
    background: #{theme.$slider-track};
    border-radius: #{theme.theme-radius('sm')};
  }

  .el-slider__bar {
    background: #{theme.$slider-fill};
    border-radius: #{theme.theme-radius('sm')};
  }

  .el-slider__button {
    background: #{theme.$slider-thumb};
    border: 2px solid #{theme.theme-color('border-primary')};
    box-shadow: 0 2px 6px #{theme.$shadow-dark};
  }
}

// 数字输入框样式
.controls :deep(.el-input-number) {
  .el-input__wrapper {
    @include theme.theme-input;
  }

  .el-input__inner {
    color: #{theme.theme-color('text-primary')};
    font-weight: #{theme.$font-weight-medium};
  }
}

.canvas-wrapper {
  position: relative;
  display: inline-block;
  @include theme.theme-card;
  padding: #{theme.theme-spacing('lg')};
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #{theme.theme-bg('bg-overlay')};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: #{theme.$z-overlay};
  border-radius: #{theme.theme-radius('xl')};
}

.loading-overlay span {
  @include theme.theme-button('secondary');
  padding: #{theme.theme-spacing('md')} #{theme.theme-spacing('2xl')};
  border-radius: #{theme.theme-radius('lg')};
}

canvas {
  max-width: 100%;
  border: 3px solid #{theme.theme-color('border-primary')};
  border-radius: #{theme.theme-radius('lg')};
  box-shadow: inset 0 2px 4px #{theme.$shadow-inset},
  0 4px 12px #{theme.$shadow-card};
  background: #{theme.theme-color('secondary-lightest')};
}

.loading-indicator {
  padding: #{theme.theme-spacing('xl')};
  @include theme.theme-card;
  text-align: center;
  color: #{theme.theme-color('text-primary')};
  font-weight: #{theme.$font-weight-medium};
}

// 响应式调整
@media (max-width: 768px) {
  .pixelated-canvas-container {
    padding: #{theme.theme-spacing('md')};
    margin-top: #{theme.theme-spacing('md')};
  }

  .controls {
    padding: #{theme.theme-spacing('lg')};
    margin-bottom: #{theme.theme-spacing('lg')};
  }

  .canvas-wrapper {
    padding: #{theme.theme-spacing('md')};
  }
}
</style>
