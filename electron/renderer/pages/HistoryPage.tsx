import React from 'react';
import { Trash2, Download, Heart, Search, X, Clock } from 'lucide-react';
import { useStore } from '../store/store';

export const HistoryPage: React.FC = () => {
  const { history, deleteGeneration } = useStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<'all' | 'image' | 'video'>('all');
  const [selectedItem, setSelectedItem] = React.useState<number | null>(null);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === 'all' ||
      (filterType === 'image' && item.type.includes('image')) ||
      (filterType === 'video' && item.type.includes('video'));
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
                size={16}
              />
              <input
                type="text"
                placeholder="Поиск по промпту..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background-input border border-white/10 rounded-button px-10 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-background-input border border-white/10 rounded-button px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="all">Все типы</option>
              <option value="image">Изображения</option>
              <option value="video">Видео</option>
            </select>
          </div>
          <div className="text-sm text-foreground-muted">{filteredHistory.length} результатов</div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-foreground-muted">
            <Clock className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg mb-2">История пуста</p>
            <p className="text-sm">Начните генерацию, чтобы увидеть результаты здесь</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredHistory.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item.id)}
                onDelete={() => deleteGeneration(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <DetailPanel
          item={history.find((i) => i.id === selectedItem)!}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

const HistoryCard: React.FC<{
  item: any;
  onClick: () => void;
  onDelete: () => void;
}> = ({ item, onClick, onDelete }) => {
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
      </div>
      <div className="p-3">
        <p className="text-xs text-foreground-muted truncate mb-2">{item.prompt}</p>
        <div className="flex items-center justify-between text-xs text-foreground-muted">
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          <span className="capitalize">{item.type}</span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 p-1.5 bg-error/80 hover:bg-error text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

const DetailPanel: React.FC<{ item: any; onClose: () => void }> = ({ item, onClose }) => {
  return (
    <div className="w-96 bg-background-card rounded-card shadow-card-hover animate-slide-in overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="font-semibold">Детали</h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-4">
        <div className="aspect-square bg-background-input rounded-card overflow-hidden mb-4">
          {item.outputUrl ? (
            <img src={item.outputUrl} alt={item.prompt} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground-muted">
              Нет превью
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-foreground-muted block mb-1">Промпт</label>
            <p className="text-sm">{item.prompt}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <label className="text-xs text-foreground-muted block mb-1">Размер</label>
              <p>
                {item.width} x {item.height}
              </p>
            </div>
            <div>
              <label className="text-xs text-foreground-muted block mb-1">Шаги</label>
              <p>{item.steps}</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-foreground-muted block mb-1">Модель</label>
            <p className="text-sm">{item.model || 'Default'}</p>
          </div>
          <div>
            <label className="text-xs text-foreground-muted block mb-1">Дата создания</label>
            <p className="text-sm">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="flex-1 bg-primary hover:bg-primary-600 text-white py-2 rounded-button text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Download size={16} />
            Скачать
          </button>
          <button className="flex-1 bg-background-input hover:bg-white/10 text-foreground py-2 rounded-button text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Heart size={16} />В избранное
          </button>
        </div>
      </div>
    </div>
  );
};
