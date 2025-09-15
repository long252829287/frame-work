// self 在 worker 中代表 worker 的全局作用域
self.onmessage = (event: MessageEvent) => {
  const { imageData, cellSize } = event.data;
  const { data, width, height } = imageData;

  // 结果数组，存储每个格子的平均颜色
  const pixelatedColors: { r: number; g: number; b: number; a: number }[] = [];
  const slicesX = Math.ceil(width / cellSize);
  const slicesY = Math.ceil(height / cellSize);
  const totalSlices = slicesX * slicesY;
  let processedSlices = 0;

  // 按 cellSize 步长遍历图片
  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0; x < width; x += cellSize) {
      let r = 0, g = 0, b = 0, a = 0;
      let pixelCount = 0;

      // 遍历当前方格内的所有像素
      for (let blockY = y; blockY < y + cellSize && blockY < height; blockY++) {
        for (let blockX = x; blockX < x + cellSize && blockX < width; blockX++) {
          const index = (blockY * width + blockX) * 4;
          r += data[index];
          g += data[index + 1];
          b += data[index + 2];
          a += data[index + 3];
          pixelCount++;
        }
      }

      // 计算平均颜色
      const avgR = r / pixelCount;
      const avgG = g / pixelCount;
      const avgB = b / pixelCount;
      const avgA = a / pixelCount;

      pixelatedColors.push({ r: avgR, g: avgG, b: avgB, a: avgA });
      processedSlices ++
      self.postMessage({
        type: 'progress',
        current: processedSlices,
        total: totalSlices
      })
    }
  }

  // 将计算结果发送回主线程
  self.postMessage({
    type: 'complete',
    data: pixelatedColors
  });
};