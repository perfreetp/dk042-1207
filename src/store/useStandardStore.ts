import { create } from 'zustand';
import type { Standard, FilterStatus, FilterTimeRange } from '@/types';
import { standards as mockStandards } from '@/data/standards';
import { businessDomains } from '@/data/domains';
import { references } from '@/data/systems';

interface StandardState {
  standards: Standard[];
  filteredStandards: Standard[];
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

export const useStandardStore = create<StandardState>((set, get) => ({
  standards: mockStandards,
  filteredStandards: mockStandards,
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

  getStandardById: (id) => {
    return get().standards.find(s => s.id === id);
  },

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
          valA = a.nameCn;
          valB = b.nameCn;
          break;
        case 'createdAt':
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
        default:
          valA = new Date(a.updatedAt).getTime();
          valB = new Date(b.updatedAt).getTime();
          break;
      }
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    set({ filteredStandards: filtered });
  },
}));

export { businessDomains, references };
