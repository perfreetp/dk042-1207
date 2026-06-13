import { useState } from 'react';
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
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Tag } from '@/components/ui/Tag';
import { businessSystems, references } from '@/data/systems';

export default function Reference() {
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<'systems' | 'standards'>('systems');

  const filteredSystems = businessSystems.filter(
    (sys) =>
      sys.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      sys.code.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const selectedSystem = businessSystems.find((s) => s.id === selectedSystemId);
  const systemRefs = selectedSystem
    ? references.filter((r) => r.systemId === selectedSystem.id)
    : [];

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
                <div className="text-2xl font-bold text-slate-800">128</div>
                <div className="text-sm text-slate-500 mt-1">数据标准</div>
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

        <div className="flex gap-4 h-[calc(100vh-300px)]">
          <div className="w-80 bg-white border border-slate-200 rounded-lg flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-primary-600" />
                <h3 className="font-medium text-slate-800">系统列表</h3>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索系统名称..."
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
            </div>
          </div>

          <div className="flex-1 bg-white border border-slate-200 rounded-lg flex flex-col">
            {selectedSystem ? (
              <>
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <Monitor className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">{selectedSystem.name}</h3>
                      <p className="text-sm text-slate-500">
                        系统编码：<span className="font-mono">{selectedSystem.code}</span>
                        <span className="mx-2 text-slate-300">·</span>
                        负责人：{selectedSystem.owner}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-3 pl-15">{selectedSystem.description}</p>
                </div>

                <div className="border-b border-slate-200">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('standards')}
                      className={`
                        px-6 py-3 text-sm font-medium border-b-2 transition-colors
                        ${activeTab === 'standards'
                          ? 'border-primary-600 text-primary-700'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        引用标准
                        <Tag variant="default" className="ml-1">{systemRefs.length}</Tag>
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('systems')}
                      className={`
                        px-6 py-3 text-sm font-medium border-b-2 transition-colors
                        ${activeTab === 'systems'
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
                  {activeTab === 'standards' && (
                    <div className="space-y-3">
                      {systemRefs.length > 0 ? (
                        systemRefs.map((ref) => (
                          <div
                            key={ref.id}
                            className="border border-slate-200 rounded-lg p-4 hover:border-primary-200 hover:shadow-card-hover transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-slate-800">{ref.standardName}</h4>
                                  <Tag variant="success">已引用</Tag>
                                </div>
                                <p className="text-xs text-slate-400 font-mono mb-2">
                                  {ref.standardId}
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-slate-500">引用用途：</span>
                                  <Tag variant="accent">{ref.usage}</Tag>
                                  <span className="text-slate-300">·</span>
                                  <span className="text-slate-400">引用时间：{ref.referencedAt}</span>
                                </div>
                              </div>
                              <ArrowRight className="w-5 h-5 text-slate-300" />
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

                  {activeTab === 'systems' && (
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
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Monitor className="w-5 h-5 text-slate-500" />
                              </div>
                              <div>
                                <h5 className="font-medium text-slate-800 text-sm">{sys.name}</h5>
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
                <p className="text-base">请选择一个业务系统</p>
                <p className="text-sm mt-1">查看该系统引用的数据标准</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
