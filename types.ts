export interface Color {
  r: number;
  g: number;
  b: number;
}

export type FrameShape = 'rectangle' | 'circle' | 'square' | 'heart' | 'star';

export interface ShapeTransform {
  x: number; // Center X (0-1)
  y: number; // Center Y (0-1)
  scale: number; // Zoom level (1 = full view)
}

export interface PixelationSettings {
  pixelSize: number;
  colorCount: number;
  dithering: boolean;
  showGrid: boolean;
  showPixelNumbers: boolean;
  useAiPalette: boolean;
  frameShape: FrameShape;
  shapeTransform: ShapeTransform;
}

export interface PixelationOptions extends Omit<PixelationSettings, 'useAiPalette' | 'shapeTransform'> {
  image: HTMLImageElement;
  customPalette?: Color[] | null;
  frameShape: FrameShape;
  shapeTransform: ShapeTransform;
}
