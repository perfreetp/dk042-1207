import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Edit, Clock, User, Hash, Folder, Copy, AlertTriangle,
  CheckCircle2, History, Layers, Link2, MessageSquare, X, Check,
  Eye, ChevronDown, ChevronUp, RefreshCcw, FileText, ChevronRight,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Tag } from '@/components/ui/Tag';
import { useStandardStore, references } from '@/store/useStandardStore';
import { useUnifiedApplyStore } from '@/store/useUnifiedApplyStore';
import type { StandardVersion } from '@/types';

type TabKey = 'basic' | 'values' | 'history' | 'references' | 'applies';

const statusConfig = {
  effective: { label: '生效中', variant: 'success' as const, icon: CheckCircle2 },
  draft: { label: '草稿', variant: 'warning' as const, icon: Clock },
  deprecated: { label: '已停用', variant: 'default' as const, icon: AlertTriangle },
};

const dataTypeLabels: Record<string, string> = {
  string: '字符串', number: '数值', boolean: '布尔', date: '日期', enum: '枚举',
};

function generateInitialVersions(standardId: string, nameCn: string, currentVersion: string, updatedAt: string, createdAt: string): StandardVersion[] {
  const baseChanges: Array<{ version: string; daysAgo: number; changeLog: string; operator: string }> = [];
  const versions: StandardVersion[] = [];

  versions.push({
    id: `v-${standardId}-initial-0`,
    standardId,
    version: currentVersion,
    content: {},
    changeLog: `${nameCn}当前版本（最新）`,
    operator: '管理员',
    createdAt: updatedAt.split(' ')[0],
  });

  if (currentVersion !== 'v1.0') {
    baseChanges.push(
      { version: 'v1.2', daysAgo: 60, changeLog: `补充${nameCn}取值范围边界条件，新增业务说明`, operator: '李华' },
      { version: 'v1.1', daysAgo: 150, changeLog: '优化数据类型说明，补充使用示例', operator: '赵强' },
    );
  }
  baseChanges.push(
    { version: 'v1.0', daysAgo: 300, changeLog: `${nameCn}标准首次发布，定义基础语义和取值规范`, operator: '张明' },
  );

  baseChanges.forEach((bc, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - bc.daysAgo);
    versions.push({
      id: `v-${standardId}-${idx + 1}`,
      standardId,
      version: bc.version,
      content: {},
      changeLog: bc.changeLog,
      operator: bc.operator,
      createdAt: date.toISOString().split('T')[0],
    });
  });
  return versions;
}

const applyTypeLabels: Record<string, string> = {
  create: '新增申请', update: '修改申请', deprecated: '停用申请',
};

export default function StandardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getStandardById, getVersionsByStandardId } = useStandardStore();
  const { applies } = useUnifiedApplyStore();

  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [copied, setCopied] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [showVersionCompare, setShowVersionCompare] = useState<{ v1: string; v2: string } | null>(null);

  const standard = getStandardById(id || '');

  const locState = location.state as { fromApplyId?: string; fromApplyType?: string } | null;
  const highlightApplyId = locState?.fromApplyId || null;

  const [versions, setVersions] = useState<StandardVersion[]>([]);
  useEffect(() => {
    if (!standard) return;
    const real = getVersionsByStandardId(standard.id);
    const init = generateInitialVersions(standard.id, standard.nameCn, standard.version, standard.updatedAt, standard.createdAt);
    const combined: StandardVersion[] = [];
    const seen = new Set<string>();
    for (const v of real) { if (!seen.has(v.version)) { combined.push(v); seen.add(v.version); } }
    for (const v of init) { if (!seen.has(v.version)) { combined.push(v); seen.add(v.version); } }
    setVersions(combined);
  }, [standard, getVersionsByStandardId]);

  const standardRefs = references.filter((r) => r.standardId === standard?.id);
  const relatedApplies = applies.filter(a => a.standardId === standard?.id || (standard && a.status === 'approved' && a.type === 'create' && a.standardData.code === standard.code));

  useEffect(() => {
    if (locState?.fromApplyId && relatedApplies.length > 0) {
      setActiveTab('applies');
    }
  }, [locState?.fromApplyId]);

  if (!standard) {
    return (
      <Layout title="词条详情" subtitle="查看标准词条详细信息">
        <div className="flex flex-col items-center justify-center h-96 text-slate-400">
          <AlertTriangle className="w-16 h-16 mb-4" />
          <p className="text-lg">未找到该标准词条</p>
          <button onClick={() => navigate('/')} className="mt-4 text-primary-600 hover:text-primary-700">
            返回标准目录
          </button>
        </div>
      </Layout>
    );
  }

  const status = statusConfig[standard.status];
  const StatusIcon = status.icon;

  const tabs: { key: TabKey; label: string; icon: any; count?: number }[] = [
    { key: 'basic', label: '基本信息', icon: Hash },
    { key: 'values', label: '取值与示例', icon: Layers },
    { key: 'history', label: '版本历史', icon: History, count: versions.length },
    { key: 'references', label: '引用系统', icon: Link2, count: standardRefs.length },
    { key: 'applies', label: '申请台账', icon: FileText, count: relatedApplies.length },
  ];

  const handleCopy = () => {
    navigator.clipboard?.writeText(standard.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyEdit = () => {
    navigate('/apply', {
      state: { editStandardId: standard.id, formType: 'update' as const, fromStandardId: standard.id },
    });
  };

  return (
    <Layout title="词条详情" subtitle="查看标准词条详细信息">
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />返回列表
          </button>
          {highlightApplyId && (
            <div className="text-xs bg-primary-50 border border-primary-200 text-primary-700 px-3 py-1 rounded flex items-center gap-1">
              <FileText className="w-3 h-3" />
              从申请 <span className="font-mono">{highlightApplyId}</span> 跳转而来
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-xl font-semibold text-slate-800">{standard.nameCn}</h2>
                  <Tag variant={status.variant}>
                    <span className="flex items-center gap-1"><StatusIcon className="w-3 h-3" />{status.label}</span>
                  </Tag>
                  <Tag variant="primary">{standard.version}</Tag>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{standard.code}</span>
                  </div>
                  <div className="text-slate-300">·</div>
                  <span>{standard.nameEn}</span>
                  <button onClick={handleCopy} className="flex items-center gap-1 text-slate-400 hover:text-primary-600 transition-colors">
                    {copied ? (
                      <><Check className="w-3.5 h-3.5 text-success-500" /><span className="text-success-600">已复制</span></>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" />复制编码</>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => navigate('/audit', { state: { fromStandardId: standard.id } })}
                  className="px-4 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />审核记录
                </button>
                <button onClick={handleApplyEdit} className="px-4 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-1.5">
                  <Edit className="w-4 h-4" />申请修改
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-100">
              <div>
                <div className="text-xs text-slate-400 mb-1">业务域</div>
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  <Folder className="w-4 h-4 text-amber-500" />{standard.domainName}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">数据类型</div>
                <div className="text-sm text-slate-700"><Tag variant="accent">{dataTypeLabels[standard.dataType]}</Tag></div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">负责人</div>
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  <User className="w-4 h-4 text-slate-400" />{standard.owner}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">更新时间</div>
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  <Clock className="w-4 h-4 text-slate-400" />{standard.updatedAt}
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200">
            <div className="flex flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors relative ${activeTab === tab.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <span className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {typeof tab.count === 'number' && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${activeTab === tab.key ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                        {tab.count}
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
                    <span className="w-1 h-4 bg-primary-500 rounded"></span>标准含义
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-4 border-l-2 border-primary-500">{standard.meaning}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-accent-500 rounded"></span>同义词
                  </h4>
                  {standard.synonyms.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {standard.synonyms.map((syn) => (
                        <Tag key={syn.id} variant="accent">
                          {syn.name}<span className="ml-1 text-xs opacity-70">({syn.type === 'alias' ? '别名' : '缩写'})</span>
                        </Tag>
                      ))}
                    </div>
                  ) : <p className="text-sm text-slate-400 bg-slate-50 rounded-lg p-3">暂无同义词定义</p>}
                </div>
                {standard.forbiddenWords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-danger-500 rounded"></span>禁用词（请避免使用以下表述）
                    </h4>
                    <div className="space-y-2">
                      {standard.forbiddenWords.map((fw) => (
                        <div key={fw.id} className="flex items-start gap-3 bg-danger-50 border border-danger-100 rounded-lg px-4 py-3">
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
                    <span className="w-1 h-4 bg-primary-500 rounded"></span>取值范围
                  </h4>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4">{standard.valueRange}</p>
                </div>
                {standard.enumValues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-success-500 rounded"></span>枚举值列表
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
                            <tr key={ev.id} className={`${idx !== standard.enumValues.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50`}>
                              <td className="py-3 px-4"><code className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-xs font-medium">{ev.code}</code></td>
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
                    <span className="w-1 h-4 bg-accent-500 rounded"></span>使用示例
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
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <p className="text-sm text-slate-500">
                    共 <span className="font-semibold text-slate-700">{versions.length}</span> 个历史版本，当前版本：
                    <Tag variant="primary" className="ml-2">{versions[0]?.version}</Tag>
                  </p>
                  <button
                    onClick={() => setShowVersionCompare({ v1: versions[0]?.version || '', v2: versions[1]?.version || '' })}
                    disabled={versions.length < 2}
                    className="text-xs text-primary-600 hover:text-primary-700 disabled:text-slate-300 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />版本对比
                  </button>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-500 via-primary-200 to-slate-200"></div>
                  {versions.map((v, idx) => {
                    const isExpanded = expandedVersion === v.id;
                    const highlight = v.changeLog.includes(standard.id) || v.changeLog.includes('审核通过');
                    return (
                      <div key={v.id} className="relative pb-6 last:pb-0">
                        <div className={`absolute -left-6 top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center ${idx === 0 ? 'bg-primary-600 border-primary-600' : highlight ? 'bg-accent-500 border-accent-500' : 'bg-white border-slate-300'}`}>
                          {idx === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <div
                          className={`rounded-lg border transition-all cursor-pointer ${idx === 0 ? 'bg-primary-50/50 border-primary-200' : highlight ? 'bg-accent-50/40 border-accent-200' : 'bg-slate-50 border-slate-200 hover:border-primary-200'}`}
                          onClick={() => setExpandedVersion(isExpanded ? null : v.id)}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-3">
                                <Tag variant={idx === 0 ? 'primary' : highlight ? 'accent' : 'default'} className="text-sm font-semibold">
                                  {v.version}
                                </Tag>
                                {idx === 0 && <Tag variant="success">当前版本</Tag>}
                                {highlight && <Tag variant="accent">申请变更</Tag>}
                                {idx === versions.length - 1 && <Tag variant="default">初始版本</Tag>}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400">{v.createdAt}</span>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                              <User className="w-3.5 h-3.5" />
                              <span>操作人：{v.operator}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-600 line-clamp-1">{v.changeLog}</p>
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
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 flex-wrap">
                                  {idx > 0 && (
                                    <button className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                      <Eye className="w-3 h-3" />查看该版本详情
                                    </button>
                                  )}
                                  {idx > 0 && (
                                    <button className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                      <RefreshCcw className="w-3 h-3" />回滚到此版本
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
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <p className="text-sm text-slate-500">
                    共有 <span className="font-semibold text-slate-700 text-base">{standardRefs.length}</span> 个业务系统引用了「{standard.nameCn}」标准
                  </p>
                  <button onClick={() => navigate('/reference', { state: { focusStandardId: standard.id } })} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                    在引用查询中查看 <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                {standardRefs.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {standardRefs.map((ref) => (
                      <div key={ref.id} className="border border-slate-200 rounded-lg p-4 hover:border-primary-200 hover:shadow-card-hover transition-all">
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

            {activeTab === 'applies' && (
              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <p className="text-sm text-slate-500">
                    共有 <span className="font-semibold text-slate-700 text-base">{relatedApplies.length}</span> 条与「{standard.nameCn}」相关的申请记录
                  </p>
                  <button
                    onClick={() => navigate('/apply', { state: { fromStandardId: standard.id, formType: 'update' as const, editStandardId: standard.id } })}
                    className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />提交新的修改申请
                  </button>
                </div>
                {relatedApplies.length > 0 ? (
                  <div className="space-y-3">
                    {relatedApplies.map((apply) => {
                      const isHighlight = apply.id === highlightApplyId;
                      return (
                        <div
                          key={apply.id}
                          className={`border rounded-lg p-4 transition-colors ${isHighlight ? 'border-primary-400 bg-primary-50/40 ring-2 ring-primary-200' : 'border-slate-200 hover:border-primary-200'}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Tag variant="accent">{applyTypeLabels[apply.type] || apply.type}</Tag>
                                <Tag variant={apply.status === 'approved' ? 'success' : apply.status === 'rejected' ? 'danger' : 'warning'}>
                                  {apply.status === 'approved' ? '已通过' : apply.status === 'rejected' ? '已驳回' : '待审核'}
                                </Tag>
                                {isHighlight && <Tag variant="primary">当前关注</Tag>}
                                <span className="text-xs text-slate-400 font-mono">#{apply.id}</span>
                              </div>
                              <div className="bg-amber-50 border border-amber-100 rounded px-3 py-2 mb-2">
                                <p className="text-xs text-amber-600"><span className="font-medium">申请原因：</span>{apply.applyReason}</p>
                              </div>
                              {apply.auditRecords.length > 0 && apply.auditRecords.map((r) => (
                                <div key={r.id} className={`rounded-lg p-3 text-sm mb-1 ${r.result === 'approved' ? 'bg-success-50 border border-success-100' : 'bg-danger-50 border border-danger-100'}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2 text-xs">
                                      <User className="w-3 h-3" />{r.auditor}
                                      <span className={r.result === 'approved' ? 'text-success-600 font-medium' : 'text-danger-600 font-medium'}>
                                        · {r.result === 'approved' ? '审核通过' : '审核驳回'}
                                      </span>
                                    </div>
                                    <span className="text-xs text-slate-400">{r.auditTime}</span>
                                  </div>
                                  <p className="text-xs text-slate-600"><span className="font-medium">审核意见：</span>{r.comment}</p>
                                </div>
                              ))}
                              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                                <span>申请人：{apply.applicant}</span>
                                <span>提交时间：{apply.submitTime}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => navigate('/audit', { state: { focusApplyId: apply.id } })}
                              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 flex-shrink-0"
                            >
                              在审核中心打开 <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-lg">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm mb-2">暂无相关申请记录</p>
                    <button
                      onClick={() => navigate('/apply', { state: { formType: 'create' as const } })}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      去提交第一条申请
                    </button>
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
                <button onClick={() => setShowVersionCompare(null)} className="text-slate-400 hover:text-slate-600">
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
                <button onClick={() => setShowVersionCompare(null)} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100">
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
