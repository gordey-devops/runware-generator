import { create } from 'zustand';
import type {
  GenerationResponse,
  HistoryFilters as ApiHistoryFilters,
} from '@shared/types/api.types';
import { api } from '../api';

interface HistoryFilters {
  type?: 'text-to-image' | 'image-to-image' | 'text-to-video';
  status?: 'completed' | 'failed';
  favorite?: boolean;
  search?: string;
}

interface HistoryStore {
  // History items
  items: GenerationResponse[];
  setItems: (items: GenerationResponse[]) => void;
  addItem: (item: GenerationResponse) => void;
  updateItem: (id: number, updates: Partial<GenerationResponse>) => void;
  removeItem: (id: number) => void;

  // API integration
  fetchHistory: (filters?: ApiHistoryFilters) => Promise<void>;
  deleteHistoryItem: (id: number) => Promise<void>;

  // Filters
  filters: HistoryFilters;
  setFilters: (filters: Partial<HistoryFilters>) => void;
  resetFilters: () => void;

  // Selection
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  selectedItem: GenerationResponse | null;

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
      items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      totalItems: state.totalItems - 1,
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  // API integration
  fetchHistory: async (filters?: ApiHistoryFilters) => {
    set({ isLoading: true, error: null });
    try {
      const state = get();
      const mergedFilters: ApiHistoryFilters = {
        ...state.filters,
        ...filters,
        offset: (state.page - 1) * state.pageSize,
        limit: state.pageSize,
      };

      const response = await api.history.getAll(mergedFilters);
      set({
        items: response.items,
        totalItems: response.total,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch history:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load history',
        isLoading: false,
      });
    }
  },

  deleteHistoryItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.history.delete(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        totalItems: state.totalItems - 1,
        selectedId: state.selectedId === id ? null : state.selectedId,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete history item:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete item',
        isLoading: false,
      });
    }
  },

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
