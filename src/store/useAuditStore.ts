import { create } from 'zustand';
import type { ApplyRequest, AuditRecord } from '@/types';
import { applyRequests as mockApplies } from '@/data/applies';

interface AuditState {
  applies: ApplyRequest[];
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected';
  selectedApply: ApplyRequest | null;
  auditComment: string;
  setFilterStatus: (status: 'all' | 'pending' | 'approved' | 'rejected') => void;
  setSelectedApply: (apply: ApplyRequest | null) => void;
  setAuditComment: (comment: string) => void;
  getFilteredApplies: () => ApplyRequest[];
  getPendingCount: () => number;
  approveApply: (id: string) => void;
  rejectApply: (id: string) => void;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  applies: mockApplies,
  filterStatus: 'all',
  selectedApply: null,
  auditComment: '',

  setFilterStatus: (status) => set({ filterStatus: status }),

  setSelectedApply: (apply) => set({ selectedApply: apply }),

  setAuditComment: (comment) => set({ auditComment: comment }),

  getFilteredApplies: () => {
    const { applies, filterStatus } = get();
    if (filterStatus === 'all') return applies;
    return applies.filter(a => a.status === filterStatus);
  },

  getPendingCount: () => {
    return get().applies.filter(a => a.status === 'pending').length;
  },

  approveApply: (id) => {
    const { auditComment } = get();
    const auditRecord: AuditRecord = {
      id: `audit-${Date.now()}`,
      requestId: id,
      auditor: '管理员',
      result: 'approved',
      comment: auditComment || '同意',
      auditTime: new Date().toLocaleString('zh-CN'),
    };

    set((state) => ({
      applies: state.applies.map(a =>
        a.id === id
          ? { ...a, status: 'approved' as const, auditRecords: [...a.auditRecords, auditRecord] }
          : a
      ),
      selectedApply: null,
      auditComment: '',
    }));
  },

  rejectApply: (id) => {
    const { auditComment } = get();
    const auditRecord: AuditRecord = {
      id: `audit-${Date.now()}`,
      requestId: id,
      auditor: '管理员',
      result: 'rejected',
      comment: auditComment || '驳回',
      auditTime: new Date().toLocaleString('zh-CN'),
    };

    set((state) => ({
      applies: state.applies.map(a =>
        a.id === id
          ? { ...a, status: 'rejected' as const, auditRecords: [...a.auditRecords, auditRecord] }
          : a
      ),
      selectedApply: null,
      auditComment: '',
    }));
  },
}));
