import React from 'react';
import { PixelationSettings, FrameShape } from '../types';
import { Slider } from './Slider';
import { Toggle } from './Toggle';
import { Button } from './Button';
import { DownloadIcon, SparklesIcon, LoadingSpinner } from './icons';

interface ControlsPanelProps {
  settings: PixelationSettings;
  onSettingsChange: <K extends keyof PixelationSettings>(
    key: K,
    value: PixelationSettings[K]
  ) => void;
  onResetShapeTransform: () => void;
  onDownload: () => void;
  isProcessing: boolean;
  hasResult: boolean;
  hasImage: boolean;
  palettePrompt: string;
  onPalettePromptChange: (prompt: string) => void;
  onGeneratePalette: () => void;
  isGeneratingPalette: boolean;
  aiPalette: string[] | null;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings,
  onSettingsChange,
  onResetShapeTransform,
  onDownload,
  isProcessing,
  hasResult,
  hasImage,
  palettePrompt,
  onPalettePromptChange,
  onGeneratePalette,
  isGeneratingPalette,
  aiPalette,
}) => {
  const handleSettingChange = <K extends keyof PixelationSettings,>(
    key: K,
    value: PixelationSettings[K]
  ) => {
    onSettingsChange(key, value);
  };

  const isUiDisabled = !hasImage || isProcessing;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white border-b border-gray-600 pb-2">Controls</h2>
      <fieldset disabled={isUiDisabled} className="space-y-6 disabled:opacity-50 transition-opacity">
        <Slider
          label="Pixel Size"
          min={2}
          max={48}
          step={1}
          value={settings.pixelSize}
          onChange={(e) => handleSettingChange('pixelSize', e.target.valueAsNumber)}
          unit="px"
        />
        <Slider
          label="Color Palette"
          min={2}
          max={32}
          step={1}
          value={settings.colorCount}
          onChange={(e) => handleSettingChange('colorCount', e.target.valueAsNumber)}
          unit={settings.useAiPalette ? "AI colors" : "colors"}
        />

        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label htmlFor="frame-shape" className="text-sm font-medium text-gray-300">Frame Shape</label>
                {settings.frameShape !== 'rectangle' && (
                    <button onClick={onResetShapeTransform} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                        Reset
                    </button>
                )}
            </div>
            <select
                id="frame-shape"
                value={settings.frameShape}
                onChange={(e) => handleSettingChange('frameShape', e.target.value as FrameShape)}
                className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
                <option value="rectangle">Rectangle</option>
                <option value="square">Square</option>
                <option value="circle">Circle</option>
                <option value="heart">Heart</option>
                <option value="star">Star</option>
            </select>
        </div>

        <Toggle
          label="AI Palette"
          enabled={settings.useAiPalette}
          onChange={(enabled) => handleSettingChange('useAiPalette', enabled)}
        />
        {settings.useAiPalette && (
            <div className="pl-4 ml-1 border-l-2 border-indigo-500/30 space-y-4 transition-all duration-300">
                <div>
                    <label htmlFor="ai-prompt" className="text-sm font-medium text-gray-300">Palette Prompt</label>
                    <textarea 
                        id="ai-prompt"
                        value={palettePrompt}
                        onChange={(e) => onPalettePromptChange(e.target.value)}
                        rows={2}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-70"
                        placeholder="e.g. vaporwave, sunset"
                    />
                </div>

                {aiPalette && aiPalette.length > 0 && !isGeneratingPalette && (
                    <div>
                        <p className="text-sm font-medium text-gray-300 mb-2">Generated Palette</p>
                        <div className="flex flex-wrap gap-2">
                            {aiPalette.map((color) => (
                                <div key={color} className="w-6 h-6 rounded-full border-2 border-gray-500" style={{ backgroundColor: color }} title={color} />
                            ))}
                        </div>
                    </div>
                )}
                
                <Button onClick={onGeneratePalette} disabled={isGeneratingPalette || !palettePrompt.trim()}>
                  {isGeneratingPalette ? 
                    <> <LoadingSpinner className="w-5 h-5 mr-2" /> Generating... </> :
                    <> <SparklesIcon className="w-5 h-5 mr-2" /> {aiPalette ? 'Regenerate' : 'Generate'} Palette </>
                  }
                </Button>
            </div>
        )}


        <Toggle
          label="Dithering"
          enabled={settings.dithering}
          onChange={(enabled) => handleSettingChange('dithering', enabled)}
        />
        <Toggle
          label="Pixel Grid"
          enabled={settings.showGrid}
          onChange={(enabled) => handleSettingChange('showGrid', enabled)}
        />
        <div>
            <Toggle
              label="Pixel Numbers"
              enabled={settings.showPixelNumbers}
              onChange={(enabled) => handleSettingChange('showPixelNumbers', enabled)}
            />
            {settings.pixelSize < 24 && settings.showPixelNumbers && (
                <p className="text-xs text-gray-400 text-right pt-1">
                    Visible for Pixel Size ≥ 24px
                </p>
            )}
        </div>
      </fieldset>
      
      <div className="pt-4 border-t border-gray-600">
        <Button
          onClick={onDownload}
          disabled={!hasResult || isProcessing}
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          {isProcessing ? 'Processing...' : 'Download PNG'}
        </Button>
      </div>
    </div>
  );
};
