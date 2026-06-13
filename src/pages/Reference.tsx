import { useState, useMemo } from 'react';
import {
  Link2,
  Monitor,
  User,
  Database,
  Search,
  ArrowRight,
  Layers,
  ChevronRight,
  Filter,
  Code,
  FileText,
  Calendar,
  Building,
  Hash,
  Tag,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Tag as UTag } from '@/components/ui/Tag';
import { businessSystems, references } from '@/data/systems';
import { standards } from '@/data/standards';

type ViewMode = 'systems' | 'standards';

export default function Reference() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>('systems');

  // 系统视角状态
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [systemSearch, setSystemSearch] = useState('');
  const [systemActiveTab, setSystemActiveTab] = useState<'standards' | 'systems'>('standards');

  // 标准视角状态
  const [selectedStandardId, setSelectedStandardId] = useState<string | null>(null);
  const [standardSearch, setStandardSearch] = useState('');

  // 系统视角：过滤业务系统
  const filteredSystems = useMemo(() => {
    if (!systemSearch.trim()) return businessSystems;
    const kw = systemSearch.toLowerCase();
    return businessSystems.filter(
      (sys) =>
        sys.name.toLowerCase().includes(kw) ||
        sys.code.toLowerCase().includes(kw)
    );
  }, [systemSearch]);

  // 标准视角：过滤标准（按标准名或编码搜索）
  const standardsWithRefs = useMemo(() => {
    return standards.map((std) => {
      const stdRefs = references.filter((r) => r.standardId === std.id);
      return { ...std, refCount: stdRefs.length, refs: stdRefs };
    });
  }, []);

  const filteredStandards = useMemo(() => {
    const list = standardsWithRefs.filter((s) => s.refCount > 0);
    if (!standardSearch.trim()) return list;
    const kw = standardSearch.toLowerCase();
    return list.filter(
      (std) =>
        std.nameCn.toLowerCase().includes(kw) ||
        std.nameEn.toLowerCase().includes(kw) ||
        std.code.toLowerCase().includes(kw)
    );
  }, [standardSearch, standardsWithRefs]);

  // 选中系统的引用
  const selectedSystem = businessSystems.find((s) => s.id === selectedSystemId);
  const systemRefs = selectedSystem
    ? references.filter((r) => r.systemId === selectedSystem.id)
    : [];

  // 选中标准的引用
  const selectedStandard = standardsWithRefs.find((s) => s.id === selectedStandardId);
  const standardRefSystems = selectedStandard
    ? references
        .filter((r) => r.standardId === selectedStandard.id)
        .map((r) => {
          const sys = businessSystems.find((s) => s.id === r.systemId);
          return { ...r, system: sys };
        })
        .filter((r) => r.system)
    : [];

  const totalStandardsWithRefs = standardsWithRefs.filter((s) => s.refCount > 0).length;

  return (
    <Layout title="引用查询" subtitle="查询业务系统对数据标准的引用关系">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-800">{businessSystems.length}</div>
                <div className="text-sm text-slate-500 mt-1">业务系统</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-800">{totalStandardsWithRefs}</div>
                <div className="text-sm text-slate-500 mt-1">被引用标准</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent-50 flex items-center justify-center">
                <Database className="w-6 h-6 text-accent-500" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-800">{references.length}</div>
                <div className="text-sm text-slate-500 mt-1">引用关系</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success-50 flex items-center justify-center">
                <Link2 className="w-6 h-6 text-success-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-1.5 inline-flex gap-1">
          <button
            onClick={() => {
              setViewMode('systems');
              setSelectedStandardId(null);
            }}
            className={`
              px-5 py-2 text-sm rounded-md transition-all flex items-center gap-2 font-medium
              ${viewMode === 'systems'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }
            `}
          >
            <Monitor className="w-4 h-4" />
            按系统查询
          </button>
          <button
            onClick={() => {
              setViewMode('standards');
              setSelectedSystemId(null);
            }}
            className={`
              px-5 py-2 text-sm rounded-md transition-all flex items-center gap-2 font-medium
              ${viewMode === 'standards'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }
            `}
          >
            <Database className="w-4 h-4" />
            按标准查询
          </button>
        </div>

        <div className="flex gap-4 h-[calc(100vh-340px)]">
          {/* 左侧列表 */}
          <div className="w-80 bg-white border border-slate-200 rounded-lg flex flex-col flex-shrink-0">
            {/* 系统视角列表 */}
            {viewMode === 'systems' && (
              <>
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-5 h-5 text-primary-600" />
                    <h3 className="font-medium text-slate-800">系统列表</h3>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={systemSearch}
                      onChange={(e) => setSystemSearch(e.target.value)}
                      placeholder="搜索系统名称或编码..."
                      className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-md text-sm
                        placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20
                        focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredSystems.map((sys) => {
                    const isSelected = selectedSystemId === sys.id;
                    return (
                      <div
                        key={sys.id}
                        onClick={() => setSelectedSystemId(sys.id)}
                        className={`
                          p-4 border-b border-slate-100 cursor-pointer transition-all
                          ${isSelected
                            ? 'bg-primary-50 border-l-4 border-l-primary-600'
                            : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary-100' : 'bg-slate-100'}`}>
                              <Monitor className={`w-4 h-4 ${isSelected ? 'text-primary-600' : 'text-slate-500'}`} />
                            </div>
                            <div>
                              <h4 className={`font-medium text-sm ${isSelected ? 'text-primary-700' : 'text-slate-800'}`}>
                                {sys.name}
                              </h4>
                              <p className="text-xs text-slate-400 font-mono">{sys.code}</p>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-primary-600' : 'text-slate-300'}`} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 pl-10">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {sys.standardCount} 个标准
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {sys.owner}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {filteredSystems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Monitor className="w-10 h-10 mb-2 text-slate-300" />
                      <p className="text-sm">未找到匹配的系统</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 标准视角列表 */}
            {viewMode === 'standards' && (
              <>
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="w-5 h-5 text-primary-600" />
                    <h3 className="font-medium text-slate-800">标准列表</h3>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={standardSearch}
                      onChange={(e) => setStandardSearch(e.target.value)}
                      placeholder="搜索标准名或编码..."
                      className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-md text-sm
                        placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20
                        focus:border-primary-500 transition-all"
                    />
                  </div>
                  {standardSearch.trim() && (
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      找到 {filteredStandards.length} 个匹配标准
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredStandards.map((std) => {
                    const isSelected = selectedStandardId === std.id;
                    return (
                      <div
                        key={std.id}
                        onClick={() => setSelectedStandardId(std.id)}
                        className={`
                          p-4 border-b border-slate-100 cursor-pointer transition-all
                          ${isSelected
                            ? 'bg-primary-50 border-l-4 border-l-primary-600'
                            : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 pr-2">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className={`font-medium text-sm ${isSelected ? 'text-primary-700' : 'text-slate-800'}`}>
                                {std.nameCn}
                              </h4>
                              <UTag variant="default" className="text-[10px] px-1.5 py-0">
                                {std.refCount} 个引用
                              </UTag>
                            </div>
                            <p className="text-xs text-slate-400 font-mono mb-1">{std.code}</p>
                            <p className="text-xs text-slate-400">{std.domainName}</p>
                          </div>
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 ${isSelected ? 'text-primary-600' : 'text-slate-300'}`} />
                        </div>
                      </div>
                    );
                  })}
                  {filteredStandards.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Database className="w-10 h-10 mb-2 text-slate-300" />
                      <p className="text-sm">未找到匹配的标准</p>
                      <p className="text-xs mt-1">试试其他关键词</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 右侧详情区 */}
          <div className="flex-1 bg-white border border-slate-200 rounded-lg flex flex-col min-w-0">
            {/* 系统视角详情 */}
            {viewMode === 'systems' && (
              selectedSystem ? (
                <>
                  <div className="p-4 border-b border-slate-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                        <Monitor className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 text-lg">{selectedSystem.name}</h3>
                        <p className="text-sm text-slate-500 truncate">
                          系统编码：<span className="font-mono">{selectedSystem.code}</span>
                          <span className="mx-2 text-slate-300">·</span>
                          负责人：{selectedSystem.owner}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-3 leading-relaxed">{selectedSystem.description}</p>
                  </div>

                  <div className="border-b border-slate-200 flex-shrink-0">
                    <div className="flex">
                      <button
                        onClick={() => setSystemActiveTab('standards')}
                        className={`
                          px-6 py-3 text-sm font-medium border-b-2 transition-colors
                          ${systemActiveTab === 'standards'
                            ? 'border-primary-600 text-primary-700'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                          }
                        `}
                      >
                        <span className="flex items-center gap-2">
                          <Database className="w-4 h-4" />
                          引用标准
                          <UTag variant="default" className="ml-1">{systemRefs.length}</UTag>
                        </span>
                      </button>
                      <button
                        onClick={() => setSystemActiveTab('systems')}
                        className={`
                          px-6 py-3 text-sm font-medium border-b-2 transition-colors
                          ${systemActiveTab === 'systems'
                            ? 'border-primary-600 text-primary-700'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                          }
                        `}
                      >
                        <span className="flex items-center gap-2">
                          <Link2 className="w-4 h-4" />
                          关联系统
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    {systemActiveTab === 'standards' && (
                      <div className="space-y-3">
                        {systemRefs.length > 0 ? (
                          systemRefs.map((ref) => (
                            <div
                              key={ref.id}
                              onClick={() => navigate(`/standard/${ref.standardId}`)}
                              className="border border-slate-200 rounded-lg p-4 hover:border-primary-200 hover:shadow-card-hover transition-all cursor-pointer group"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-medium text-slate-800 group-hover:text-primary-700 transition-colors">
                                      {ref.standardName}
                                    </h4>
                                    <UTag variant="success">已引用</UTag>
                                  </div>
                                  <p className="text-xs text-slate-400 font-mono mb-2">
                                    {ref.standardId}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs flex-wrap">
                                    <span className="text-slate-500 flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      引用用途：
                                    </span>
                                    <UTag variant="accent">{ref.usage}</UTag>
                                    <span className="text-slate-300">·</span>
                                    <span className="text-slate-400 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      引用时间：{ref.referencedAt}
                                    </span>
                                  </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Database className="w-12 h-12 mb-3 text-slate-300" />
                            <p className="text-sm">该系统暂无引用标准</p>
                          </div>
                        )}
                      </div>
                    )}

                    {systemActiveTab === 'systems' && (
                      <div className="grid grid-cols-2 gap-3">
                        {businessSystems
                          .filter((s) => s.id !== selectedSystem.id)
                          .slice(0, 4)
                          .map((sys) => (
                            <div
                              key={sys.id}
                              onClick={() => setSelectedSystemId(sys.id)}
                              className="border border-slate-200 rounded-lg p-4 hover:border-primary-200 hover:shadow-card-hover transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                  <Monitor className="w-5 h-5 text-slate-500" />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="font-medium text-slate-800 text-sm truncate">{sys.name}</h5>
                                  <p className="text-xs text-slate-400">{sys.standardCount} 个标准</p>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2">{sys.description}</p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <Monitor className="w-16 h-16 mb-4 text-slate-300" />
                  <p className="text-base font-medium">请选择一个业务系统</p>
                  <p className="text-sm mt-1">查看该系统引用的数据标准</p>
                </div>
              )
            )}

            {/* 标准视角详情 */}
            {viewMode === 'standards' && (
              selectedStandard ? (
                <>
                  <div className="p-4 border-b border-slate-200 flex-shrink-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                          <Database className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-slate-800 text-lg">{selectedStandard.nameCn}</h3>
                            <UTag variant="accent">{selectedStandard.domainName}</UTag>
                            <UTag variant="default">{selectedStandard.version}</UTag>
                          </div>
                          <p className="text-sm text-slate-500 flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Code className="w-3.5 h-3.5" />
                              <span className="font-mono">{selectedStandard.code}</span>
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              负责人：{selectedStandard.owner}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="flex items-center gap-1">
                              <Link2 className="w-3.5 h-3.5" />
                              被 <span className="font-medium text-primary-600">{standardRefSystems.length}</span> 个系统引用
                            </span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/standard/${selectedStandard.id}`)}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 flex-shrink-0 bg-primary-50 px-3 py-1.5 rounded-md hover:bg-primary-100 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        查看详情
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          标准含义
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {selectedStandard.meaning}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                            <Hash className="w-3.5 h-3.5" />
                            取值范围
                          </div>
                          <p className="text-sm text-slate-700">{selectedStandard.valueRange}</p>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                            <Code className="w-3.5 h-3.5" />
                            使用示例
                          </div>
                          <p className="text-sm text-slate-700 bg-white px-2.5 py-1.5 rounded border border-slate-200">
                            <code>{selectedStandard.example}</code>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-b border-slate-200 flex-shrink-0">
                    <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Building className="w-4 h-4 text-primary-600" />
                      引用系统及用途
                      <UTag variant="default" className="ml-1">{standardRefSystems.length}</UTag>
                    </h4>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-3">
                      {standardRefSystems.length > 0 ? (
                        standardRefSystems.map((ref) => (
                          <div
                            key={ref.id}
                            className="border border-slate-200 rounded-lg p-4 hover:border-primary-200 hover:shadow-card-hover transition-all"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                                  <Building className="w-5 h-5 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h5 className="font-medium text-slate-800">{ref.system?.name}</h5>
                                    <UTag variant="success">已引用</UTag>
                                  </div>
                                  <p className="text-xs text-slate-400 mb-2 font-mono">
                                    {ref.system?.code}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs flex-wrap">
                                    <span className="text-slate-500 flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      系统负责人：
                                    </span>
                                    <span className="text-slate-600">{ref.system?.owner}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="mb-2">
                                  <UTag variant="accent" className="px-3 py-1">
                                    {ref.usage}
                                  </UTag>
                                </div>
                                <div className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                                  <Calendar className="w-3 h-3" />
                                  {ref.referencedAt}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                              <div className="text-slate-500">
                                <span className="font-medium">用途说明：</span>
                                用于【{ref.usage}】场景，严格遵循本标准定义的数据格式和业务规则
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                          <Building className="w-12 h-12 mb-3 text-slate-300" />
                          <p className="text-sm">该标准暂无系统引用</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <Database className="w-16 h-16 mb-4 text-slate-300" />
                  <p className="text-base font-medium">请选择一个数据标准</p>
                  <p className="text-sm mt-1">搜索标准名或编码，查看哪些系统在使用</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
