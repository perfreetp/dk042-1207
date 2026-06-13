import { useState } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Download,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Tag } from '@/components/ui/Tag';
import { useApplyStore } from '@/store/useApplyStore';

type TabKey = 'my-applies' | 'batch-import';
type FormType = 'create' | 'update' | null;

const typeLabels: Record<string, string> = {
  create: '新增申请',
  update: '修改申请',
  deprecated: '停用申请',
};

const statusConfig = {
  pending: { label: '待审核', variant: 'warning' as const, icon: Clock },
  approved: { label: '已通过', variant: 'success' as const, icon: CheckCircle },
  rejected: { label: '已驳回', variant: 'danger' as const, icon: XCircle },
};

const batchPreviewData = [
  { nameCn: '客户职业', nameEn: 'Customer Occupation', code: 'CUST_OCCUPATION', domain: '客户域', status: '待确认' },
  { nameCn: '婚姻状况', nameEn: 'Marital Status', code: 'MARITAL_STATUS', domain: '客户域', status: '待确认' },
  { nameCn: '教育程度', nameEn: 'Education Level', code: 'EDU_LEVEL', domain: '客户域', status: '重复编码', error: '与现有标准 EDU_LEVEL 编码重复' },
  { nameCn: '行业分类', nameEn: 'Industry Category', code: 'INDUSTRY_CAT', domain: '客户域', status: '待确认' },
  { nameCn: '客户等级', nameEn: 'Customer Level', code: 'CUST_LEVEL', domain: '客户域', status: '待确认' },
];

export default function Apply() {
  const [activeTab, setActiveTab] = useState<TabKey>('my-applies');
  const [formType, setFormType] = useState<FormType>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [uploaded, setUploaded] = useState(false);
  const { getFilteredApplies, createApply } = useApplyStore();

  const applies = getFilteredApplies().filter(() => true);
  const filteredApplies = filterStatus === 'all'
    ? applies
    : applies.filter(a => a.status === filterStatus);

  const handleSubmitApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (formType) {
      createApply({
        type: formType,
        status: 'pending',
        standardData: { nameCn: '新标准', code: 'NEW_STD' },
        applicant: '当前用户',
        applyReason: '测试申请',
      });
      setFormType(null);
    }
  };

  return (
    <Layout title="标准申请" subtitle="提交新增或修改标准的申请">
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('my-applies')}
              className={`
                px-6 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === 'my-applies'
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }
              `}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                我的申请
                <Tag variant="default" className="ml-1">{applies.length}</Tag>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('batch-import')}
              className={`
                px-6 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === 'batch-import'
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }
              `}
            >
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                批量导入
              </span>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'my-applies' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`
                          px-3 py-1.5 text-xs rounded transition-colors
                          ${filterStatus === status
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                          }
                        `}
                      >
                        {statusConfig[status as keyof typeof statusConfig]?.label || '全部'}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFormType('create')}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      新增标准
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredApplies.map((apply) => {
                    const statusCfg = statusConfig[apply.status as keyof typeof statusConfig];
                    const StatusIcon = statusCfg.icon;
                    return (
                      <div
                        key={apply.id}
                        className="border border-slate-200 rounded-lg p-4 hover:border-primary-200 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-slate-800">
                                {apply.standardData.nameCn || apply.standardData.code}
                              </h4>
                              <Tag variant={typeLabels[apply.type] ? 'accent' : 'default'}>
                                {typeLabels[apply.type] || '申请'}
                              </Tag>
                              <Tag variant={statusCfg.variant}>
                                <span className="flex items-center gap-1">
                                  <StatusIcon className="w-3 h-3" />
                                  {statusCfg.label}
                                </span>
                              </Tag>
                            </div>
                            <p className="text-sm text-slate-500 mb-3">申请原因：{apply.applyReason}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                申请人：{apply.applicant}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                提交时间：{apply.submitTime}
                              </span>
                              {apply.auditRecords.length > 0 && (
                                <span className="text-primary-600">
                                  已审核 {apply.auditRecords.length} 次
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {apply.status === 'pending' && (
                              <button className="p-2 text-slate-400 hover:text-danger-500 hover:bg-danger-50 rounded transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            <button className="text-sm text-primary-600 hover:text-primary-700">
                              查看详情
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredApplies.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>暂无申请记录</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'batch-import' && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                  {!uploaded ? (
                    <div onClick={() => setUploaded(true)} className="cursor-pointer">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 mb-1">点击或拖拽文件到此处上传</p>
                      <p className="text-xs text-slate-400">支持 .xlsx / .xls 格式，单个文件不超过 10MB</p>
                      <button className="mt-4 px-4 py-2 text-sm text-primary-600 border border-primary-200 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors">
                        选择文件
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FileSpreadsheet className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-700 mb-1">标准导入模板.xlsx</p>
                      <p className="text-xs text-slate-400 mb-3">25.6KB · 已上传</p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setUploaded(false)}
                          className="text-xs text-danger-600 hover:text-danger-700"
                        >
                          重新上传
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    不确定模板格式？
                    <button className="text-primary-600 hover:text-primary-700 ml-1">
                      <span className="flex items-center gap-1 inline-flex">
                        <Download className="w-3.5 h-3.5" />
                        下载导入模板
                      </span>
                    </button>
                  </div>
                </div>

                {uploaded && (
                  <div className="border border-slate-200 rounded-lg">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-slate-700">数据预览</h4>
                      <div className="flex items-center gap-2 text-xs">
                        <Tag variant="success">3 条有效</Tag>
                        <Tag variant="danger">1 条异常</Tag>
                        <Tag variant="default">共 5 条</Tag>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left py-2.5 px-4 font-medium text-slate-600">中文名</th>
                            <th className="text-left py-2.5 px-4 font-medium text-slate-600">英文名</th>
                            <th className="text-left py-2.5 px-4 font-medium text-slate-600">编码</th>
                            <th className="text-left py-2.5 px-4 font-medium text-slate-600">业务域</th>
                            <th className="text-left py-2.5 px-4 font-medium text-slate-600">状态</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batchPreviewData.map((item, idx) => (
                            <tr
                              key={idx}
                              className={idx !== batchPreviewData.length - 1 ? 'border-b border-slate-100' : ''}
                            >
                              <td className="py-3 px-4 text-slate-700">{item.nameCn}</td>
                              <td className="py-3 px-4 text-slate-500">{item.nameEn}</td>
                              <td className="py-3 px-4">
                                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">{item.code}</code>
                              </td>
                              <td className="py-3 px-4 text-slate-500">{item.domain}</td>
                              <td className="py-3 px-4">
                                {item.error ? (
                                  <div className="flex items-center gap-1 text-danger-600">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span className="text-xs">{item.error}</span>
                                  </div>
                                ) : (
                                  <Tag variant="success">{item.status}</Tag>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-3 bg-slate-50 rounded-b-lg flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-warning-500" />
                        异常数据将被跳过，请修正后重新导入
                      </p>
                      <div className="flex items-center gap-2">
                        <button className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                          取消
                        </button>
                        <button className="px-4 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors">
                          确认导入
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {formType && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-800">
                  {formType === 'create' ? '新增标准申请' : '修改标准申请'}
                </h3>
                <button
                  onClick={() => setFormType(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmitApply} className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-130px)]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      中文名 <span className="text-danger-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="请输入标准中文名"
                      className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm
                        focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      英文名 <span className="text-danger-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="请输入标准英文名"
                      className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm
                        focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      标准编码 <span className="text-danger-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="如：CUST_ID"
                      className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm font-mono
                        focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      所属业务域 <span className="text-danger-500">*</span>
                    </label>
                    <select className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                      <option>请选择业务域</option>
                      <option>客户域</option>
                      <option>产品域</option>
                      <option>交易域</option>
                      <option>账务域</option>
                      <option>风控域</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      数据类型 <span className="text-danger-500">*</span>
                    </label>
                    <select className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                      <option>字符串</option>
                      <option>数值</option>
                      <option>布尔</option>
                      <option>日期</option>
                      <option>枚举</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      标准负责人 <span className="text-danger-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="请输入负责人姓名"
                      className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm
                        focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    标准含义 <span className="text-danger-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="请详细描述标准的含义和业务规则"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    取值范围
                  </label>
                  <textarea
                    rows={2}
                    placeholder="请描述标准的取值范围或约束条件"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    示例
                  </label>
                  <input
                    type="text"
                    placeholder="请输入标准的使用示例"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    申请原因 <span className="text-danger-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="请说明申请新增/修改的原因和背景"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                  />
                </div>
              </form>
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFormType(null)}
                  className="px-4 py-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  onClick={handleSubmitApply}
                  className="px-4 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
                >
                  提交申请
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
