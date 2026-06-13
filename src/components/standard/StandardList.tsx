import { useStandardStore, businessDomains } from '@/store/useStandardStore';
import { StandardCard } from './StandardCard';
import { FilterBar } from './FilterBar';
import { FileX } from 'lucide-react';

export function StandardList() {
  const { filteredStandards, selectedDomainId } = useStandardStore();

  const getCurrentDomainName = () => {
    if (!selectedDomainId) return '全部业务域';
    const findDomain = (domains: typeof businessDomains): string | null => {
      for (const d of domains) {
        if (d.id === selectedDomainId) return d.name;
        if (d.children) {
          const found = findDomain(d.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findDomain(businessDomains) || '全部业务域';
  };

  return (
    <div className="flex flex-col h-full">
      <FilterBar />

      <div className="flex items-center justify-between mb-4 mt-4">
        <div className="text-sm text-slate-600">
          <span className="font-medium text-slate-800">{filteredStandards.length}</span>
          <span className="ml-1">条标准</span>
          <span className="mx-2 text-slate-300">·</span>
          <span className="text-slate-500">{getCurrentDomainName()}</span>
        </div>
      </div>

      {filteredStandards.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 overflow-y-auto pr-1">
          {filteredStandards.map((standard) => (
            <StandardCard key={standard.id} standard={standard} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-16">
          <FileX className="w-16 h-16 mb-4 text-slate-300" />
          <p className="text-base">暂无符合条件的标准</p>
          <p className="text-sm mt-1">请尝试调整筛选条件</p>
        </div>
      )}
    </div>
  );
}
