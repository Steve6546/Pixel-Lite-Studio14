
export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface PixelationSettings {
  pixelSize: number;
  colorCount: number;
  dithering: boolean;
  showGrid: boolean;
  showPixelNumbers: boolean;
  useAiPalette: boolean;
}

export interface PixelationOptions extends Omit<PixelationSettings, 'useAiPalette'> {
  image: HTMLImageElement;
  customPalette?: Color[] | null;
}
