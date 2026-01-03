import React from 'react';
import { Trash2, Download, Heart, Search, X, Clock } from 'lucide-react';
import { useHistoryStore } from '../store/historyStore';

export const HistoryPage: React.FC = () => {
  const {
    items,
    fetchHistory,
    deleteHistoryItem,
    isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
    selectedId,
    setSelectedId,
  } = useHistoryStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<'all' | 'image' | 'video'>('all');
  const [selectedItem, setSelectedItem] = React.useState<number | null>(null);

  // Load history on mount
  React.useEffect(() => {
    fetchHistory();
  }, []);

  // Apply filters when search or type changes
  React.useEffect(() => {
    const apiFilters: any = {};
    if (filterType !== 'all') {
      apiFilters.generation_type = filterType === 'image' ? 'text-to-image' : 'text-to-video';
    }
    if (searchQuery) {
      apiFilters.search = searchQuery;
    }
    setFilters(apiFilters);
  }, [searchQuery, filterType]);

  const filteredHistory = React.useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        filterType === 'all' ||
        (filterType === 'image' && item.generation_type.includes('image')) ||
        (filterType === 'video' && item.generation_type.includes('video'));
      return matchesSearch && matchesType;
    });
  }, [items, searchQuery, filterType]);

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96 text-foreground-muted">
            <div className="w-8 h-8 border-2 border-t-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4">Загрузка истории...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-foreground-muted">
            <Clock className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg mb-2">История пуста</p>
            <p className="text-sm">Начните генерацию, чтобы увидеть результаты здесь</p>
            {searchQuery || filterType !== 'all' ? (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
              >
                Сбросить фильтры
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredHistory.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item.id)}
                onDelete={() => deleteHistoryItem(item.id)}
              />
            ))}
          </div>
        )}

        {selectedItem && items.find((i: any) => i.id === selectedItem) && (
          <DetailPanel
            item={items.find((i: any) => i.id === selectedItem)!}
            onClose={() => setSelectedItem(null)}
          />
        )}

        {error && (
          <div className="fixed bottom-4 right-4 bg-error text-white px-4 py-2 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryCard: React.FC<{
  item: any;
  onClick: () => void;
  onDelete: () => void;
}> = ({ item, onClick, onDelete }) => {
  // Handle snake_case properties from GenerationResponse
  const itemData = item as any;
  const imageUrl = itemData['output_url'];
  const prompt = itemData.prompt;
  const width = itemData.parameters?.width || itemData.width;
  const height = itemData.parameters?.height || itemData.height;
  const steps = itemData.parameters?.steps || itemData.steps;
  const model = itemData.parameters?.model || itemData.model_name || 'Default';
  const createdAt = itemData.created_at;
  const generationType = itemData.generation_type;

  return (
    <div
      onClick={onClick}
      className="group relative bg-background-card rounded-card overflow-hidden cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-square bg-background-input flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={prompt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="text-foreground-muted">Нет превью</div>
        )}
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
      <div className="p-3">
        <p className="text-xs text-foreground-muted truncate mb-2">{prompt}</p>
        <div className="flex items-center justify-between text-xs text-foreground-muted">
          <span>{new Date(createdAt).toLocaleDateString()}</span>
          <span className="capitalize">
            {generationType.replace('text-to-', '').replace('image-to-', '')}
          </span>
        </div>
      </div>
    </div>
  );
};

const DetailPanel: React.FC<{ item: any; onClose: () => void }> = ({ item, onClose }) => {
  // Handle snake_case properties from GenerationResponse
  const itemData = item as any;
  const imageUrl = itemData['output_url'];
  const prompt = itemData.prompt;
  const width = itemData.parameters?.width || itemData.width;
  const height = itemData.parameters?.height || itemData.height;
  const steps = itemData.parameters?.steps || itemData.steps;
  const guidanceScale = itemData.parameters?.guidance_scale || itemData.guidance_scale;
  const model = itemData.parameters?.model || itemData.model_name || 'Default';
  const createdAt = itemData.created_at;
  const generationType = itemData.generation_type;

  return (
    <div className="w-96 bg-background-card rounded-card shadow-card-hover animate-slide-in overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="font-semibold">Детали</h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-4">
        <div className="aspect-square bg-background-input rounded-lg overflow-hidden mb-4">
          {imageUrl ? (
            <img src={imageUrl} alt={prompt} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground-muted">
              Нет превью
            </div>
          )}
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <label className="text-xs text-foreground-muted block mb-1">Промпт</label>
            <p className="text-foreground">{prompt}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-foreground-muted block mb-1">Размер</label>
              <p>
                {width} x {height}
              </p>
            </div>
            <div>
              <label className="text-xs text-foreground-muted block mb-1">Шаги</label>
              <p>{steps}</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-foreground-muted block mb-1">Модель</label>
            <p className="text-sm">{model}</p>
          </div>
          <div>
            <label className="text-xs text-foreground-muted block mb-1">Дата создания</label>
            <p className="text-sm">{new Date(createdAt).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-xs text-foreground-muted block mb-1">Тип генерации</label>
            <p className="text-sm capitalize">
              {generationType.replace('text-to-', '').replace('image-to-', '')}
            </p>
          </div>
        </div>
        <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => {
              if (imageUrl) {
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `generation-${itemData.id}.png`;
                link.click();
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
  );
};
