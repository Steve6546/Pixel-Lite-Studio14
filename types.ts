
export interface PixelationSettings {
  pixelSize: number;
  colorCount: number;
  dithering: boolean;
  showGrid: boolean;
  showPixelNumbers: boolean;
}

export interface PixelationOptions extends PixelationSettings {
  image: HTMLImageElement;
}
