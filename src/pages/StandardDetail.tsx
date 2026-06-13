import { useState } from 'react';
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
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Tag } from '@/components/ui/Tag';
import { useStandardStore } from '@/store/useStandardStore';
import { references } from '@/store/useStandardStore';

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

const versionHistory = [
  { version: 'V2.1', date: '2024-11-20', operator: '张明', change: '补充含义说明，新增2个枚举值' },
  { version: 'V2.0', date: '2024-05-18', operator: '李华', change: '重构取值范围定义，版本升级' },
  { version: 'V1.1', date: '2023-09-22', operator: '王芳', change: '新增同义词和禁用词' },
  { version: 'V1.0', date: '2023-06-15', operator: '张明', change: '首次发布' },
];

export default function StandardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStandardById } = useStandardStore();
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  const standard = getStandardById(id || '');

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
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-slate-800">{standard.nameCn}</h2>
                  <Tag variant={status.variant}>
                    <span className="flex items-center gap-1">
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </Tag>
                  <Tag variant="primary">{standard.version}</Tag>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                      {standard.code}
                    </span>
                  </div>
                  <div className="text-slate-300">·</div>
                  <span>{standard.nameEn}</span>
                  <button className="flex items-center gap-1 text-slate-400 hover:text-primary-600 transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                    复制
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
                <button className="px-4 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors">
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
                    px-6 py-3 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.key
                      ? 'border-primary-600 text-primary-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">标准含义</h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-4">
                    {standard.meaning}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">同义词</h4>
                  {standard.synonyms.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {standard.synonyms.map((syn) => (
                        <Tag key={syn.id} variant="accent">
                          {syn.name}
                          <span className="ml-1 text-xs opacity-60">
                            {syn.type === 'alias' ? '别名' : '缩写'}
                          </span>
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">暂无同义词</p>
                  )}
                </div>

                {standard.forbiddenWords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3">禁用词</h4>
                    <div className="space-y-2">
                      {standard.forbiddenWords.map((fw) => (
                        <div
                          key={fw.id}
                          className="flex items-center gap-3 bg-danger-50 border border-danger-100 rounded-lg px-4 py-2.5"
                        >
                          <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-danger-700">{fw.name}</span>
                          <span className="text-xs text-danger-600">— {fw.reason}</span>
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
                  <h4 className="text-sm font-medium text-slate-700 mb-2">取值范围</h4>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4">
                    {standard.valueRange}
                  </p>
                </div>

                {standard.enumValues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3">枚举值列表</h4>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left py-2.5 px-4 font-medium text-slate-600 w-24">编码</th>
                            <th className="text-left py-2.5 px-4 font-medium text-slate-600 w-32">名称</th>
                            <th className="text-left py-2.5 px-4 font-medium text-slate-600">描述</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standard.enumValues.map((ev, idx) => (
                            <tr
                              key={ev.id}
                              className={idx !== standard.enumValues.length - 1 ? 'border-b border-slate-100' : ''}
                            >
                              <td className="py-3 px-4">
                                <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">{ev.code}</code>
                              </td>
                              <td className="py-3 px-4 text-slate-700">{ev.name}</td>
                              <td className="py-3 px-4 text-slate-500">{ev.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">示例</h4>
                  <div className="bg-slate-900 rounded-lg p-4 text-sm">
                    <code className="text-green-400">{standard.example}</code>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200"></div>
                <div className="space-y-6">
                  {versionHistory.map((v, idx) => (
                    <div key={v.version} className="relative pl-10">
                      <div
                        className={`
                          absolute left-0 top-1 w-[30px] h-[30px] rounded-full
                          flex items-center justify-center
                          ${idx === 0
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-slate-100 text-slate-500'
                          }
                        `}
                      >
                        {idx === 0 ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Tag variant={idx === 0 ? 'primary' : 'default'}>{v.version}</Tag>
                            {idx === 0 && <Tag variant="success">当前版本</Tag>}
                          </div>
                          <span className="text-xs text-slate-400">{v.date}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{v.change}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <User className="w-3 h-3" />
                          操作人：{v.operator}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'references' && (
              <div>
                <p className="text-sm text-slate-500 mb-4">
                  共有 <span className="font-medium text-slate-700">{standardRefs.length}</span> 个系统引用了该标准
                </p>
                {standardRefs.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {standardRefs.map((ref) => (
                      <div
                        key={ref.id}
                        className="border border-slate-200 rounded-lg p-4 hover:border-primary-200 hover:shadow-card-hover transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-slate-800">{ref.systemName}</h5>
                          <Tag variant="accent">{ref.usage}</Tag>
                        </div>
                        <div className="text-xs text-slate-400 mb-2">
                          <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded">
                            系统编码
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          引用时间：{ref.referencedAt}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 py-8 text-center">暂无系统引用</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
