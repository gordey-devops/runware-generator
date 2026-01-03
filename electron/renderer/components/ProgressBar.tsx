import React from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../store/store';

export const ProgressBar: React.FC = () => {
  const { isGenerating, progress } = useStore();

  if (!isGenerating) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4 space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <div className="absolute inset-0 w-5 h-5 bg-primary/20 rounded-full animate-ping" />
          </div>
          <span className="text-sm font-semibold text-foreground">Генерация...</span>
        </div>
        <span className="text-sm font-bold text-primary bg-primary/20 px-3 py-1 rounded-full">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="w-full bg-background/50 rounded-full h-2.5 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-shimmer transition-all duration-300 ease-out shadow-lg shadow-primary/50"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-foreground-muted text-center font-medium">
        Обработка запроса...
      </p>
    </div>
  );
};
