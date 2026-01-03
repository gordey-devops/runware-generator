import React, { useEffect, useState } from 'react';
import { Search, Filter, Star, Trash2, X, ChevronRight } from 'lucide-react';
import { useHistoryStore } from '../store/historyStore';
import { useUiStore } from '../store/uiStore';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { clsx } from 'clsx';
import type { GenerationItem } from '@shared/types/api.types';
import { api } from '../api';

interface HistoryItemProps {
  item: GenerationItem;
  isSelected: boolean;
  onClick: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'p-3 rounded-lg cursor-pointer transition-all border',
        isSelected
          ? 'bg-blue-600/20 border-blue-500'
          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
      )}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-gray-900 rounded mb-2 overflow-hidden">
        {item.outputUrl ? (
          <img
            src={item.outputUrl}
            alt={item.prompt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
            No preview
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs text-gray-300 line-clamp-2 flex-1">
            {item.prompt}
          </p>
          {item.favorite && <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{item.width}×{item.height}</span>
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>

        {item.status === 'failed' && (
          <div className="text-xs text-red-500">Failed</div>
        )}
      </div>
    </div>
  );
};

export const HistorySidebar: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useUiStore();
  const {
    items,
    setItems,
    filters,
    setFilters,
    resetFilters,
    selectedId,
    setSelectedId,
    isLoading,
    setIsLoading,
  } = useHistoryStore();

  const [showFilters, setShowFilters] = useState(false);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [filters]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const response = await api.history.getAll({
        type: filters.type,
        status: filters.status,
        favorite: filters.favorite,
        search: filters.search,
      });
      setItems(response.items);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm('Delete this generation?')) {
      try {
        await api.history.delete(id);
        setItems(items.filter((item) => item.id !== id));
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('Delete all history? This cannot be undone.')) {
      try {
        // Delete all items
        await Promise.all(items.map((item) => api.history.delete(item.id)));
        setItems([]);
      } catch (error) {
        console.error('Clear all failed:', error);
      }
    }
  };

  if (!isSidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-gray-800 p-2 rounded-r-lg border border-l-0 border-gray-700 hover:bg-gray-700 transition-colors z-40"
        title="Open history"
      >
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </button>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">History</h2>
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            title="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <Input
          placeholder="Search prompts..."
          value={filters.search || ''}
          onChange={(e) => setFilters({ search: e.target.value })}
          leftIcon={<Search className="w-4 h-4 text-gray-500" />}
        />
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-800 space-y-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>

        {showFilters && (
          <div className="space-y-3">
            <Select
              label="Type"
              options={[
                { value: '', label: 'All Types' },
                { value: 'text-to-image', label: 'Text to Image' },
                { value: 'image-to-image', label: 'Image to Image' },
                { value: 'text-to-video', label: 'Text to Video' },
              ]}
              value={filters.type || ''}
              onChange={(e) => setFilters({ type: e.target.value as any })}
            />

            <Select
              label="Status"
              options={[
                { value: '', label: 'All Status' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
              ]}
              value={filters.status || ''}
              onChange={(e) => setFilters({ status: e.target.value as any })}
            />

            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.favorite || false}
                onChange={(e) => setFilters({ favorite: e.target.checked || undefined })}
                className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              Favorites only
            </label>

            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No history found</p>
            {(filters.search || filters.type || filters.status || filters.favorite) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          items.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onClick={() => setSelectedId(item.id)}
            />
          ))
        )}
      </div>

      {/* Footer Actions */}
      {items.length > 0 && (
        <div className="p-4 border-t border-gray-800">
          <Button
            variant="danger"
            size="sm"
            className="w-full"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={handleClearAll}
          >
            Clear All History
          </Button>
        </div>
      )}
    </div>
  );
};
