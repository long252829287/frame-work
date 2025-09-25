<template>
  <div class="grid-parser-container">
    <div class="controls">
      <el-button type="primary" @click="selectImage">选择图片</el-button>
      <input ref="fileInput" type="file" accept="image/*" @change="handleImageUpload" style="display: none" />

      <el-button v-if="gridDrawn" @click="reset" type="warning">
        重新选择区域
      </el-button>

      <el-button v-if="imageLoaded && !gridDrawn" @click="startDivision" :disabled="!squareSet">
        开始分割
      </el-button>
      <el-button v-if="gridDrawn" @click="startParsing" type="primary">
        开始解析
      </el-button>
      <el-button v-if="gridDrawn" @click="downloadCanvas" type="success">
        下载图片
      </el-button>
    </div>

    <div v-if="gridDrawn" class="grid-info">
      <span>网格信息：{{ gridInfo.rows }} 行 × {{ gridInfo.cols }} 列 ({{ gridInfo.rows * gridInfo.cols }} 个格子)</span>
      <div class="offset-controls">
        <label>精确度调整：</label>
        <el-button size="small" @click="adjustOffset(-1, 0)">← 左移</el-button>
        <el-button size="small" @click="adjustOffset(1, 0)">→ 右移</el-button>
        <el-button size="small" @click="adjustOffset(0, -1)">↑ 上移</el-button>
        <el-button size="small" @click="adjustOffset(0, 1)">↓ 下移</el-button>
        <el-button size="small" @click="resetOffset" type="warning">重置</el-button>
      </div>
    </div>

    <div class="image-container" ref="imageContainer">
      <img v-if="imageUrl && !gridDrawn" :src="imageUrl" ref="imageRef" @load="onImageLoad" @dragstart.prevent
        @selectstart.prevent class="source-image" />

      <div v-if="imageLoaded && !gridDrawn" class="square-selector"
        :class="{ dragging: isDragging, resizing: isResizing }" :style="squareStyle" @mousedown="startDrag">
        <div class="resize-handle top-left" @mousedown.stop="startResize($event, 'top-left')"></div>
        <div class="resize-handle top-right" @mousedown.stop="startResize($event, 'top-right')"></div>
        <div class="resize-handle bottom-left" @mousedown.stop="startResize($event, 'bottom-left')"></div>
        <div class="resize-handle bottom-right" @mousedown.stop="startResize($event, 'bottom-right')"></div>
      </div>

      <canvas v-if="gridDrawn" ref="canvasRef" class="grid-canvas"></canvas>
    </div>

    <div v-if="isLoading" class="loading-overlay">
      <span>正在解析中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Color from 'color'
import colorData from '../../json/rgbTransformColor.json'

// 用户调整的偏移量
const userOffset = ref({ x: 0, y: 0 });
// 颜色数据处理
type PaletteColor = {
  name: string
  r: number
  g: number
  b: number
}

const colorMap = new Map<string, string | string[]>(Object.entries(colorData))
const colorPalette: PaletteColor[] = []
for (const [name, hexArray] of colorMap.entries()) {
  const originalHex = hexArray[0]
  const colorInstance = Color(originalHex)
  colorPalette.push({
    name: name,
    r: colorInstance.red(),
    g: colorInstance.green(),
    b: colorInstance.blue(),
  })
}

// 响应式状态
const imageUrl = ref<string | null>(null)
const imageLoaded = ref(false)
const gridDrawn = ref(false)
const isLoading = ref(false)
const squareSet = ref(false)

// DOM 引用
const fileInput = ref<HTMLInputElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const imageContainer = ref<HTMLDivElement | null>(null)

// 正方形选择器状态
const square = ref({
  x: 50,
  y: 50,
  size: 100
})

const isDragging = ref(false)
const isResizing = ref(false)
const resizeHandle = ref('')
const dragStart = ref({ x: 0, y: 0 })

// 图片尺寸和位置信息
const imageSize = ref({ width: 0, height: 0 })
const savedImageInfo = ref({
  element: null as HTMLImageElement | null,
  naturalWidth: 0,
  naturalHeight: 0,
  gridSize: 0,
  squareX: 0,
  squareY: 0,
});

// 网格行列数计算
const gridInfo = computed(() => {
  if (!savedImageInfo.value.gridSize) return { rows: 0, cols: 0 }

  const { naturalWidth, naturalHeight, gridSize } = savedImageInfo.value
  const cols = Math.ceil(naturalWidth / gridSize)
  const rows = Math.ceil(naturalHeight / gridSize)

  return { rows, cols }
})

// 计算正方形样式
const squareStyle = computed(() => ({
  left: `${square.value.x}px`,
  top: `${square.value.y}px`,
  width: `${square.value.size}px`,
  height: `${square.value.size}px`
}))

// 选择图片
const selectImage = () => {
  fileInput.value?.click()
}

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]

    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value)
    }

    imageUrl.value = URL.createObjectURL(file)
    imageLoaded.value = false
    gridDrawn.value = false
    squareSet.value = false
  }
}

// 图片加载完成
const onImageLoad = () => {
  if (imageRef.value && imageContainer.value) {
    imageSize.value.width = imageRef.value.naturalWidth
    imageSize.value.height = imageRef.value.naturalHeight
    imageLoaded.value = true
    squareSet.value = true

    // 等待图片渲染完成后设置正方形位置
    setTimeout(() => {
      if (imageRef.value && imageContainer.value) {
        const imgRect = imageRef.value.getBoundingClientRect()
        const containerRect = imageContainer.value.getBoundingClientRect()
        const imgOffsetX = imgRect.left - containerRect.left
        const imgOffsetY = imgRect.top - containerRect.top

        // 将正方形初始位置设置在图片内的左上角
        square.value = {
          x: imgOffsetX + 10,
          y: imgOffsetY + 10,
          size: Math.min(80, imageRef.value.clientWidth / 4, imageRef.value.clientHeight / 4)
        }
      }
    }, 10)
  }
}

// 开始拖拽正方形
const startDrag = (event: MouseEvent) => {
  if (isResizing.value) return

  event.preventDefault()
  event.stopPropagation()

  if (!imageContainer.value) return

  const containerRect = imageContainer.value.getBoundingClientRect()

  isDragging.value = true
  dragStart.value = {
    x: event.clientX - containerRect.left - square.value.x,
    y: event.clientY - containerRect.top - square.value.y
  }

  // 添加 user-select: none 到 body 来防止文本选择
  document.body.style.userSelect = 'none'
  document.body.style.webkitUserSelect = 'none'

  document.addEventListener('mousemove', onMouseMove, { passive: false })
  document.addEventListener('mouseup', onMouseUp)
}

// 开始调整大小
const startResize = (event: MouseEvent, handle: string) => {
  event.preventDefault()
  event.stopPropagation()

  isResizing.value = true
  resizeHandle.value = handle

  // 添加 user-select: none 到 body 来防止文本选择
  document.body.style.userSelect = 'none'
  document.body.style.webkitUserSelect = 'none'

  document.addEventListener('mousemove', onMouseMove, { passive: false })
  document.addEventListener('mouseup', onMouseUp)
}

// 鼠标移动处理
const onMouseMove = (event: MouseEvent) => {
  event.preventDefault()

  if (!imageContainer.value || !imageRef.value) return

  const rect = imageContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // 获取图片的实际显示尺寸
  const imgRect = imageRef.value.getBoundingClientRect()
  const containerRect = imageContainer.value.getBoundingClientRect()
  const imgWidth = imgRect.width
  const imgHeight = imgRect.height
  const imgOffsetX = imgRect.left - containerRect.left
  const imgOffsetY = imgRect.top - containerRect.top

  if (isDragging.value) {
    // 拖拽移动 - 直接跟随鼠标，限制在图片范围内
    const newX = x - dragStart.value.x
    const newY = y - dragStart.value.y

    square.value.x = Math.max(imgOffsetX, Math.min(newX, imgOffsetX + imgWidth - square.value.size))
    square.value.y = Math.max(imgOffsetY, Math.min(newY, imgOffsetY + imgHeight - square.value.size))
  } else if (isResizing.value) {
    // 调整大小 - 优化逻辑防止异常
    const handle = resizeHandle.value
    const minSize = 20
    const maxX = imgOffsetX + imgWidth
    const maxY = imgOffsetY + imgHeight

    const currentRight = square.value.x + square.value.size
    const currentBottom = square.value.y + square.value.size

    if (handle === 'top-left') {
      const newX = Math.max(imgOffsetX, Math.min(x, currentRight - minSize))
      const newY = Math.max(imgOffsetY, Math.min(y, currentBottom - minSize))
      const newSize = Math.min(currentRight - newX, currentBottom - newY)
      square.value.x = currentRight - newSize
      square.value.y = currentBottom - newSize
      square.value.size = newSize
    } else if (handle === 'top-right') {
      const newY = Math.max(imgOffsetY, Math.min(y, currentBottom - minSize))
      const newSize = Math.min(Math.max(minSize, x - square.value.x), maxX - square.value.x, currentBottom - newY)
      square.value.y = currentBottom - newSize
      square.value.size = newSize
    } else if (handle === 'bottom-left') {
      const newX = Math.max(imgOffsetX, Math.min(x, currentRight - minSize))
      const newSize = Math.min(Math.max(minSize, y - square.value.y), currentRight - newX, maxY - square.value.y)
      square.value.x = currentRight - newSize
      square.value.size = newSize
    } else if (handle === 'bottom-right') {
      const newSize = Math.max(minSize, Math.min(x - square.value.x, y - square.value.y, maxX - square.value.x, maxY - square.value.y))
      square.value.size = newSize
    }
  }
}

// 鼠标抬起
const onMouseUp = () => {
  isDragging.value = false
  isResizing.value = false
  resizeHandle.value = ''

  // 恢复文本选择
  document.body.style.userSelect = ''
  document.body.style.webkitUserSelect = ''

  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

// 开始分割
const startDivision = () => {
  if (!imageRef.value || !imageContainer.value) return;

  const imageElement = imageRef.value;
  const imgRect = imageElement.getBoundingClientRect();
  const containerRect = imageContainer.value.getBoundingClientRect();

  const scaleRatio = imageElement.naturalWidth / imgRect.width;

  const squareRelativeX = square.value.x - (imgRect.left - containerRect.left);
  const squareRelativeY = square.value.y - (imgRect.top - containerRect.top);

  const naturalGridSize = Math.round(square.value.size * scaleRatio);
  const naturalSquareX = Math.round(squareRelativeX * scaleRatio);
  const naturalSquareY = Math.round(squareRelativeY * scaleRatio);

  savedImageInfo.value = {
    element: imageElement,
    naturalWidth: imageElement.naturalWidth,
    naturalHeight: imageElement.naturalHeight,
    gridSize: naturalGridSize,
    squareX: naturalSquareX,
    squareY: naturalSquareY,
  };

  gridDrawn.value = true;

  setTimeout(() => {
    drawGrid();
  }, 10);
};

const drawGridLines = (ctx: CanvasRenderingContext2D) => {
  const { naturalWidth, naturalHeight, gridSize, squareX, squareY } = savedImageInfo.value;

  // 应用用户偏移量
  const offsetX = (squareX % gridSize) + userOffset.value.x;
  const offsetY = (squareY % gridSize) + userOffset.value.y;

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;

  for (let x = offsetX - gridSize; x < naturalWidth; x += gridSize) {
    if (x < 0) continue;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, naturalHeight);
    ctx.stroke();
  }
  for (let y = offsetY - gridSize; y < naturalHeight; y += gridSize) {
    if (y < 0) continue;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(naturalWidth, y);
    ctx.stroke();
  }
};

// 绘制网格
const drawGrid = () => {
  const { element, naturalWidth, naturalHeight, gridSize, squareX, squareY } = savedImageInfo.value;
  if (!canvasRef.value || !element) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = naturalWidth; // 稍微扩大画布以容纳偏移
  canvas.height = naturalHeight;
  // 在平移后的坐标系 (0,0) 点绘制图片，视觉上就有了偏移
  ctx.drawImage(element, 0, 0, naturalWidth, naturalHeight);

  // 调用辅助函数绘制网格线
  drawGridLines(ctx);

};

// 开始解析
const startParsing = async () => {
  if (!canvasRef.value) return;
  isLoading.value = true;
  try {
    await parseColors();
  } finally {
    isLoading.value = false;
  }
};

// 解析颜色
const parseColors = async () => {
  const { element, naturalWidth, naturalHeight, gridSize, squareX, squareY } = savedImageInfo.value;
  if (!canvasRef.value || !element) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 同样，扩大画布并平移坐标系
  canvas.width = naturalWidth;
  canvas.height = naturalHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布

  // 重新绘制图片
  ctx.drawImage(element, 0, 0, naturalWidth, naturalHeight);

  // [修改] 在解析时也调用辅助函数，保留网格线
  drawGridLines(ctx);

  // 应用用户偏移量
  const offsetX = (squareX % gridSize) + userOffset.value.x;
  const offsetY = (squareY % gridSize) + userOffset.value.y;

  ctx.font = `${Math.max(8, gridSize / 6)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let y = offsetY - gridSize; y < naturalHeight; y += gridSize) {
    for (let x = offsetX - gridSize; x < naturalWidth; x += gridSize) {
      const centerX = x + gridSize / 2;
      const centerY = y + gridSize / 2;

      if (centerX > 0 && centerX < naturalWidth && centerY > 0 && centerY < naturalHeight) {
        const imageData = ctx.getImageData(centerX, centerY, 1, 1);
        const [r, g, b] = imageData.data;
        const matchedColor = findClosestColor({ r, g, b });
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        ctx.fillStyle = brightness > 128 ? 'black' : 'white';
        ctx.fillText(matchedColor, centerX, centerY);
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  }
};


// 查找最接近的颜色
const findClosestColor = (color: { r: number; g: number; b: number }): string => {
  let minDistance = Infinity
  let closestColorName = ''

  for (const paletteColor of colorPalette) {
    const distance =
      Math.pow(color.r - paletteColor.r, 2) +
      Math.pow(color.g - paletteColor.g, 2) +
      Math.pow(color.b - paletteColor.b, 2)

    if (distance < minDistance) {
      minDistance = distance
      closestColorName = paletteColor.name
    }
  }

  return closestColorName
}

const reset = () => {
  gridDrawn.value = false;
  userOffset.value = { x: 0, y: 0 };
};

// 下载画布图片
const downloadCanvas = () => {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;
  const { rows, cols } = gridInfo.value;
  const fileName = `grid_${rows}x${cols}_${Date.now()}.png`;

  // 创建下载链接
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
};

// 调整偏移量
const adjustOffset = (deltaX: number, deltaY: number) => {
  userOffset.value.x += deltaX;
  userOffset.value.y += deltaY;

  // 重新绘制网格
  setTimeout(() => {
    drawGrid();
  }, 10);
};

// 重置偏移
const resetOffset = () => {
  userOffset.value = { x: 0, y: 0 };

  // 重新绘制网格
  setTimeout(() => {
    drawGrid();
  }, 10);
};

// 组件卸载时清理
onUnmounted(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value)
  }
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
})
</script>

<style lang="scss" scoped>
.grid-parser-container {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%);
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.controls .el-button {
  height: 32px;
  min-height: 32px;
}

.grid-info {
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  border: 2px solid #8B4513;
}

.grid-info span {
  font-size: 14px;
  font-weight: bold;
  color: #5D4037;
  display: block;
  margin-bottom: 8px;
}

.offset-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.offset-controls label {
  font-size: 13px;
  color: #5D4037;
  font-weight: 600;
  margin-right: 4px;
}

.offset-controls .el-button {
  height: 28px;
  min-height: 28px;
  padding: 4px 8px;
  font-size: 12px;
}

.image-container {
  position: relative;
  display: inline-block;
  border: 3px solid #8B4513;
  border-radius: 8px;
  background: #FAFAFA;
  max-width: 100%;
  overflow: hidden;
}

.source-image {
  display: block;
  max-width: 100%;
  height: auto;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: none;
}

.square-selector {
  position: absolute;
  border: 2px solid #ff0000;
  background: rgba(255, 0, 0, 0.1);
  cursor: move;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  transition: all 0.1s ease;
  box-shadow: 0 2px 8px rgba(255, 0, 0, 0.3);
}

.square-selector:hover {
  border-color: #ff4444;
  background: rgba(255, 0, 0, 0.15);
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.4);
}

.square-selector.dragging {
  border-color: #ff6666;
  background: rgba(255, 0, 0, 0.2);
  box-shadow: 0 6px 16px rgba(255, 0, 0, 0.5);
  transform: scale(1.02);
}

.square-selector.resizing {
  border-color: #ffaa00;
  background: rgba(255, 170, 0, 0.15);
  box-shadow: 0 4px 12px rgba(255, 170, 0, 0.4);
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #ff0000;
  border: 2px solid #fff;
  border-radius: 2px;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.resize-handle:hover {
  background: #ff4444;
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(255, 0, 0, 0.4);
}

.resize-handle.top-left {
  top: -5px;
  left: -5px;
  cursor: nw-resize;
}

.resize-handle.top-right {
  top: -5px;
  right: -5px;
  cursor: ne-resize;
}

.resize-handle.bottom-left {
  bottom: -5px;
  left: -5px;
  cursor: sw-resize;
}

.resize-handle.bottom-right {
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
}

.grid-canvas {
  display: block;
  max-width: 100%;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-overlay span {
  color: white;
  font-size: 18px;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .grid-parser-container {
    padding: 12px;
  }

  .controls {
    flex-direction: column;
  }

  .controls .el-button {
    width: 100%;
  }

  .grid-info {
    margin-bottom: 12px;
    padding: 10px;
  }

  .grid-info span {
    font-size: 13px;
    margin-bottom: 6px;
  }

  .offset-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  .offset-controls label {
    text-align: center;
    margin-bottom: 4px;
  }

  .offset-controls .el-button {
    width: 100%;
    height: 32px;
    min-height: 32px;
  }
}
</style>
