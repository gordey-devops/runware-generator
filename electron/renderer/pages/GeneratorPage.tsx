import React, { useState } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Maximize2,
  Settings as SettingsIcon,
  Download,
  Trash2,
} from 'lucide-react';
import { PromptInput } from '../components/PromptInput';
import { ImageGallery } from '../components/ImageGallery';
import { ProgressBar } from '../components/ProgressBar';
import SettingsModal from '../components/SettingsModal';
import { useUiStore } from '../store/uiStore';
import { useStore } from '../store/store';
import { useGenerationStore } from '../store/generationStore';
import { useHistoryStore } from '../store/historyStore';

export const GeneratorPage: React.FC = () => {
  const { activeTab, setActiveTab } = useUiStore();
  const { isGenerating, currentGeneration } = useStore();
  const { currentResult, isGenerating: isGenGenerating } = useGenerationStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showFullResult, setShowFullResult] = useState(false);

  const tabs = [
    { id: 'text-to-image' as const, label: 'Text → Image', icon: Sparkles },
    { id: 'image-to-image' as const, label: 'Image → Image', icon: ImageIcon },
    { id: 'text-to-video' as const, label: 'Text → Video', icon: Video },
  ];

  return (
    <>
      <div className="flex gap-6 h-full p-2">
        {/* Левая боковая панель */}
        <div className="w-[360px] flex-shrink-0 bg-gradient-to-b from-background-card/80 to-background-card rounded-xl shadow-xl border border-white/5 overflow-hidden flex flex-col">
          {/* Заголовок с настройками */}
          <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Тип генерации
              </h2>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-foreground-muted hover:text-foreground hover:scale-110 active:scale-95"
                title="Настройки"
              >
                <SettingsIcon size={16} />
              </button>
            </div>
          </div>

          {/* Табы выбора типа */}
          <div className="px-4 pt-4 pb-3">
            <div className="grid grid-cols-1 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm relative overflow-hidden group ${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 scale-[1.02]'
                        : 'bg-background-input hover:bg-white/10 text-foreground border border-white/5'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={isActive ? '' : 'group-hover:scale-110 transition-transform'}
                    />
                    {tab.label}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-4 border-t border-white/5" />

          {/* Форма ввода */}
          <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
            <PromptInput />
          </div>

          {/* Прогресс бар */}
          <div className="px-4 pb-4">
            <ProgressBar />
          </div>
        </div>

        {/* Правая область контента */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {isGenerating && currentResult && (
            <div className="bg-gradient-to-br from-background-card to-background-card/50 rounded-xl p-5 shadow-xl border border-white/5 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                    <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full animate-ping opacity-75" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    Генерация в процессе...
                  </span>
                </div>
                <button
                  onClick={() => {}}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-foreground-muted hover:text-foreground hover:scale-110 active:scale-95"
                  title="Открыть в полном размере"
                >
                  <Maximize2 size={16} />
                </button>
              </div>
              <p className="text-xs text-foreground-muted truncate bg-background/50 px-3 py-2 rounded-lg border border-white/5">
                {currentResult.prompt}
              </p>
            </div>
          )}

          <ImageGallery />
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
