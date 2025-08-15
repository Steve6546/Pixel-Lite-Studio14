import React from 'react';
import { PlusIcon, MinusIcon } from './icons';

interface ZoomControlsProps {
  onZoom: (direction: 'in' | 'out') => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ onZoom }) => {
  return (
    <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col gap-2 z-20">
      <button 
        onClick={() => onZoom('in')}
        className="bg-gray-900/50 hover:bg-gray-900/80 text-white rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
        aria-label="Zoom in shape"
      >
        <PlusIcon className="w-5 h-5" />
      </button>
      <button 
        onClick={() => onZoom('out')}
        className="bg-gray-900/50 hover:bg-gray-900/80 text-white rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
        aria-label="Zoom out shape"
      >
        <MinusIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
