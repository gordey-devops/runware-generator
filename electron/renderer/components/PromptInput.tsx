import React, { useState } from 'react';
import { Sparkles, Settings2, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import { useGenerationStore } from '../store/generationStore';
import { useGeneration } from '../hooks/useGeneration';
import ImageUpload from './ImageUpload';

export const PromptInput: React.FC = () => {
  const { activeTab } = useUiStore();
  const { params, setParams, sourceImage, setSourceImage, strength, setStrength, isGenerating } =
    useGenerationStore();
  const { generateTextToImage, generateImageToImage, generateTextToVideo } = useGeneration();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSourceFile, setLocalSourceFile] = useState<File | null>(null);

  const handleGenerate = async () => {
    if (!params.prompt || !params.prompt.trim()) return;

    if (activeTab === 'image-to-image' && !sourceImage) {
      alert('Please select a source image for image-to-image generation');
      return;
    }

    try {
      if (activeTab === 'text-to-image') {
        await generateTextToImage();
      } else if (activeTab === 'image-to-image') {
        await generateImageToImage();
      } else if (activeTab === 'text-to-video') {
        await generateTextToVideo();
      }
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert(
        `Ошибка генерации: ${errorMessage}\n\nПроверьте:\n1. Правильность API ключа Runware\n2. Интернет-соединение\n3. Что backend запущен и доступен`
      );
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (file: File) => {
    setLocalSourceFile(file);
    const imageData = await fileToBase64(file);
    setSourceImage(imageData);
    setParams({ image_url: imageData });
  };

  const handleImageClear = () => {
    setLocalSourceFile(null);
    setSourceImage(null);
    setParams({ image_url: '' });
  };

  const isImageToImage = activeTab === 'image-to-image';
  const canGenerate = params.prompt && params.prompt.trim() && (!isImageToImage || sourceImage);

  return (
    <div className="space-y-5">
      {/* Промпты */}
      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Промпт
          </label>
          <textarea
            placeholder="Опишите, что хотите сгенерировать..."
            value={params.prompt}
            onChange={(e) => setParams({ prompt: e.target.value })}
            rows={4}
            className="w-full bg-background-input border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono"
          />
        </div>

        {isImageToImage && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Исходное изображение
            </label>
            <ImageUpload
              value={localSourceFile || undefined}
              onChange={handleImageUpload}
              onClear={handleImageClear}
              maxSizeMB={10}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
            Негативный промпт
          </label>
          <textarea
            placeholder="Чего избежать в генерации..."
            value={params.negativePrompt}
            onChange={(e) => setParams({ negativePrompt: e.target.value })}
            rows={2}
            className="w-full bg-background-input border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none font-mono text-foreground-muted"
          />
        </div>
      </div>

      {/* Основные параметры */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Параметры
        </h3>
        <div className="bg-background-input/50 border border-white/5 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground-muted">Размер</label>
              <select
                value={`${params.width}x${params.height}`}
                onChange={(e) => {
                  const [w, h] = e.target.value.split('x').map(Number);
                  setParams({ width: w, height: h });
                }}
                className="w-full bg-background border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="512x512">512 × 512</option>
                <option value="768x768">768 × 768</option>
                <option value="1024x1024">1024 × 1024</option>
                <option value="512x768">512 × 768 (Portrait)</option>
                <option value="768x512">768 × 512 (Landscape)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground-muted">Модель</label>
              <select
                value={params.model}
                onChange={(e) => setParams({ model: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="runware:100@1">Runware v1 (Fast)</option>
                <option value="runware:101@1">Runware v1.1 (Quality)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Расширенные настройки */}
      <div className="space-y-3">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors uppercase tracking-wider group"
        >
          <Settings2 className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          {showAdvanced ? 'Скрыть' : 'Показать'} расширенные настройки
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-background-input/50 border border-white/5 rounded-lg animate-fade-in">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Шаги генерации</label>
                <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  {params.steps}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={params.steps}
                onChange={(e) => setParams({ steps: parseInt(e.target.value) })}
                className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-foreground-muted">
                <span>10 (Быстро)</span>
                <span>50 (Качество)</span>
              </div>
            </div>

            <div className="border-t border-white/5" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Точность</label>
                <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  {params.guidanceScale}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={params.guidanceScale}
                onChange={(e) => setParams({ guidanceScale: parseFloat(e.target.value) })}
                className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-foreground-muted">
                <span>1 (Креатив)</span>
                <span>20 (Точно)</span>
              </div>
            </div>

            {isImageToImage && (
              <>
                <div className="border-t border-white/5" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">Сила изменения</label>
                    <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      {strength.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={strength}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                    className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-foreground-muted">
                    <span>0 (Минимум)</span>
                    <span>1 (Максимум)</span>
                  </div>
                  <p className="text-xs text-foreground-muted leading-relaxed">
                    Насколько сильно AI должен изменить исходное изображение
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Кнопка генерации */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-lg text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide"
      >
        {activeTab === 'text-to-image' && <Sparkles size={18} />}
        {activeTab === 'image-to-image' && <Wand2 size={18} />}
        {activeTab === 'text-to-video' && <Wand2 size={18} />}
        {isGenerating
          ? 'Генерация...'
          : activeTab === 'text-to-image' && 'Сгенерировать изображение'}
        {isGenerating
          ? 'Генерация...'
          : activeTab === 'image-to-image' && 'Преобразовать изображение'}
        {isGenerating ? 'Генерация...' : activeTab === 'text-to-video' && 'Сгенерировать видео'}
      </button>

      {/* Совет */}
      <div className="p-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg">
        <p className="text-xs text-foreground-muted leading-relaxed">
          <span className="font-semibold text-primary">💡 Совет:</span> Будьте конкретны в промптах
          для лучших результатов
        </p>
      </div>
    </div>
  );
};
