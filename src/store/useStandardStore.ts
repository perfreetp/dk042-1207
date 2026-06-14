import { create } from 'zustand';
import type { Standard, FilterStatus, FilterTimeRange, StandardVersion } from '@/types';
import { standards as mockStandards } from '@/data/standards';
import { businessDomains } from '@/data/domains';
import { references } from '@/data/systems';

const LS_STANDARDS = 'dictionary_standards_v1';
const LS_VERSIONS = 'dictionary_versions_v1';

const loadStandards = (): Standard[] => {
  try {
    const raw = localStorage.getItem(LS_STANDARDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...mockStandards];
};

const loadVersions = (): StandardVersion[] => {
  try {
    const raw = localStorage.getItem(LS_VERSIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

interface StandardState {
  standards: Standard[];
  filteredStandards: Standard[];
  versions: StandardVersion[];
  selectedDomainId: string | null;
  searchKeyword: string;
  filterStatus: FilterStatus;
  filterOwner: string;
  filterTimeRange: FilterTimeRange;
  sortBy: 'updatedAt' | 'nameCn' | 'createdAt';
  sortOrder: 'asc' | 'desc';

  setSelectedDomain: (id: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  setFilterStatus: (status: FilterStatus) => void;
  setFilterOwner: (owner: string) => void;
  setFilterTimeRange: (range: FilterTimeRange) => void;
  setSortBy: (sort: 'updatedAt' | 'nameCn' | 'createdAt') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  getStandardById: (id: string) => Standard | undefined;
  applyFilters: () => void;

  addStandard: (data: Partial<Standard>, sourceApplyId?: string) => Standard;
  updateStandard: (id: string, data: Partial<Standard>, sourceApplyId?: string) => Standard | undefined;
  deprecateStandard: (id: string, sourceApplyId?: string) => Standard | undefined;
  getVersionsByStandardId: (standardId: string) => StandardVersion[];
  rollbackToVersion: (versionId: string) => boolean;
}

const isInTimeRange = (dateStr: string, range: FilterTimeRange): boolean => {
  if (range === 'all') return true;
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  switch (range) {
    case 'today':
      return diffDays === 0;
    case 'week':
      return diffDays <= 7;
    case 'month':
      return diffDays <= 30;
    case 'quarter':
      return diffDays <= 90;
    default:
      return true;
  }
};

const now = () => new Date().toLocaleString('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
}).replace(/\//g, '-');

const findDomainIdByName = (name: string): string => {
  for (const d of businessDomains) {
    if (d.name === name) return d.id;
    for (const c of (d.children || [])) {
      if (c.name === name) return c.id;
      for (const cc of (c.children || [])) {
        if (cc.name === name) return cc.id;
      }
    }
  }
  return businessDomains[0]?.id || 'dom-customer';
};

export const useStandardStore = create<StandardState>((set, get) => ({
  standards: loadStandards(),
  filteredStandards: loadStandards(),
  versions: loadVersions(),
  selectedDomainId: null,
  searchKeyword: '',
  filterStatus: 'all',
  filterOwner: '',
  filterTimeRange: 'all',
  sortBy: 'updatedAt',
  sortOrder: 'desc',

  setSelectedDomain: (id) => {
    set({ selectedDomainId: id });
    get().applyFilters();
  },

  setSearchKeyword: (keyword) => {
    set({ searchKeyword: keyword });
    get().applyFilters();
  },

  setFilterStatus: (status) => {
    set({ filterStatus: status });
    get().applyFilters();
  },

  setFilterOwner: (owner) => {
    set({ filterOwner: owner });
    get().applyFilters();
  },

  setFilterTimeRange: (range) => {
    set({ filterTimeRange: range });
    get().applyFilters();
  },

  setSortBy: (sort) => {
    set({ sortBy: sort });
    get().applyFilters();
  },

  setSortOrder: (order) => {
    set({ sortOrder: order });
    get().applyFilters();
  },

  getStandardById: (id) => get().standards.find(s => s.id === id),

  applyFilters: () => {
    const { standards, selectedDomainId, searchKeyword, filterStatus, filterOwner, filterTimeRange, sortBy, sortOrder } = get();

    let filtered = [...standards];

    if (selectedDomainId) {
      const getChildIds = (domainId: string): string[] => {
        const domain = businessDomains.flatMap(d => d.children || []).find(d => d.id === domainId) ||
                       businessDomains.find(d => d.id === domainId);
        if (!domain) return [domainId];
        const childIds = (domain.children || []).flatMap(c => getChildIds(c.id));
        return [domainId, ...childIds];
      };
      const domainIds = getChildIds(selectedDomainId);
      filtered = filtered.filter(s => domainIds.includes(s.domainId));
    }

    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      filtered = filtered.filter(s =>
        s.nameCn.toLowerCase().includes(kw) ||
        s.nameEn.toLowerCase().includes(kw) ||
        s.code.toLowerCase().includes(kw) ||
        s.meaning.toLowerCase().includes(kw)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    if (filterOwner) {
      filtered = filtered.filter(s => s.owner.includes(filterOwner));
    }

    filtered = filtered.filter(s => isInTimeRange(s.updatedAt, filterTimeRange));

    filtered.sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      switch (sortBy) {
        case 'nameCn':
          valA = a.nameCn; valB = b.nameCn; break;
        case 'createdAt':
          valA = new Date(a.createdAt).getTime(); valB = new Date(b.createdAt).getTime(); break;
        case 'updatedAt':
        default:
          valA = new Date(a.updatedAt).getTime(); valB = new Date(b.updatedAt).getTime(); break;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    set({ filteredStandards: filtered });
  },

  addStandard: (data, sourceApplyId) => {
    const newId = `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const domainId = data.domainId || findDomainIdByName(data.domainName || '');
    const newStandard: Standard = {
      id: newId,
      nameCn: data.nameCn || '未命名标准',
      nameEn: data.nameEn || 'Unnamed Standard',
      code: data.code || `STD_${Date.now()}`,
      domainId,
      domainName: data.domainName || '客户域',
      status: 'effective',
      dataType: (data.dataType as any) || 'string',
      meaning: data.meaning || '（待完善）',
      valueRange: data.valueRange || '（待完善）',
      example: data.example || '（待完善）',
      owner: data.owner || '未指定',
      version: 'v1.0',
      createdAt: now(),
      updatedAt: now(),
      synonyms: data.synonyms || [],
      forbiddenWords: data.forbiddenWords || [],
      enumValues: data.enumValues || [],
    };

    const newVersion: StandardVersion = {
      id: `ver-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      standardId: newId,
      version: 'v1.0',
      content: { ...newStandard },
      changeLog: sourceApplyId
        ? `通过申请 ${sourceApplyId} 审核通过，正式创建标准。`
        : '初始版本创建。',
      operator: '申请创建人',
      createdAt: now(),
    };

    const newStandards = [newStandard, ...get().standards];
    const newVersions = [newVersion, ...get().versions];

    try {
      localStorage.setItem(LS_STANDARDS, JSON.stringify(newStandards));
      localStorage.setItem(LS_VERSIONS, JSON.stringify(newVersions));
    } catch {}

    set({ standards: newStandards, versions: newVersions });
    get().applyFilters();
    return newStandard;
  },

  updateStandard: (id, data, sourceApplyId) => {
    const target = get().standards.find(s => s.id === id);
    if (!target) return undefined;

    const oldVNum = parseFloat(target.version.replace(/^v/, '')) || 1;
    const newVNum = Math.floor(oldVNum * 10 + 1) / 10;
    const newVersion = `v${newVNum.toFixed(1)}`;

    const updated: Standard = {
      ...target,
      nameCn: data.nameCn ?? target.nameCn,
      nameEn: data.nameEn ?? target.nameEn,
      code: data.code ?? target.code,
      domainId: data.domainId ?? target.domainId,
      domainName: data.domainName ?? target.domainName,
      dataType: (data.dataType as any) ?? target.dataType,
      meaning: data.meaning ?? target.meaning,
      valueRange: data.valueRange ?? target.valueRange,
      example: data.example ?? target.example,
      owner: data.owner ?? target.owner,
      version: newVersion,
      updatedAt: now(),
    };

    const diffs: string[] = [];
    for (const k of ['nameCn', 'nameEn', 'code', 'domainName', 'dataType', 'meaning', 'valueRange', 'example', 'owner'] as const) {
      if (updated[k] !== target[k]) diffs.push(`${k}: ${target[k]} → ${updated[k]}`);
    }

    const newVersionRecord: StandardVersion = {
      id: `ver-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      standardId: id,
      version: newVersion,
      content: { ...updated },
      changeLog: sourceApplyId
        ? `通过申请 ${sourceApplyId} 审核通过，变更内容：${diffs.length ? diffs.join('；') : '内容调整'}。`
        : `手动更新，变更：${diffs.length ? diffs.join('；') : '内容调整'}。`,
      operator: '申请修改人',
      createdAt: now(),
    };

    const newStandards = get().standards.map(s => s.id === id ? updated : s);
    const newVersions = [newVersionRecord, ...get().versions];

    try {
      localStorage.setItem(LS_STANDARDS, JSON.stringify(newStandards));
      localStorage.setItem(LS_VERSIONS, JSON.stringify(newVersions));
    } catch {}

    set({ standards: newStandards, versions: newVersions });
    get().applyFilters();
    return updated;
  },

  deprecateStandard: (id, sourceApplyId) => {
    const target = get().standards.find(s => s.id === id);
    if (!target) return undefined;

    const updated: Standard = { ...target, status: 'deprecated', updatedAt: now() };

    const newVersionRecord: StandardVersion = {
      id: `ver-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      standardId: id,
      version: target.version,
      content: { ...updated },
      changeLog: sourceApplyId
        ? `通过申请 ${sourceApplyId} 审核通过，标准状态变更为已停用。`
        : '手动停用该标准。',
      operator: '审核员',
      createdAt: now(),
    };

    const newStandards = get().standards.map(s => s.id === id ? updated : s);
    const newVersions = [newVersionRecord, ...get().versions];

    try {
      localStorage.setItem(LS_STANDARDS, JSON.stringify(newStandards));
      localStorage.setItem(LS_VERSIONS, JSON.stringify(newVersions));
    } catch {}

    set({ standards: newStandards, versions: newVersions });
    get().applyFilters();
    return updated;
  },

  getVersionsByStandardId: (standardId) => {
    return get().versions.filter(v => v.standardId === standardId);
  },

  rollbackToVersion: (versionId) => {
    const target = get().versions.find(v => v.id === versionId);
    if (!target) return false;
    const result = get().updateStandard(target.standardId, target.content);
    return !!result;
  },
}));

export { businessDomains, references };
