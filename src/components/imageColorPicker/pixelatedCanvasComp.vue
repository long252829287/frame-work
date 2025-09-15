<template>
  <div class="pixelated-canvas-container">
    <div class="controls">
      <label for="cellSize">格子边长: {{ cellSize }}px</label>
      <input type="range" id="cellSize" min="5" max="100" step="1" v-model.number="cellSize"
        @input="debouncedProcessImage" />

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
import { ref, watch, onMounted } from 'vue';
import Color from 'color';
import colorData from '@/json/oshshabi.json';
type PaletteColor = {
  name: string;
  r: number;
  g: number;
  b: number;
};

const colorMap = new Map<string, string | string[]>(Object.entries(colorData));
const mardPalette: PaletteColor[] = [];
for (const [name, hexArray] of colorMap.entries()) {
  const originalHex = hexArray[0];
  const colorInstance = Color(originalHex);
  mardPalette.push({
    name: name,
    r: colorInstance.red(),
    g: colorInstance.green(),
    b: colorInstance.blue()
  });
}

const colorMatchCache = new Map<string, string>();
// 定义 props
const props = defineProps<{
  imageUrl: string;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const cellSize = ref(20);
const isLoading = ref(false);
const colorFormat = ref<'rgb' | 'hex' | 'hsl'>('hex');
const progress = ref(0);

let pixelatedColorData: { r: number; g: number; b: number; a: number }[] = [];
let imageWidth = 0;
let imageHeight = 0;
let isAnalyzed = ref(false);


function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;

  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
// 主处理函数
const processImage = () => {
  const margin = 30;
  if (!props.imageUrl || !canvasRef.value) return;
  isLoading.value = true;
  isAnalyzed.value = false;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    isLoading.value = false;
    return;
  }

  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = props.imageUrl;

  img.onload = () => {
    imageWidth = img.width;
    imageHeight = img.height;
    canvas.width = imageWidth + margin;
    canvas.height = imageHeight + margin;

    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');
    if (!offscreenCtx) return;
    offscreenCanvas.width = imageWidth;
    offscreenCanvas.height = imageHeight;
    offscreenCtx.drawImage(img, 0, 0);
    const imageData = offscreenCtx.getImageData(0, 0, imageWidth, imageHeight);

    const worker = new Worker(new URL('../../workers/pixelate.worker.ts', import.meta.url), { type: 'module' });

    worker.postMessage({ imageData, cellSize: cellSize.value });

    worker.onmessage = (event) => {
      const { type, current, total, data } = event.data;
      if (type === 'progress') {
        progress.value = Math.floor(current / total) * 100;
        console.log('导入进度：', `${progress.value}%`)
      } else if (type === 'complete') {
        pixelatedColorData = data;
        drawPixelatedImage(pixelatedColorData);
        isLoading.value = false;
        worker.terminate();
      }
    };

    img.onerror = () => {
      console.error("图片加载失败");
      isLoading.value = false;
    }
  };
};

const debouncedProcessImage = debounce(processImage, 300); // 延迟300毫秒
// 绘制函数
const drawPixelatedImage = (colors: { r: number; g: number; b: number; a: number }[], showText: boolean = false) => {
  const margin = 30;
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let colorIndex = 0;

  ctx.fillStyle = '#666';
  ctx.font = '10px Arial';

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let y = 0; y < imageHeight; y += cellSize.value) {
    const label = (y / cellSize.value) + 1;
    const textY = y + margin + (cellSize.value / 2);
    ctx.fillText(label.toString(), margin / 2, textY);
  }

  for (let x = 0; x < imageWidth; x += cellSize.value) {
    const label = (x / cellSize.value) + 1;
    const textX = x + margin + (cellSize.value / 2);
    ctx.fillText(label.toString(), textX, margin / 2);
  }
  
  for (let y = 0; y < imageHeight; y += cellSize.value) {
    for (let x = 0; x < imageWidth; x += cellSize.value) {
      if (colorIndex < colors.length) {
        const color = colors[colorIndex];

        const drawX = x + margin;
        const drawY = y + margin;
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
        ctx.fillRect(drawX, drawY, cellSize.value, cellSize.value);

        if (showText) {
          drawColorText(ctx, drawX, drawY, color);
        }
        colorIndex++;
      }
    }
  }
};

watch(() => props.imageUrl, processImage, { immediate: true });

onMounted(processImage);

const analyzeColors = () => {
  if (pixelatedColorData.length > 0) {
    isAnalyzed.value = true;
    drawPixelatedImage(pixelatedColorData, true);
  }
};

const drawColorText = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: { r: number; g: number; b: number; }
) => {
  let displayText = ''; // 最终要显示的文字

  const cacheKey = `${color.r},${color.g},${color.b}`;

  // 如果缓存中已有结果，直接使用
  if (colorMatchCache.has(cacheKey)) {
    displayText = colorMatchCache.get(cacheKey)!;
  } else {
    // 如果没有缓存，则开始计算
    let minDistance = Infinity;
    let closestMatchName = '';

    for (const paletteColor of mardPalette) {
      const distance =
        Math.pow(color.r - paletteColor.r, 2) +
        Math.pow(color.g - paletteColor.g, 2) +
        Math.pow(color.b - paletteColor.b, 2);

      // 如果找到了一个更近的颜色，就更新记录
      if (distance < minDistance) {
        minDistance = distance;
        closestMatchName = paletteColor.name;
      }
    }

    displayText = closestMatchName;
    // 将计算结果存入缓存
    colorMatchCache.set(cacheKey, displayText);
  }

  const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
  ctx.fillStyle = brightness > 128 ? 'black' : 'white';

  const fontSize = Math.max(8, Math.min(12, cellSize.value / 3));
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillText(displayText, x + cellSize.value / 2, y + cellSize.value / 2);
};

watch(colorFormat, () => {
  if (isAnalyzed.value) {
    drawPixelatedImage(pixelatedColorData, true);
  }
});

</script>

<style scoped>
.pixelated-canvas-container {
  margin-top: 20px;
}

.controls {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
}

canvas {
  max-width: 100%;
  border: 1px solid #ddd;
}

.loading-indicator {
  padding: 20px;
  background-color: #f0f0f0;
  text-align: center;
}
</style>