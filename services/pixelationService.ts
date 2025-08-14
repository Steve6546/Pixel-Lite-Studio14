
import { PixelationOptions, Color } from '../types';

const findClosestColor = (color: Color, palette: Color[]): Color => {
  let closestColor = palette[0];
  let minDistance = Infinity;
  for (const pColor of palette) {
    const distance = Math.sqrt(
      Math.pow(color.r - pColor.r, 2) + Math.pow(color.g - pColor.g, 2) + Math.pow(color.b - pColor.b, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = pColor;
    }
  }
  return closestColor;
};


const generatePalette = (imageData: ImageData, colorCount: number): Color[] => {
    const colorSet = new Set<string>();
    for (let i = 0; i < imageData.data.length; i += 4) {
      colorSet.add(`${imageData.data[i]},${imageData.data[i+1]},${imageData.data[i+2]}`);
    }
    
    let colors: (Color & { l: number })[] = Array.from(colorSet).map(cStr => {
        const [r, g, b] = cStr.split(',').map(Number);
        return { r, g, b, l: 0.2126 * r + 0.7152 * g + 0.0722 * b };
    });

    if (colors.length <= colorCount) {
        return colors.map(({r,g,b}) => ({r,g,b}));
    }

    // Simplified palette reduction: sort by luminance and pick evenly spaced colors
    colors.sort((a, b) => a.l - b.l);
    const step = Math.floor(colors.length / colorCount);
    const palette = Array.from({ length: colorCount }, (_, i) => colors[i * step]);

    return palette.map(({r,g,b}) => ({r,g,b}));
};


export const pixelateImage = async (options: PixelationOptions): Promise<{ dataUrl: string; width: number; height: number; }> => {
  return new Promise((resolve, reject) => {
    const { image, pixelSize, colorCount, dithering, showGrid, showPixelNumbers, customPalette } = options;

    const smallWidth = Math.max(1, Math.floor(image.width / pixelSize));
    const smallHeight = Math.max(1, Math.floor(image.height / pixelSize));

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = smallWidth;
    tempCanvas.height = smallHeight;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

    if (!tempCtx) {
      return reject(new Error('Could not create canvas context.'));
    }

    tempCtx.drawImage(image, 0, 0, smallWidth, smallHeight);

    const smallImageData = tempCtx.getImageData(0, 0, smallWidth, smallHeight);
    const palette = customPalette || generatePalette(smallImageData, colorCount);

    const data = smallImageData.data;
    const dataCopy = new Float32Array(data.length);
    for(let i=0; i < data.length; i++) {
        dataCopy[i] = data[i];
    }

    for (let y = 0; y < smallHeight; y++) {
      for (let x = 0; x < smallWidth; x++) {
        const i = (y * smallWidth + x) * 4;
        const oldColor = { r: dataCopy[i], g: dataCopy[i + 1], b: dataCopy[i + 2] };
        const newColor = findClosestColor(oldColor, palette);

        data[i] = newColor.r;
        data[i + 1] = newColor.g;
        data[i + 2] = newColor.b;

        if (dithering) {
          const errR = oldColor.r - newColor.r;
          const errG = oldColor.g - newColor.g;
          const errB = oldColor.b - newColor.b;

          const ditherPixel = (dx: number, dy: number, factor: number) => {
            if (x + dx >= 0 && x + dx < smallWidth && y + dy >= 0 && y + dy < smallHeight) {
                const i2 = ((y + dy) * smallWidth + (x + dx)) * 4;
                dataCopy[i2]     += errR * factor;
                dataCopy[i2 + 1] += errG * factor;
                dataCopy[i2 + 2] += errB * factor;
            }
          };
          
          ditherPixel(1, 0, 7 / 16);
          ditherPixel(-1, 1, 3 / 16);
          ditherPixel(0, 1, 5 / 16);
          ditherPixel(1, 1, 1 / 16);
        }
      }
    }

    tempCtx.putImageData(smallImageData, 0, 0);

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = image.width;
    outputCanvas.height = image.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) {
      return reject(new Error('Could not create output canvas context.'));
    }
    
    outputCtx.imageSmoothingEnabled = false;
    outputCtx.drawImage(tempCanvas, 0, 0, image.width, image.height);

    if (showGrid && pixelSize > 2) {
      outputCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      outputCtx.lineWidth = 1;

      const scaledPixelWidth = image.width / smallWidth;
      const scaledPixelHeight = image.height / smallHeight;

      // Vertical lines
      for (let i = 1; i < smallWidth; i++) {
        const x = Math.round(i * scaledPixelWidth);
        outputCtx.beginPath();
        outputCtx.moveTo(x - 0.5, 0);
        outputCtx.lineTo(x - 0.5, image.height);
        outputCtx.stroke();
      }

      // Horizontal lines
      for (let i = 1; i < smallHeight; i++) {
        const y = Math.round(i * scaledPixelHeight);
        outputCtx.beginPath();
        outputCtx.moveTo(0, y - 0.5);
        outputCtx.lineTo(image.width, y - 0.5);
        outputCtx.stroke();
      }
    }

    if (showPixelNumbers && pixelSize >= 24) {
      const scaledPixelWidth = image.width / smallWidth;
      const scaledPixelHeight = image.height / smallHeight;

      outputCtx.font = "8px monospace";
      outputCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
      outputCtx.textAlign = 'center';
      outputCtx.textBaseline = 'middle';

      for (let y = 0; y < smallHeight; y++) {
        for (let x = 0; x < smallWidth; x++) {
          const centerX = (x + 0.5) * scaledPixelWidth;
          const centerY = (y + 0.5) * scaledPixelHeight;
          outputCtx.fillText(`${x},${y}`, centerX, centerY);
        }
      }
    }

    resolve({
      dataUrl: outputCanvas.toDataURL('image/png'),
      width: smallWidth,
      height: smallHeight,
    });
  });
};
