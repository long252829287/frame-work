self.onmessage = (event: MessageEvent) => {
  const { imageData, cellSize } = event.data
  const { data, width, height } = imageData

  const pixelatedColors: { r: number; g: number; b: number; a: number }[] = []

  const slicesX = Math.ceil(width / cellSize)
  const slicesY = Math.ceil(height / cellSize)
  const totalSlices = slicesX * slicesY
  let processedSlices = 0

  let lastSentPercentage = -1

  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0; x < width; x += cellSize) {
      let r = 0, g = 0, b = 0, a = 0
      let pixelCount = 0

      for (let blockY = y; blockY < y + cellSize && blockY < height; blockY++) {
        for (let blockX = x; blockX < x + cellSize && blockX < width; blockX++) {
          const index = (blockY * width + blockX) * 4
          r += data[index]
          g += data[index + 1]
          b += data[index + 2]
          a += data[index + 3]
          pixelCount++
        }
      }

      const avgR = r / pixelCount
      const avgG = g / pixelCount
      const avgB = b / pixelCount
      const avgA = a / pixelCount

      pixelatedColors.push({ r: avgR, g: avgG, b: avgB, a: avgA })
      processedSlices++

      const currentPercentage = Math.round((processedSlices / totalSlices) * 100)

      if (currentPercentage > lastSentPercentage) {
        lastSentPercentage = currentPercentage
        self.postMessage({
          type: 'progress',
          percentage: currentPercentage,
        })
      }
    }
  }

  // 将最终的计算结果发送回主线程
  self.postMessage({
    type: 'complete',
    data: pixelatedColors,
  })
}
