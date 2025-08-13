import React from 'react';
import { PixelationSettings } from '../types';
import { Slider } from './Slider';
import { Toggle } from './Toggle';
import { Button } from './Button';
import { DownloadIcon } from './icons';

interface ControlsPanelProps {
  settings: PixelationSettings;
  onSettingsChange: (newSettings: PixelationSettings) => void;
  onDownload: () => void;
  isProcessing: boolean;
  hasResult: boolean;
  hasImage: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings,
  onSettingsChange,
  onDownload,
  isProcessing,
  hasResult,
  hasImage,
}) => {
  const handleSettingChange = <K extends keyof PixelationSettings,>(
    key: K,
    value: PixelationSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white border-b border-gray-600 pb-2">Controls</h2>
      <fieldset disabled={!hasImage || isProcessing} className="space-y-6 disabled:opacity-50 transition-opacity">
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
          max={64}
          step={1}
          value={settings.colorCount}
          onChange={(e) => handleSettingChange('colorCount', e.target.valueAsNumber)}
          unit="colors"
        />
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