import { useStandardStore } from '@/store/useStandardStore';
import { Search, SlidersHorizontal, ArrowUpDown, Plus, Download } from 'lucide-react';
import { Tag } from '@/components/ui/Tag';
import type { FilterStatus, FilterTimeRange } from '@/types';

const statusOptions: { value: FilterStatus; label: string; variant: 'default' | 'success' | 'warning' | 'primary' | 'accent' }[] = [
  { value: 'all', label: '全部状态', variant: 'default' },
  { value: 'effective', label: '生效中', variant: 'success' },
  { value: 'draft', label: '草稿', variant: 'warning' },
  { value: 'deprecated', label: '已停用', variant: 'default' },
];

const timeOptions: { value: FilterTimeRange; label: string }[] = [
  { value: 'all', label: '全部时间' },
  { value: 'today', label: '今天' },
  { value: 'week', label: '近一周' },
  { value: 'month', label: '近一月' },
  { value: 'quarter', label: '近三月' },
];

const sortOptions: { value: 'updatedAt' | 'nameCn' | 'createdAt'; label: string }[] = [
  { value: 'updatedAt', label: '更新时间' },
  { value: 'nameCn', label: '名称' },
  { value: 'createdAt', label: '创建时间' },
];

export function FilterBar() {
  const {
    searchKeyword,
    setSearchKeyword,
    filterStatus,
    setFilterStatus,
    filterTimeRange,
    setFilterTimeRange,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    filterOwner,
    setFilterOwner,
  } = useStandardStore();

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索标准名称、编码、含义..."
            className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-md text-sm
              placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20
              focus:border-primary-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-1">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-500 w-16">负责人</span>
          <input
            type="text"
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            placeholder="输入负责人姓名"
            className="flex-1 max-w-[160px] h-8 px-3 bg-slate-50 border border-slate-200 rounded text-xs
              placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20
              focus:border-primary-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors">
            <Download className="w-4 h-4" />
            导出
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" />
            新增标准
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">状态</span>
            <div className="flex items-center gap-1">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterStatus(opt.value)}
                  className={`
                    px-2.5 py-1 text-xs rounded transition-colors
                    ${filterStatus === opt.value
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-4 bg-slate-200"></div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">更新时间</span>
            <div className="flex items-center gap-1">
              {timeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterTimeRange(opt.value)}
                  className={`
                    px-2.5 py-1 text-xs rounded transition-colors
                    ${filterTimeRange === opt.value
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">排序</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-7 px-2 text-xs bg-slate-50 border border-slate-200 rounded text-slate-600
              focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-7 px-2 text-xs bg-slate-50 border border-slate-200 rounded text-slate-600
              hover:bg-slate-100 transition-colors"
          >
            {sortOrder === 'desc' ? '降序' : '升序'}
          </button>
        </div>
      </div>
    </div>
  );
}
