import React, { useState } from 'react';
import { Sparkles, Settings2, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import { useStore } from '../store/store';
import ImageUpload from './ImageUpload';
import { api } from '../api';

export const PromptInput: React.FC = () => {
  const { activeTab } = useUiStore();
  const {
    settings,
    updateSettings,
    addGeneration,
    updateGeneration,
    setIsGenerating,
    setProgress,
  } = useStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [width, setWidth] = useState(settings.defaultWidth);
  const [height, setHeight] = useState(settings.defaultHeight);
  const [steps, setSteps] = useState(settings.defaultSteps);
  const [guidanceScale, setGuidanceScale] = useState(settings.defaultGuidanceScale);
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [strength, setStrength] = useState(0.7);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (activeTab === 'image-to-image' && !sourceImage) {
      alert('Please select a source image for image-to-image generation');
      return;
    }

    try {
      setIsGenerating(true);
      setProgress(0);

      const newGeneration = {
        type: activeTab,
        prompt,
        negativePrompt,
        width,
        height,
        steps: activeTab === 'text-to-image' ? steps : undefined,
        guidanceScale: activeTab === 'text-to-image' ? guidanceScale : undefined,
        status: 'pending' as const,
      };

      const tempId = Date.now();
      addGeneration({ ...newGeneration, id: tempId } as any);

      let result;
      if (activeTab === 'text-to-image') {
        result = await api.generation.textToImage({
          prompt,
          negative_prompt: negativePrompt || null,
          width,
          height,
          steps,
          guidance_scale: guidanceScale,
        });
      } else if (activeTab === 'image-to-image') {
        const imageData = await fileToBase64(sourceImage!);
        result = await api.generation.imageToImage({
          prompt,
          image_url: imageData,
          negative_prompt: negativePrompt || null,
          strength,
          steps,
          guidance_scale: guidanceScale,
        });
      } else if (activeTab === 'text-to-video') {
        result = await api.generation.textToVideo({
          prompt,
          negative_prompt: negativePrompt || null,
          width,
          height,
          duration: 3,
          fps: 24,
        });
      }

      if (result && 'id' in result) {
        updateGeneration(tempId, {
          id: result.id,
          outputUrl: result.output_url || undefined,
          status: result.status === 'completed' ? 'completed' : 'pending',
        });
        setProgress(100);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert(`Ошибка генерации: ${errorMessage}\n\nПроверьте:\n1. Правильность API ключа Runware\n2. Интернет-соединение\n3. Что backend запущен и доступен`);
    } finally {
      setIsGenerating(false);
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

  const isImageToImage = activeTab === 'image-to-image';
  const canGenerate = prompt.trim() && (!isImageToImage || sourceImage);

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
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
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
              value={sourceImage || undefined}
              onChange={setSourceImage}
              onClear={() => setSourceImage(null)}
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
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
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
                value={`${width}x${height}`}
                onChange={(e) => {
                  const [w, h] = e.target.value.split('x').map(Number);
                  setWidth(w);
                  setHeight(h);
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
              <select className="w-full bg-background border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                <option>Runware v1 (Fast)</option>
                <option>Runware v1.1 (Quality)</option>
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
                  {steps}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value))}
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
                  {guidanceScale}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
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
        disabled={!canGenerate}
        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-lg text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide"
      >
        {activeTab === 'text-to-image' && <Sparkles size={18} />}
        {activeTab === 'image-to-image' && <Wand2 size={18} />}
        {activeTab === 'text-to-video' && <Wand2 size={18} />}
        {activeTab === 'text-to-image' && 'Сгенерировать изображение'}
        {activeTab === 'image-to-image' && 'Преобразовать изображение'}
        {activeTab === 'text-to-video' && 'Сгенерировать видео'}
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
