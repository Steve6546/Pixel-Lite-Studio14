import React, { useRef, useEffect, useState } from 'react';
import { ClearIcon, ErrorIcon, LoadingSpinner } from './icons';
import { PixelationSettings, FrameShape } from '../types';
import { ZoomControls } from './ZoomControls';

interface Dimensions {
    width: number;
    height: number;
}

interface ImageViewerProps {
  originalUrl: string | null;
  pixelatedUrl: string | null;
  isLoading: boolean;
  error: string | null;
  onClear: () => void;
  originalDimensions: Dimensions | null;
  pixelatedDimensions: Dimensions | null;
  settings: PixelationSettings;
  onSettingsChange: (newSettings: Partial<PixelationSettings>) => void;
  resultZoom: number;
  onResultZoomChange: (zoom: number) => void;
}

// Creates a path for the shape on the current context.
// Does NOT call beginPath() or closePath(). Assumes a clockwise winding order.
const createShapePath = (ctx: CanvasRenderingContext2D, shape: FrameShape, width: number, height: number) => {
    switch (shape) {
        case 'circle':
            ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
            break;
        case 'square':
            const size = Math.min(width, height);
            const x = (width - size) / 2;
            const y = (height - size) / 2;
            ctx.rect(x, y, size, size);
            break;
        case 'heart':
            const w = width, h = height;
            ctx.moveTo(w / 2, h * 0.35);
            ctx.bezierCurveTo(w * 0.7, h * 0.1, w, h * 0.5, w / 2, h);
            ctx.bezierCurveTo(0, h * 0.5, w * 0.3, h * 0.1, w / 2, h * 0.35);
            break;
        case 'star':
            const outerRadius = Math.min(width, height) / 2;
            const innerRadius = outerRadius / 2.5;
            const cx = width / 2;
            const cy = height / 2;
            const points = 5;
            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < 2 * points; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (Math.PI / points) * i - Math.PI / 2;
                const px = cx + radius * Math.cos(angle);
                const py = cy + radius * Math.sin(angle);
                ctx.lineTo(px, py);
            }
            break;
    }
};


interface ImagePanelProps {
    title: string;
    children: React.ReactNode;
    showClear?: boolean;
    onClear?: () => void;
    dimensions: Dimensions | null;
    isPixelated?: boolean;
    className?: string;
}

const ImagePanel: React.FC<ImagePanelProps> = ({ title, children, showClear, onClear, dimensions, isPixelated = false, className }) => (
    <div className={`bg-gray-800/50 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-700/50 shadow-lg w-full ${className}`}>
        <div className="w-full flex justify-between items-start mb-4">
            <div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                {dimensions && (
                    <p className="text-xs text-gray-400 mt-1">
                        {dimensions.width} &times; {dimensions.height} {isPixelated ? 'pixels' : 'px'}
                    </p>
                )}
            </div>
            {showClear && onClear && (
                <button onClick={onClear} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full bg-gray-700/50 hover:bg-gray-600 flex-shrink-0 z-10">
                    <ClearIcon className="w-5 h-5" />
                </button>
            )}
        </div>
        <div className="w-full aspect-square flex items-center justify-center bg-black/20 rounded-lg overflow-hidden relative">
            {children}
        </div>
    </div>
);

export const ImageViewer: React.FC<ImageViewerProps> = ({ originalUrl, pixelatedUrl, isLoading, error, onClear, originalDimensions, pixelatedDimensions, settings, onSettingsChange, resultZoom, onResultZoomChange }) => {
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const interactionState = useRef({ isDragging: false, lastX: 0, lastY: 0 }).current;

  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const drawOverlay = () => {
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);

        if (settings.frameShape === 'rectangle') {
            return; // No overlay needed for rectangle
        }
        
        const { x, y, scale } = settings.shapeTransform;
        
        // The base size of the shape is the smaller dimension of the container.
        // The scale modifies this base size.
        const baseSize = Math.min(width, height);
        const shapeSize = baseSize * scale;

        // Position of the shape's top-left corner
        const shapeX = x * width - shapeSize / 2;
        const shapeY = y * height - shapeSize / 2;

        // Draw overlay using evenodd fill rule to create a "hole".
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        
        ctx.save();
        ctx.translate(shapeX, shapeY);
        createShapePath(ctx, settings.frameShape, shapeSize, shapeSize);
        ctx.restore();
        
        ctx.fill("evenodd");
        ctx.restore();


        // Draw dashed outline of the shape
        ctx.save();
        ctx.translate(shapeX, shapeY);
        ctx.beginPath();
        createShapePath(ctx, settings.frameShape, shapeSize, shapeSize);
        ctx.closePath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.restore();
    };

    const resizeObserver = new ResizeObserver(drawOverlay);
    resizeObserver.observe(image);
    
    if (image.complete) {
      drawOverlay();
    } else {
      image.onload = drawOverlay;
    }

    return () => {
        resizeObserver.disconnect();
    };

  }, [settings.frameShape, settings.shapeTransform, originalUrl]);

  const handleInteractionStart = (clientX: number, clientY: number) => {
    if (settings.frameShape === 'rectangle') return;
    interactionState.isDragging = true;
    interactionState.lastX = clientX;
    interactionState.lastY = clientY;
  };

  const handleInteractionMove = (clientX: number, clientY: number) => {
    if (!interactionState.isDragging || !overlayCanvasRef.current) return;
    const canvas = overlayCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const dx = (clientX - interactionState.lastX) / rect.width;
    const dy = (clientY - interactionState.lastY) / rect.height;

    interactionState.lastX = clientX;
    interactionState.lastY = clientY;
    
    onSettingsChange({
      shapeTransform: {
        ...settings.shapeTransform,
        x: Math.max(0, Math.min(1, settings.shapeTransform.x + dx)),
        y: Math.max(0, Math.min(1, settings.shapeTransform.y + dy)),
      }
    });
  };

  const handleInteractionEnd = () => {
    interactionState.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (settings.frameShape === 'rectangle') return;
    e.preventDefault();
    const scaleAmount = e.deltaY * -0.001;
    onSettingsChange({
      shapeTransform: {
        ...settings.shapeTransform,
        scale: Math.max(0.1, Math.min(3, settings.shapeTransform.scale + scaleAmount)),
      }
    });
  };
  
  const handleShapeZoom = (direction: 'in' | 'out') => {
    const scaleAmount = direction === 'in' ? 0.1 : -0.1;
    onSettingsChange({
      shapeTransform: {
        ...settings.shapeTransform,
        scale: Math.max(0.1, Math.min(3, settings.shapeTransform.scale + scaleAmount)),
      }
    });
  };

  const handleResultZoom = (direction: 'in' | 'out') => {
    let newZoom = resultZoom;
    if (direction === 'in') {
        newZoom = resultZoom < 1 ? 1 : resultZoom + 1;
    } else { // 'out'
        newZoom = resultZoom <= 1 ? 0.5 : resultZoom - 1;
    }
    // Clamp the zoom level
    onResultZoomChange(Math.max(0.5, Math.min(10, newZoom)));
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        <ImagePanel title="Original" showClear={true} onClear={onClear} dimensions={originalDimensions}>
            {originalUrl && (
                <>
                    <img ref={imageRef} src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain" />
                    <canvas 
                        ref={overlayCanvasRef}
                        className="absolute top-0 left-0 w-full h-full cursor-move"
                        onMouseDown={(e) => handleInteractionStart(e.clientX, e.clientY)}
                        onMouseMove={(e) => handleInteractionMove(e.clientX, e.clientY)}
                        onMouseUp={handleInteractionEnd}
                        onMouseLeave={handleInteractionEnd}
                        onTouchStart={(e) => handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY)}
                        onTouchMove={(e) => handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY)}
                        onTouchEnd={handleInteractionEnd}
                        onWheel={handleWheel}
                    />
                    {settings.frameShape !== 'rectangle' && (
                        <ZoomControls onZoom={handleShapeZoom} />
                    )}
                </>
            )}
        </ImagePanel>

        <ImagePanel title="Pixel Art" dimensions={pixelatedDimensions} isPixelated={true}>
            {isLoading && (
                <div className="flex flex-col items-center text-gray-400">
                    <LoadingSpinner className="w-12 h-12" />
                    <p className="mt-4 text-lg">Pixelating...</p>
                </div>
            )}
            {error && !isLoading && (
                 <div className="flex flex-col items-center text-red-400 p-4 text-center">
                    <ErrorIcon className="w-12 h-12" />
                    <p className="mt-4 font-semibold">Processing Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}
            {!isLoading && !error && pixelatedUrl && (
                <>
                    <img 
                        src={pixelatedUrl} 
                        alt="Pixelated" 
                        className="max-w-full max-h-full object-contain transition-transform duration-200 ease-in-out" 
                        style={{ 
                            imageRendering: 'pixelated',
                            transform: `scale(${resultZoom})` 
                        }} 
                    />
                    <ZoomControls onZoom={handleResultZoom} />
                    {resultZoom !== 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md pointer-events-none">
                            {resultZoom}x Zoom
                        </div>
                    )}
                </>
            )}
            {!isLoading && !error && !pixelatedUrl && (
                 <div className="text-center text-gray-500">
                    <p>Result will appear here</p>
                </div>
            )}
        </ImagePanel>
    </div>
  );
};