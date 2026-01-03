import { create } from 'zustand';
import type { GenerationItem } from '@shared/types/api.types';

interface HistoryFilters {
  type?: 'text-to-image' | 'image-to-image' | 'text-to-video';
  status?: 'completed' | 'failed';
  favorite?: boolean;
  search?: string;
}

interface HistoryStore {
  // History items
  items: GenerationItem[];
  setItems: (items: GenerationItem[]) => void;
  addItem: (item: GenerationItem) => void;
  updateItem: (id: string, updates: Partial<GenerationItem>) => void;
  removeItem: (id: string) => void;

  // Filters
  filters: HistoryFilters;
  setFilters: (filters: Partial<HistoryFilters>) => void;
  resetFilters: () => void;

  // Selection
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  selectedItem: GenerationItem | null;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // Pagination
  page: number;
  pageSize: number;
  totalItems: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  // Items
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) =>
    set((state) => ({
      items: [item, ...state.items],
      totalItems: state.totalItems + 1,
    })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      totalItems: state.totalItems - 1,
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  // Filters
  filters: {},
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 1, // Reset to first page on filter change
    })),
  resetFilters: () => set({ filters: {}, page: 1 }),

  // Selection
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
  get selectedItem() {
    const state = get();
    return state.items.find((item) => item.id === state.selectedId) || null;
  },

  // UI state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),

  // Pagination
  page: 1,
  pageSize: 20,
  totalItems: 0,
  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size, page: 1 }),
  setTotalItems: (total) => set({ totalItems: total }),
}));
