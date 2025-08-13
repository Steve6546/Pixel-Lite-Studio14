
import React from 'react';
import { ClearIcon, ErrorIcon, LoadingSpinner } from './icons';

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
}

interface ImagePanelProps {
    title: string;
    children: React.ReactNode;
    showClear?: boolean;
    onClear?: () => void;
    dimensions: Dimensions | null;
    isPixelated?: boolean;
}

const ImagePanel: React.FC<ImagePanelProps> = ({ title, children, showClear, onClear, dimensions, isPixelated = false }) => (
    <div className="bg-gray-800/50 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-700/50 shadow-lg w-full">
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
                <button onClick={onClear} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full bg-gray-700/50 hover:bg-gray-600 flex-shrink-0">
                    <ClearIcon className="w-5 h-5" />
                </button>
            )}
        </div>
        <div className="w-full aspect-square flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
            {children}
        </div>
    </div>
);

export const ImageViewer: React.FC<ImageViewerProps> = ({ originalUrl, pixelatedUrl, isLoading, error, onClear, originalDimensions, pixelatedDimensions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        <ImagePanel title="Original" showClear={true} onClear={onClear} dimensions={originalDimensions}>
            {originalUrl && <img src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain" />}
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
                <img src={pixelatedUrl} alt="Pixelated" className="max-w-full max-h-full object-contain" style={{ imageRendering: 'pixelated' }} />
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
