<template>
  <div class="pixelated-canvas-container">
    <div class="controls">
      <label for="cellSize">格子边长: {{ cellSize }}px</label>
      <input type="range" id="cellSize" min="5" max="100" step="1" v-model.number="cellSize"
        @input="debouncedProcessImage" />

      <label for="scaleSlider">缩放比例: {{ Math.round(scaleFactor * 100) }}%</label>
      <input type="range" id="scaleSlider" min="0.1" max="3" step="0.1" v-model.number="scaleFactor"
        @input="debouncedProcessImage" />

      <button @click="resetScale">重置缩放</button>
      <button @click="autoScale">自适应缩放</button>

      <button @click="analyzeColors">解析颜色</button>
      <select v-model="colorFormat">
        <option value="hex">HEX</option>
        <option value="rgb">RGB</option>
        <option value="hsl">HSL</option>
      </select>
    </div>

    <div class="canvas-wrapper">
      <div v-if="isLoading" class="loading-overlay">
        <span>正在处理中...</span>
      </div>

      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Color from 'color'
import colorData from '@/json/oshshabi.json'
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
// 定义 props
const props = defineProps<{
  imageUrl: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const cellSize = ref(20)
const scaleFactor = ref(1.0) // 新增缩放比例
const isLoading = ref(false)
const colorFormat = ref<'rgb' | 'hex' | 'hsl'>('hex')
const progress = ref(0)

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
      const { type, current, total, data } = event.data
      if (type === 'progress') {
        progress.value = Math.floor(current / total) * 100
        console.log('导入进度：', `${progress.value}%`)
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
</script>

<style lang="scss" scoped>
.pixelated-canvas-container {
  margin-top: 20px;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.controls label {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.controls input[type='range'] {
  min-width: 120px;
}

.controls button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.controls button:hover {
  background-color: #0056b3;
}

.controls select {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
}

.canvas-wrapper {
  position: relative;
  display: inline-block;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-overlay span {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
}

canvas {
  max-width: 100%;
  border: 2px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-indicator {
  padding: 20px;
  background-color: #f0f0f0;
  text-align: center;
}
</style>
