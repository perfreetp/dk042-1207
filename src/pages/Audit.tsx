import { useMemo } from 'react';
import {
  CheckSquare,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronRight,
  Eye,
  AlertCircle,
  X,
  Info,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Tag } from '@/components/ui/Tag';
import { useUnifiedApplyStore } from '@/store/useUnifiedApplyStore';
import { standards } from '@/data/standards';

const typeLabels: Record<string, string> = {
  create: '新增',
  update: '修改',
  deprecated: '停用',
};

const statusConfig = {
  all: { label: '全部', variant: 'default' as const, icon: FileText },
  pending: { label: '待审核', variant: 'warning' as const, icon: Clock },
  approved: { label: '已通过', variant: 'success' as const, icon: CheckCircle },
  rejected: { label: '已驳回', variant: 'danger' as const, icon: XCircle },
};

export default function Audit() {
  const {
    auditFilterStatus,
    setAuditFilterStatus,
    selectedApplyId,
    setSelectedApplyId,
    auditComment,
    setAuditComment,
    getFilteredAppliesForAudit,
    getPendingCount,
    getSelectedApply,
    approveApply,
    rejectApply,
  } = useUnifiedApplyStore();

  const applies = getFilteredAppliesForAudit();
  const selectedApply = getSelectedApply();

  const pendingCount = getPendingCount();
  const approvedCount = useMemo(
    () => useUnifiedApplyStore.getState().applies.filter(a => a.status === 'approved').length,
    [applies.length]
  );
  const rejectedCount = useMemo(
    () => useUnifiedApplyStore.getState().applies.filter(a => a.status === 'rejected').length,
    [applies.length]
  );
  const totalCount = useUnifiedApplyStore.getState().applies.length;

  const getOriginalStandard = (standardId?: string) => {
    if (!standardId) return null;
    return standards.find(s => s.id === standardId) || null;
  };

  const handleSelectApply = (id: string) => {
    setSelectedApplyId(id);
    setAuditComment('');
  };

  const handleApprove = () => {
    if (selectedApply) {
      approveApply();
    }
  };

  const handleReject = () => {
    if (selectedApply) {
      rejectApply();
    }
  };

  return (
    <Layout title="审核中心" subtitle="审核标准申请，管理标准生命周期">
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-800">{pendingCount}</div>
                <div className="text-sm text-slate-500 mt-1">待审核</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning-500" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-800">{approvedCount}</div>
                <div className="text-sm text-slate-500 mt-1">已通过</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success-50 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success-500" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-800">{rejectedCount}</div>
                <div className="text-sm text-slate-500 mt-1">已驳回</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-danger-50 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-danger-500" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-800">{totalCount}</div>
                <div className="text-sm text-slate-500 mt-1">全部申请</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 h-[calc(100vh-280px)]">
          <div className="w-96 bg-white border border-slate-200 rounded-lg flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare className="w-5 h-5 text-primary-600" />
                <h3 className="font-medium text-slate-800">审核列表</h3>
              </div>
              <div className="flex items-center gap-1">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => {
                  const cfg = statusConfig[status];
                  const StatusIcon = cfg.icon;
                  const isActive = auditFilterStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setAuditFilterStatus(status)}
                      className={`
                        flex-1 px-2 py-1.5 text-xs rounded transition-colors flex items-center justify-center gap-1
                        ${isActive
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }
                      `}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                      {status === 'pending' && pendingCount > 0 && (
                        <span className="ml-0.5 px-1.5 py-0.5 bg-warning-100 text-warning-700 rounded-full text-[10px]">
                          {pendingCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {applies.map((apply) => {
                const statusCfg = statusConfig[apply.status as keyof typeof statusConfig];
                const StatusIcon = statusCfg.icon;
                const isSelected = selectedApplyId === apply.id;
                return (
                  <div
                    key={apply.id}
                    onClick={() => handleSelectApply(apply.id)}
                    className={`
                      p-4 border-b border-slate-100 cursor-pointer transition-colors
                      ${isSelected
                        ? 'bg-primary-50 border-l-4 border-l-primary-600'
                        : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-800 text-sm flex-1 pr-2">
                        {apply.standardData.nameCn || apply.standardData.code || '未命名标准'}
                      </h4>
                      <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${isSelected ? 'text-primary-600' : 'text-slate-300'}`} />
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Tag variant="accent">{typeLabels[apply.type]}申请</Tag>
                      <Tag variant={statusCfg.variant}>
                        <span className="flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                      </Tag>
                    </div>
                    {apply.standardData.code && (
                      <div className="text-xs text-slate-400 font-mono mb-2">
                        {apply.standardData.code}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {apply.applicant}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {apply.submitTime.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}

              {applies.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <FileText className="w-10 h-10 mb-2 text-slate-300" />
                  <p className="text-sm">暂无申请</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 bg-white border border-slate-200 rounded-lg flex flex-col">
            {selectedApply ? (
              <>
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-medium text-slate-800">审核详情</h3>
                      <Tag variant={statusConfig[selectedApply.status as keyof typeof statusConfig].variant}>
                        {statusConfig[selectedApply.status as keyof typeof statusConfig].label}
                      </Tag>
                      <Tag variant="accent">{typeLabels[selectedApply.type]}申请</Tag>
                      {selectedApply.status === 'pending' && (
                        <span className="text-xs text-warning-600 bg-warning-50 px-2 py-1 rounded flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          请仔细审核后做出决定
                        </span>
                      )}
                    </div>
                    {selectedApply.status === 'pending' && (
                      <button className="text-sm text-primary-600 hover:text-primary-700">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          预览变更效果
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">申请信息</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">申请人：</span>
                        <span className="text-slate-700">{selectedApply.applicant}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">提交时间：</span>
                        <span className="text-slate-700">{selectedApply.submitTime}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-slate-500 text-sm">申请原因：</span>
                      <p className="text-slate-700 text-sm mt-1 leading-relaxed">{selectedApply.applyReason}</p>
                    </div>
                  </div>

                  {selectedApply.type === 'update' && selectedApply.standardId ? (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700">变更对比</h4>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="p-4 border-r border-slate-200">
                          <div className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                            <X className="w-3 h-3" /> 修改前（当前标准内容）
                          </div>
                          {(() => {
                            const original = getOriginalStandard(selectedApply.standardId);
                            if (!original) {
                              return <p className="text-sm text-slate-400 italic">未找到原始标准数据</p>;
                            }
                            return (
                              <div className="space-y-3 text-sm">
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">中文名</div>
                                  <p className="text-slate-700 line-through decoration-danger-300 text-slate-500">
                                    {original.nameCn}
                                  </p>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">英文名</div>
                                  <p className="text-slate-700 line-through decoration-danger-300 text-slate-500">
                                    {original.nameEn}
                                  </p>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">标准含义</div>
                                  <p className="text-slate-700 line-through decoration-danger-300 text-slate-500">
                                    {original.meaning}
                                  </p>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">取值范围</div>
                                  <p className="text-slate-700 line-through decoration-danger-300 text-slate-500">
                                    {original.valueRange}
                                  </p>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">示例</div>
                                  <p className="text-slate-700 line-through decoration-danger-300 text-slate-500">
                                    {original.example}
                                  </p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="p-4 bg-success-50/30">
                          <div className="text-xs text-success-600 mb-3 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> 修改后（申请内容）
                          </div>
                          <div className="space-y-3 text-sm">
                            <div>
                              <div className="text-xs text-slate-500 mb-1">中文名</div>
                              <p className="text-slate-800 font-medium">
                                {selectedApply.standardData.nameCn || '-'}
                              </p>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1">英文名</div>
                              <p className="text-slate-800 font-medium">
                                {selectedApply.standardData.nameEn || '-'}
                              </p>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1">标准含义</div>
                              <p className="text-slate-700">
                                {selectedApply.standardData.meaning || '-'}
                              </p>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1">取值范围</div>
                              <p className="text-slate-700">
                                {selectedApply.standardData.valueRange || '-'}
                              </p>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1">示例</div>
                              <p className="text-slate-700">
                                {selectedApply.standardData.example || '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-slate-700">申请内容</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">中文名：</span>
                          <span className="text-slate-700">{selectedApply.standardData.nameCn || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">英文名：</span>
                          <span className="text-slate-700">{selectedApply.standardData.nameEn || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">编码：</span>
                          <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                            {selectedApply.standardData.code || '-'}
                          </code>
                        </div>
                        <div>
                          <span className="text-slate-500">业务域：</span>
                          <span className="text-slate-700">{selectedApply.standardData.domainName || '-'}</span>
                        </div>
                      </div>
                      {selectedApply.standardData.meaning && (
                        <div className="mt-2">
                          <span className="text-slate-500 text-sm">标准含义：</span>
                          <p className="text-slate-700 text-sm mt-1 leading-relaxed">{selectedApply.standardData.meaning}</p>
                        </div>
                      )}
                      {selectedApply.standardData.valueRange && (
                        <div className="mt-2">
                          <span className="text-slate-500 text-sm">取值范围：</span>
                          <p className="text-slate-700 text-sm mt-1 leading-relaxed">{selectedApply.standardData.valueRange}</p>
                        </div>
                      )}
                      {selectedApply.standardData.example && (
                        <div className="mt-2">
                          <span className="text-slate-500 text-sm">示例：</span>
                          <p className="text-slate-700 text-sm mt-1 leading-relaxed bg-slate-50 px-3 py-2 rounded">
                            <code>{selectedApply.standardData.example}</code>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedApply.auditRecords.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-3">审核记录</h4>
                      <div className="space-y-3">
                        {selectedApply.auditRecords.map((record) => (
                          <div
                            key={record.id}
                            className={`rounded-lg p-4 ${
                              record.result === 'approved'
                                ? 'bg-success-50/50 border border-success-100'
                                : 'bg-danger-50/50 border border-danger-100'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  record.result === 'approved' ? 'bg-success-100' : 'bg-danger-100'
                                }`}>
                                  <User className={`w-4 h-4 ${
                                    record.result === 'approved' ? 'text-success-600' : 'text-danger-600'
                                  }`} />
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-slate-800">{record.auditor}</span>
                                  <div className="text-xs text-slate-400">审核人</div>
                                </div>
                                <Tag variant={record.result === 'approved' ? 'success' : 'danger'} className="ml-2">
                                  {record.result === 'approved' ? '审核通过' : '审核驳回'}
                                </Tag>
                              </div>
                              <span className="text-xs text-slate-400">{record.auditTime}</span>
                            </div>
                            <div className="pl-10">
                              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                审核意见
                              </div>
                              <p className={`text-sm leading-relaxed ${
                                record.result === 'approved' ? 'text-success-800' : 'text-danger-800'
                              }`}>
                                {record.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApply.status === 'pending' && (
                    <div className="border-t border-slate-200 pt-4 mt-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        审核批注
                      </h4>
                      <textarea
                        value={auditComment}
                        onChange={(e) => setAuditComment(e.target.value)}
                        rows={3}
                        placeholder="请输入审核意见，您的批注将被保存到审核记录中（驳回建议填写原因）"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm
                          placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20
                          focus:border-primary-500 resize-none transition-all"
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          审核意见将永久保存，再次打开本申请仍可查看
                        </p>
                        <span className="text-xs text-slate-400">
                          {auditComment.length}/500
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedApply.status === 'pending' && (
                  <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <div className="text-xs text-slate-500">
                      申请编号：<span className="font-mono text-slate-600">{selectedApply.id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleReject}
                        className="px-5 py-2 text-sm text-danger-600 bg-white border border-danger-200 rounded-md hover:bg-danger-50 hover:border-danger-300 transition-all font-medium shadow-sm"
                      >
                        <span className="flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          驳回申请
                        </span>
                      </button>
                      <button
                        onClick={handleApprove}
                        className="px-5 py-2 text-sm text-white bg-success-600 rounded-md hover:bg-success-700 transition-all font-medium shadow-sm"
                      >
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          通过申请
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <AlertCircle className="w-16 h-16 mb-4 text-slate-300" />
                <p className="text-base font-medium">请选择一条申请查看详情</p>
                <p className="text-sm mt-2">点击左侧列表中的申请项进行审核</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
