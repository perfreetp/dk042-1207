import { create } from 'zustand';
import type { ApplyRequest } from '@/types';
import { applyRequests as mockApplies } from '@/data/applies';

interface ApplyState {
  applies: ApplyRequest[];
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected';
  currentTab: 'my-applies' | 'batch-import';
  setFilterStatus: (status: 'all' | 'pending' | 'approved' | 'rejected') => void;
  setCurrentTab: (tab: 'my-applies' | 'batch-import') => void;
  getFilteredApplies: () => ApplyRequest[];
  createApply: (apply: Omit<ApplyRequest, 'id' | 'submitTime' | 'auditRecords'>) => void;
  getApplyById: (id: string) => ApplyRequest | undefined;
  withdrawApply: (id: string) => void;
}

export const useApplyStore = create<ApplyState>((set, get) => ({
  applies: mockApplies,
  filterStatus: 'all',
  currentTab: 'my-applies',

  setFilterStatus: (status) => set({ filterStatus: status }),

  setCurrentTab: (tab) => set({ currentTab: tab }),

  getFilteredApplies: () => {
    const { applies, filterStatus } = get();
    if (filterStatus === 'all') return applies;
    return applies.filter(a => a.status === filterStatus);
  },

  createApply: (apply) => {
    const newApply: ApplyRequest = {
      ...apply,
      id: `app-${Date.now()}`,
      submitTime: new Date().toLocaleString('zh-CN'),
      auditRecords: [],
    };
    set((state) => ({ applies: [newApply, ...state.applies] }));
  },

  getApplyById: (id) => {
    return get().applies.find(a => a.id === id);
  },

  withdrawApply: (id) => {
    set((state) => ({
      applies: state.applies.filter(a => a.id !== id),
    }));
  },
}));
