import { create } from 'zustand';
import type { ApplyRequest, AuditRecord, Standard } from '@/types';
import { applyRequests as mockApplies } from '@/data/applies';
import { useStandardStore } from './useStandardStore';

const LS_APPLIES = 'dictionary_applies_v1';
const LS_BATCH = 'dictionary_batch_v1';

const loadApplies = (): ApplyRequest[] => {
  try {
    const raw = localStorage.getItem(LS_APPLIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [...mockApplies];
};

const defaultBatch = [
  { nameCn: '客户职业', nameEn: 'Customer Occupation', code: 'CUST_OCCUPATION', domain: '客户域', status: '待确认' },
  { nameCn: '婚姻状况', nameEn: 'Marital Status', code: 'MARITAL_STATUS', domain: '客户域', status: '待确认' },
  { nameCn: '教育程度', nameEn: 'Education Level', code: 'EDU_LEVEL', domain: '客户域', status: '重复编码', error: '与现有标准 EDU_LEVEL 编码重复' },
  { nameCn: '行业分类', nameEn: 'Industry Category', code: 'INDUSTRY_CAT', domain: '客户域', status: '待确认' },
  { nameCn: '客户等级', nameEn: 'Customer Level', code: 'CUST_LEVEL', domain: '客户域', status: '待确认' },
];

const loadBatch = (): any[] => {
  try {
    const raw = localStorage.getItem(LS_BATCH);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [...defaultBatch];
};

type BatchItem = {
  nameCn: string;
  nameEn: string;
  code: string;
  domain: string;
  status: string;
  error?: string;
  imported?: boolean;
};

interface UnifiedApplyState {
  applies: ApplyRequest[];

  // 申请相关
  listFilterStatus: 'all' | 'pending' | 'approved' | 'rejected';
  applyCurrentTab: 'my-applies' | 'batch-import';
  setListFilterStatus: (status: 'all' | 'pending' | 'approved' | 'rejected') => void;
  setApplyCurrentTab: (tab: 'my-applies' | 'batch-import') => void;
  getFilteredAppliesForList: () => ApplyRequest[];
  createApply: (apply: {
    type: 'create' | 'update' | 'deprecated';
    standardId?: string;
    standardData: Partial<Standard>;
    applicant: string;
    applyReason: string;
  }) => string;
  getApplyById: (id: string) => ApplyRequest | undefined;
  withdrawApply: (id: string) => boolean;

  // 审核相关
  auditFilterStatus: 'all' | 'pending' | 'approved' | 'rejected';
  selectedApplyId: string | null;
  auditComment: string;
  setAuditFilterStatus: (status: 'all' | 'pending' | 'approved' | 'rejected') => void;
  setSelectedApplyId: (id: string | null) => void;
  setAuditComment: (comment: string) => void;
  getFilteredAppliesForAudit: () => ApplyRequest[];
  getPendingCount: () => number;
  getSelectedApply: () => ApplyRequest | null;
  approveApply: () => boolean;
  rejectApply: () => boolean;

  // 批量导入相关
  batchImported: boolean;
  batchData: BatchItem[];
  setBatchImported: (val: boolean) => void;
  confirmBatchImport: () => { success: number; failed: number };
  updateBatchItem: (index: number, patch: Partial<BatchItem>) => void;
  validateAndSubmitBatchItem: (index: number) => string | null;
  removeBatchItem: (index: number) => void;
  resetBatchData: () => void;
}

const persistApplies = (applies: ApplyRequest[]) => {
  try { localStorage.setItem(LS_APPLIES, JSON.stringify(applies)); } catch {}
};
const persistBatch = (batch: BatchItem[]) => {
  try { localStorage.setItem(LS_BATCH, JSON.stringify(batch)); } catch {}
};

export const useUnifiedApplyStore = create<UnifiedApplyState>((set, get) => ({
  applies: loadApplies(),

  // 申请相关
  listFilterStatus: 'all',
  applyCurrentTab: 'my-applies',

  setListFilterStatus: (status) => set({ listFilterStatus: status }),
  setApplyCurrentTab: (tab) => set({ applyCurrentTab: tab }),

  getFilteredAppliesForList: () => {
    const { applies, listFilterStatus } = get();
    if (listFilterStatus === 'all') return applies;
    return applies.filter(a => a.status === listFilterStatus);
  },

  createApply: (apply) => {
    const newId = `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newApply: ApplyRequest = {
      id: newId,
      type: apply.type,
      status: 'pending',
      standardId: apply.standardId,
      standardData: { ...apply.standardData },
      applicant: apply.applicant,
      applyReason: apply.applyReason,
      submitTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).replace(/\//g, '-'),
      auditRecords: [],
    };
    const newApplies = [newApply, ...get().applies];
    persistApplies(newApplies);
    set({ applies: newApplies });
    return newId;
  },

  getApplyById: (id) => get().applies.find(a => a.id === id),

  withdrawApply: (id) => {
    const { applies } = get();
    const target = applies.find(a => a.id === id);
    if (!target || target.status !== 'pending') return false;
    const newApplies = applies.filter(a => a.id !== id);
    persistApplies(newApplies);
    set({ applies: newApplies });
    return true;
  },

  // 审核相关
  auditFilterStatus: 'all',
  selectedApplyId: null,
  auditComment: '',

  setAuditFilterStatus: (status) => set({ auditFilterStatus: status }),
  setSelectedApplyId: (id) => set({ selectedApplyId: id }),
  setAuditComment: (comment) => set({ auditComment: comment }),

  getFilteredAppliesForAudit: () => {
    const { applies, auditFilterStatus } = get();
    if (auditFilterStatus === 'all') return applies;
    return applies.filter(a => a.status === auditFilterStatus);
  },

  getPendingCount: () => get().applies.filter(a => a.status === 'pending').length,

  getSelectedApply: () => {
    const { applies, selectedApplyId } = get();
    if (!selectedApplyId) return null;
    return applies.find(a => a.id === selectedApplyId) || null;
  },

  approveApply: () => {
    const { selectedApplyId, auditComment, applies } = get();
    if (!selectedApplyId) return false;
    const target = applies.find(a => a.id === selectedApplyId);
    if (!target || target.status !== 'pending') return false;

    const auditRecord: AuditRecord = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestId: selectedApplyId,
      auditor: '管理员',
      result: 'approved',
      comment: auditComment.trim() || '审核通过，同意该申请。',
      auditTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).replace(/\//g, '-'),
    };

    const newApplies = applies.map(a =>
      a.id === selectedApplyId
        ? { ...a, status: 'approved' as const, auditRecords: [...a.auditRecords, auditRecord] }
        : a
    );
    persistApplies(newApplies);
    set({ applies: newApplies, auditComment: '' });

    const stdStore = useStandardStore.getState();
    if (target.type === 'create') {
      stdStore.addStandard(target.standardData, target.id);
    } else if (target.type === 'update' && target.standardId) {
      stdStore.updateStandard(target.standardId, target.standardData, target.id);
    } else if (target.type === 'deprecated' && target.standardId) {
      stdStore.deprecateStandard(target.standardId, target.id);
    }

    return true;
  },

  rejectApply: () => {
    const { selectedApplyId, auditComment, applies } = get();
    if (!selectedApplyId) return false;
    const target = applies.find(a => a.id === selectedApplyId);
    if (!target || target.status !== 'pending') return false;

    const auditRecord: AuditRecord = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestId: selectedApplyId,
      auditor: '管理员',
      result: 'rejected',
      comment: auditComment.trim() || '审核未通过，请修改后重新提交。',
      auditTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).replace(/\//g, '-'),
    };

    const newApplies = applies.map(a =>
      a.id === selectedApplyId
        ? { ...a, status: 'rejected' as const, auditRecords: [...a.auditRecords, auditRecord] }
        : a
    );
    persistApplies(newApplies);
    set({ applies: newApplies, auditComment: '' });
    return true;
  },

  // 批量导入相关
  batchImported: false,
  batchData: loadBatch(),

  setBatchImported: (val) => set({ batchImported: val }),

  confirmBatchImport: () => {
    const { batchData, createApply } = get();
    let success = 0;
    let failed = 0;

    const newBatch: BatchItem[] = batchData.map(item => {
      if (item.status === '待确认' && !item.error && !item.imported) {
        createApply({
          type: 'create',
          standardData: {
            nameCn: item.nameCn,
            nameEn: item.nameEn,
            code: item.code,
            domainName: item.domain,
            meaning: `【批量导入】${item.nameCn}标准定义待补充`,
            valueRange: '待补充',
            example: '待补充',
            dataType: 'string',
          },
          applicant: '批量导入',
          applyReason: `通过批量导入功能导入的${item.nameCn}标准，待完善定义后审核发布。`,
        });
        success++;
        return { ...item, imported: true, status: '已生成申请' };
      }
      if (item.error) failed++;
      return item;
    });

    persistBatch(newBatch);
    set({ batchImported: false, batchData: newBatch });
    return { success, failed };
  },

  updateBatchItem: (index, patch) => {
    const { batchData } = get();
    const updated = [...batchData];
    const original = updated[index] || {};
    const merged = { ...original, ...patch };

    const { standards } = useStandardStore.getState();
    const codeDuplicate = standards.some(s => s.code === merged.code);
    if (codeDuplicate) {
      merged.error = `与现有标准 ${merged.code} 编码重复`;
      merged.status = '重复编码';
    } else if (!merged.nameCn.trim() || !merged.code.trim()) {
      merged.error = '中文名和编码不能为空';
      merged.status = '数据异常';
    } else {
      delete merged.error;
      merged.status = merged.imported ? '已生成申请' : '待确认';
    }

    updated[index] = merged;
    persistBatch(updated);
    set({ batchData: updated });
  },

  validateAndSubmitBatchItem: (index) => {
    const { batchData, createApply } = get();
    const item = batchData[index];
    if (!item) return null;
    if (item.error || item.imported) return null;

    const newId = createApply({
      type: 'create',
      standardData: {
        nameCn: item.nameCn,
        nameEn: item.nameEn,
        code: item.code,
        domainName: item.domain,
        meaning: `【批量导入单行修复提交】${item.nameCn}标准定义待补充`,
        valueRange: '待补充',
        example: '待补充',
        dataType: 'string',
      },
      applicant: '批量导入-单行修复',
      applyReason: `批量导入中单独修复并提交的${item.nameCn}标准。`,
    });

    const updated = [...batchData];
    updated[index] = { ...item, imported: true, status: '已生成申请' };
    persistBatch(updated);
    set({ batchData: updated });
    return newId;
  },

  removeBatchItem: (index) => {
    const { batchData } = get();
    const updated = batchData.filter((_, i) => i !== index);
    persistBatch(updated);
    set({ batchData: updated });
  },

  resetBatchData: () => {
    const fresh = [...defaultBatch];
    persistBatch(fresh);
    set({ batchData: fresh, batchImported: false });
  },
}));
