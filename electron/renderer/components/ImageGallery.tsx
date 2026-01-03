import React, { useState } from 'react';
import { Download, Trash2, Heart, Maximize2 } from 'lucide-react';
import { useStore } from '../store/store';

export const ImageGallery: React.FC = () => {
  const { history, deleteGeneration } = useStore();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.click();

      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (history.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-foreground-muted">
        <div className="text-center space-y-3">
          <Maximize2 className="w-16 h-16 mx-auto opacity-30" />
          <p className="text-lg">Нет генераций</p>
          <p className="text-sm">Создайте первую генерацию, чтобы увидеть результаты здесь</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 auto-rows-auto">
        {history.map((item) => (
          <ImageCard
            key={item.id}
            item={item}
            onClick={() => setSelectedImage(item.id)}
            onDelete={() => deleteGeneration(item.id)}
            onDownload={() => {
              if (item.outputUrl) {
                handleDownload(item.outputUrl, `generation-${item.id}.png`);
              }
            }}
          />
        ))}
      </div>

      {selectedImage && (
        <ImageModal
          item={history.find((i) => i.id === selectedImage)!}
          onClose={() => setSelectedImage(null)}
          onDownload={handleDownload}
        />
      )}
    </>
  );
};

const ImageCard: React.FC<{
  item: any;
  onClick: () => void;
  onDelete: () => void;
  onDownload: () => void;
}> = ({ item, onClick, onDelete, onDownload }) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-background-card rounded-card overflow-hidden cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-square bg-background-input flex items-center justify-center overflow-hidden">
        {item.outputUrl ? (
          <img
            src={item.outputUrl}
            alt={item.prompt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="text-foreground-muted">Нет превью</div>
        )}

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className="p-2 bg-background-card hover:bg-white/20 rounded-full transition-colors"
            title="Скачать"
          >
            <Download size={20} className="text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="p-2 bg-background-card hover:bg-white/20 rounded-full transition-colors"
            title="Открыть"
          >
            <Maximize2 size={20} className="text-white" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <p className="text-xs text-foreground-muted truncate mb-2">{item.prompt}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-foreground-muted">
            {item.width} × {item.height}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-error/20 rounded transition-colors group-hover:opacity-100 opacity-0"
          >
            <Trash2 size={14} className="text-error" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ImageModal: React.FC<{
  item: any;
  onClose: () => void;
  onDownload: (url: string, filename: string) => void;
}> = ({ item, onClose, onDownload }) => {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-w-6xl max-h-full flex gap-4 animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 flex items-center justify-center">
          {item.outputUrl ? (
            <img
              src={item.outputUrl}
              alt={item.prompt}
              className="max-w-full max-h-[90vh] object-contain rounded-card"
            />
          ) : (
            <div className="text-foreground-muted">Нет превью</div>
          )}
        </div>

        <div className="w-80 bg-background-card rounded-card p-4 space-y-4 overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Детали генерации</h3>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
              <Maximize2 size={16} />
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-foreground-muted block mb-1">Промпт</label>
              <p className="text-foreground">{item.prompt}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-foreground-muted block mb-1">Размер</label>
                <p>
                  {item.width} × {item.height}
                </p>
              </div>
              <div>
                <label className="text-xs text-foreground-muted block mb-1">Шаги</label>
                <p>{item.steps}</p>
              </div>
            </div>

            <div>
              <label className="text-xs text-foreground-muted block mb-1">Guidance Scale</label>
              <p>{item.guidanceScale}</p>
            </div>

            <div>
              <label className="text-xs text-foreground-muted block mb-1">Дата</label>
              <p>{new Date(item.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                if (item.outputUrl) {
                  onDownload(item.outputUrl, `generation-${item.id}.png`);
                }
              }}
              className="w-full bg-primary hover:bg-primary-600 text-white py-2 rounded-button text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Скачать
            </button>
            <button className="w-full bg-background-input hover:bg-white/10 text-foreground py-2 rounded-button text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Heart size={16} />В избранное
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
