
import React, { useState, useEffect, useCallback } from 'react';
import { ControlsPanel } from './components/ControlsPanel';
import { ImageUploader } from './components/ImageUploader';
import { ImageViewer } from './components/ImageViewer';
import { pixelateImage } from './services/pixelationService';
import { PixelationSettings } from './types';
import { GithubIcon } from './components/icons';

interface Dimensions {
  width: number;
  height: number;
}

const App: React.FC = () => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [pixelatedImageUrl, setPixelatedImageUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<PixelationSettings>({
    pixelSize: 12,
    colorCount: 16,
    dithering: true,
    showGrid: false,
    showPixelNumbers: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<Dimensions | null>(null);
  const [pixelatedDimensions, setPixelatedDimensions] = useState<Dimensions | null>(null);


  const handleImageUpload = (file: File) => {
    setError(null);
    setPixelatedImageUrl(null);
    setOriginalImageFile(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setOriginalDimensions(null);
    setPixelatedDimensions(null);
  };

  const processImage = useCallback(async () => {
    if (!originalImageFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const image = new Image();
      image.src = URL.createObjectURL(originalImageFile);
      await new Promise((resolve, reject) => {
        image.onload = () => {
            setOriginalDimensions({ width: image.width, height: image.height });
            resolve(true);
        };
        image.onerror = (err) => reject(new Error('Failed to load image.'));
      });
      
      const { dataUrl, width, height } = await pixelateImage({
        image,
        ...settings,
      });
      setPixelatedImageUrl(dataUrl);
      setPixelatedDimensions({ width, height });
    } catch (e) {
      console.error(e);
      setError('An error occurred during pixelation. Please try a different image or settings.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImageFile, settings]);

  useEffect(() => {
    const process = async () => {
      await processImage();
    };
    process();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalImageFile, settings]);

  const handleDownload = () => {
    if (!pixelatedImageUrl) return;
    const link = document.createElement('a');
    link.href = pixelatedImageUrl;
    const originalName = originalImageFile?.name.split('.')[0] || 'pixelated';
    link.download = `${originalName}-pixelated.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col p-4 sm:p-6 lg:p-8 font-sans">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>
          Pixel Lite Studio
        </h1>
        <a href="https://github.com/google/genai-frontend-react" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
          <GithubIcon className="w-7 h-7" />
        </a>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 bg-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-700/50 h-fit">
          <ControlsPanel 
            settings={settings} 
            onSettingsChange={setSettings}
            onDownload={handleDownload}
            isProcessing={isLoading}
            hasResult={!!pixelatedImageUrl}
            hasImage={!!originalImageFile}
          />
        </aside>

        <section className="lg:col-span-9 flex flex-col gap-8">
          {!originalImageFile ? (
            <ImageUploader onImageUpload={handleImageUpload} />
          ) : (
            <ImageViewer 
              originalUrl={originalImageUrl}
              pixelatedUrl={pixelatedImageUrl}
              isLoading={isLoading}
              error={error}
              onClear={() => {
                  setOriginalImageFile(null);
                  setOriginalImageUrl(null);
                  setPixelatedImageUrl(null);
                  setError(null);
                  setOriginalDimensions(null);
                  setPixelatedDimensions(null);
              }}
              originalDimensions={originalDimensions}
              pixelatedDimensions={pixelatedDimensions}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
