import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Clock,
  User,
  Hash,
  Folder,
  Copy,
  AlertTriangle,
  CheckCircle2,
  History,
  Layers,
  Link2,
  MessageSquare,
  X,
  Check,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Tag } from '@/components/ui/Tag';
import { useStandardStore, references } from '@/store/useStandardStore';
import type { StandardVersion } from '@/types';

type TabKey = 'basic' | 'values' | 'history' | 'references';

const statusConfig = {
  effective: { label: '生效中', variant: 'success' as const, icon: CheckCircle2 },
  draft: { label: '草稿', variant: 'warning' as const, icon: Clock },
  deprecated: { label: '已停用', variant: 'default' as const, icon: AlertTriangle },
};

const dataTypeLabels: Record<string, string> = {
  string: '字符串',
  number: '数值',
  boolean: '布尔',
  date: '日期',
  enum: '枚举',
};

function generateVersions(standardId: string, nameCn: string): StandardVersion[] {
  const baseChanges: Array<{ version: string; daysAgo: number; changeLog: string; operator: string }> = [];
  baseChanges.push(
    { version: 'V2.1', daysAgo: 30, changeLog: `补充${nameCn}含义说明，新增业务规则描述，完善边界条件定义`, operator: '张明' },
    { version: 'V2.0', daysAgo: 120, changeLog: '重构取值范围定义，扩展适用场景，修正原有定义歧义', operator: '李华' },
    { version: 'V1.2', daysAgo: 200, changeLog: '新增同义词映射关系，补充禁用词说明', operator: '王芳' },
    { version: 'V1.1', daysAgo: 300, changeLog: '优化数据类型说明，补充使用示例', operator: '赵强' },
    { version: 'V1.0', daysAgo: 450, changeLog: `${nameCn}标准首次发布，定义基础语义和取值规范`, operator: '张明' },
  );
  return baseChanges.map((bc, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - bc.daysAgo);
    return {
      id: `v-${standardId}-${idx}`,
      standardId,
      version: bc.version,
      content: {},
      changeLog: bc.changeLog,
      operator: bc.operator,
      createdAt: date.toISOString().split('T')[0],
    };
  });
}

export default function StandardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStandardById } = useStandardStore();

  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [copied, setCopied] = useState(false);
  const [versions, setVersions] = useState<StandardVersion[]>([]);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [showVersionCompare, setShowVersionCompare] = useState<{ v1: string; v2: string } | null>(null);

  const standard = getStandardById(id || '');

  useEffect(() => {
    if (standard) {
      setVersions(generateVersions(standard.id, standard.nameCn));
    }
  }, [standard]);

  if (!standard) {
    return (
      <Layout title="词条详情" subtitle="查看标准词条详细信息">
        <div className="flex flex-col items-center justify-center h-96 text-slate-400">
          <AlertTriangle className="w-16 h-16 mb-4" />
          <p className="text-lg">未找到该标准词条</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            返回标准目录
          </button>
        </div>
      </Layout>
    );
  }

  const status = statusConfig[standard.status];
  const StatusIcon = status.icon;
  const standardRefs = references.filter((r) => r.standardId === standard.id);

  const tabs: { key: TabKey; label: string; icon: typeof Hash }[] = [
    { key: 'basic', label: '基本信息', icon: Hash },
    { key: 'values', label: '取值与示例', icon: Layers },
    { key: 'history', label: '版本历史', icon: History },
    { key: 'references', label: '引用系统', icon: Link2 },
  ];

  const handleCopy = () => {
    navigator.clipboard?.writeText(standard.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyEdit = () => {
    navigate('/apply', {
      state: {
        editStandardId: standard.id,
        formType: 'update' as const,
      },
    });
  };

  return (
    <Layout title="词条详情" subtitle="查看标准词条详细信息">
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>

        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-xl font-semibold text-slate-800">{standard.nameCn}</h2>
                  <Tag variant={status.variant}>
                    <span className="flex items-center gap-1">
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </Tag>
                  <Tag variant="primary">{standard.version}</Tag>
                  {activeTab === 'history' && (
                    <Tag variant="accent">
                      <span className="flex items-center gap-1">
                        <History className="w-3 h-3" />
                        共 {versions.length} 个历史版本
                      </span>
                    </Tag>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                      {standard.code}
                    </span>
                  </div>
                  <div className="text-slate-300">·</div>
                  <span>{standard.nameEn}</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-slate-400 hover:text-primary-600 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-success-500" />
                        <span className="text-success-600">已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        复制编码
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    反馈问题
                  </span>
                </button>
                <button
                  onClick={handleApplyEdit}
                  className="px-4 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors shadow-sm"
                >
                  <span className="flex items-center gap-1.5">
                    <Edit className="w-4 h-4" />
                    申请修改
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-100">
              <div>
                <div className="text-xs text-slate-400 mb-1">业务域</div>
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  <Folder className="w-4 h-4 text-amber-500" />
                  {standard.domainName}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">数据类型</div>
                <div className="text-sm text-slate-700">
                  <Tag variant="accent">{dataTypeLabels[standard.dataType]}</Tag>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">负责人</div>
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                  {standard.owner}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">更新时间</div>
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {standard.updatedAt}
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    px-6 py-3 text-sm font-medium border-b-2 transition-colors relative
                    ${activeTab === tab.key
                      ? 'border-primary-600 text-primary-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.key === 'history' && (
                      <span className={`
                        text-xs px-1.5 py-0.5 rounded
                        ${activeTab === tab.key ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}
                      `}>
                        {versions.length}
                      </span>
                    )}
                    {tab.key === 'references' && (
                      <span className={`
                        text-xs px-1.5 py-0.5 rounded
                        ${activeTab === tab.key ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}
                      `}>
                        {standardRefs.length}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary-500 rounded"></span>
                    标准含义
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-4 border-l-2 border-primary-500">
                    {standard.meaning}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-accent-500 rounded"></span>
                    同义词
                  </h4>
                  {standard.synonyms.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {standard.synonyms.map((syn) => (
                        <Tag key={syn.id} variant="accent">
                          {syn.name}
                          <span className="ml-1 text-xs opacity-70">
                            ({syn.type === 'alias' ? '别名' : '缩写'})
                          </span>
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 bg-slate-50 rounded-lg p-3">暂无同义词定义</p>
                  )}
                </div>

                {standard.forbiddenWords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-danger-500 rounded"></span>
                      禁用词（请避免使用以下表述）
                    </h4>
                    <div className="space-y-2">
                      {standard.forbiddenWords.map((fw) => (
                        <div
                          key={fw.id}
                          className="flex items-start gap-3 bg-danger-50 border border-danger-100 rounded-lg px-4 py-3"
                        >
                          <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-sm font-semibold text-danger-700">「{fw.name}」</span>
                            <span className="text-sm text-danger-600 ml-2">— {fw.reason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'values' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary-500 rounded"></span>
                    取值范围
                  </h4>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4">{standard.valueRange}</p>
                </div>

                {standard.enumValues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-success-500 rounded"></span>
                      枚举值列表
                    </h4>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left py-2.5 px-4 font-medium text-slate-600 w-24">编码</th>
                            <th className="text-left py-2.5 px-4 font-medium text-slate-600 w-32">名称</th>
                            <th className="text-left py-2.5 px-4 font-medium text-slate-600">描述说明</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standard.enumValues.map((ev, idx) => (
                            <tr
                              key={ev.id}
                              className={`${idx !== standard.enumValues.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50`}
                            >
                              <td className="py-3 px-4">
                                <code className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-xs font-medium">{ev.code}</code>
                              </td>
                              <td className="py-3 px-4 text-slate-700 font-medium">{ev.name}</td>
                              <td className="py-3 px-4 text-slate-500">{ev.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-accent-500 rounded"></span>
                    使用示例
                  </h4>
                  <div className="bg-slate-900 rounded-lg p-4 text-sm overflow-x-auto">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="ml-2">示例代码 / 示例数据</span>
                    </div>
                    <code className="text-green-400 font-mono">{standard.example}</code>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-500">
                    共 <span className="font-semibold text-slate-700">{versions.length}</span> 个历史版本，当前版本：
                    <Tag variant="primary" className="ml-2">{versions[0]?.version}</Tag>
                  </p>
                  <button
                    onClick={() => setShowVersionCompare({ v1: versions[0]?.version || '', v2: versions[1]?.version || '' })}
                    disabled={versions.length < 2}
                    className="text-xs text-primary-600 hover:text-primary-700 disabled:text-slate-300 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    版本对比
                  </button>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-500 via-primary-200 to-slate-200"></div>

                  {versions.map((v, idx) => {
                    const isExpanded = expandedVersion === v.id;
                    return (
                      <div key={v.id} className="relative pb-6 last:pb-0">
                        <div
                          className={`
                            absolute -left-6 top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center
                            ${idx === 0
                              ? 'bg-primary-600 border-primary-600'
                              : 'bg-white border-slate-300'
                            }
                          `}
                        >
                          {idx === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>

                        <div
                          className={`
                            rounded-lg border transition-all cursor-pointer
                            ${idx === 0
                              ? 'bg-primary-50/50 border-primary-200'
                              : 'bg-slate-50 border-slate-200 hover:border-primary-200'
                            }
                          `}
                          onClick={() => setExpandedVersion(isExpanded ? null : v.id)}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Tag variant={idx === 0 ? 'primary' : 'default'} className="text-sm font-semibold">
                                  {v.version}
                                </Tag>
                                {idx === 0 && <Tag variant="success">当前版本</Tag>}
                                {idx === versions.length - 1 && <Tag variant="default">初始版本</Tag>}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400">{v.createdAt}</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                              <User className="w-3.5 h-3.5" />
                              <span>操作人：{v.operator}</span>
                            </div>

                            <p className="mt-2 text-sm text-slate-600 line-clamp-1">
                              {v.changeLog}
                            </p>
                          </div>

                          {isExpanded && (
                            <div className="px-4 pb-4 pt-0 border-t border-slate-200/60 mt-2">
                              <div className="pt-3 space-y-3">
                                <div className="flex items-start gap-2">
                                  <RefreshCcw className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-slate-400 mb-1">变更说明</p>
                                    <p className="text-sm text-slate-700">{v.changeLog}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                                  {idx > 0 && (
                                    <button className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      查看该版本详情
                                    </button>
                                  )}
                                  {idx > 0 && (
                                    <button className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                      <RefreshCcw className="w-3 h-3" />
                                      回滚到此版本
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'references' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-500">
                    共有 <span className="font-semibold text-slate-700 text-base">{standardRefs.length}</span> 个业务系统引用了「{standard.nameCn}」标准
                  </p>
                </div>

                {standardRefs.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {standardRefs.map((ref) => (
                      <div
                        key={ref.id}
                        className="border border-slate-200 rounded-lg p-4 hover:border-primary-200 hover:shadow-card-hover transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                              <Layers className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-slate-800">{ref.systemName}</h5>
                              <p className="text-xs text-slate-400">{ref.systemId}</p>
                            </div>
                          </div>
                          <Tag variant="accent">{ref.usage}</Tag>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">引用标准</span>
                            <span className="text-slate-700 font-medium">{ref.standardName}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">引用时间</span>
                            <span className="text-slate-600">{ref.referencedAt}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-lg">
                    <Link2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">暂无系统引用该标准</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {showVersionCompare && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-800">版本对比</h3>
                <button
                  onClick={() => setShowVersionCompare(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4 overflow-y-auto flex-1">
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-primary-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <Tag variant="primary">{showVersionCompare.v1}</Tag>
                    <Tag variant="success">新版本</Tag>
                  </div>
                  <div className="p-4 space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">含义说明</p>
                      <p className="text-slate-600 bg-success-50 text-success-700 rounded p-2 border border-success-100">
                        + {standard.meaning}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">取值范围</p>
                      <p className="text-slate-600">{standard.valueRange}</p>
                    </div>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <Tag variant="default">{showVersionCompare.v2}</Tag>
                    <Tag variant="default">旧版本</Tag>
                  </div>
                  <div className="p-4 space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">含义说明</p>
                      <p className="text-slate-400 bg-danger-50 line-through rounded p-2 border border-danger-100">
                        - {standard.meaning.replace(/，新增.*/, '')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">取值范围</p>
                      <p className="text-slate-400">{standard.valueRange}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 border-t border-slate-200 flex justify-end bg-slate-50">
                <button
                  onClick={() => setShowVersionCompare(null)}
                  className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
