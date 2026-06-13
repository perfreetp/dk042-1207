import { useState } from 'react';
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
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Tag } from '@/components/ui/Tag';
import { useAuditStore } from '@/store/useAuditStore';

const typeLabels: Record<string, string> = {
  create: '新增',
  update: '修改',
  deprecated: '停用',
};

const statusConfig = {
  pending: { label: '待审核', variant: 'warning' as const, icon: Clock },
  approved: { label: '已通过', variant: 'success' as const, icon: CheckCircle },
  rejected: { label: '已驳回', variant: 'danger' as const, icon: XCircle },
};

export default function Audit() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [auditComment, setAuditComment] = useState('');
  const { getFilteredApplies, getPendingCount, approveApply, rejectApply } = useAuditStore();

  const applies = getFilteredApplies();
  const filteredApplies = filterStatus === 'all'
    ? applies
    : applies.filter(a => a.status === filterStatus);

  const selectedApply = applies.find(a => a.id === selectedId) || null;

  const handleApprove = () => {
    if (selectedId) {
      approveApply(selectedId);
      setSelectedId(null);
      setAuditComment('');
    }
  };

  const handleReject = () => {
    if (selectedId) {
      rejectApply(selectedId);
      setSelectedId(null);
      setAuditComment('');
    }
  };

  return (
    <Layout title="审核中心" subtitle="审核标准申请，管理标准生命周期">
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-800">{getPendingCount()}</div>
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
                <div className="text-2xl font-bold text-slate-800">
                  {applies.filter(a => a.status === 'approved').length}
                </div>
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
                <div className="text-2xl font-bold text-slate-800">
                  {applies.filter(a => a.status === 'rejected').length}
                </div>
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
                <div className="text-2xl font-bold text-slate-800">{applies.length}</div>
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
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredApplies.map((apply) => {
                const statusCfg = statusConfig[apply.status as keyof typeof statusConfig];
                const StatusIcon = statusCfg.icon;
                const isSelected = selectedId === apply.id;
                return (
                  <div
                    key={apply.id}
                    onClick={() => setSelectedId(apply.id)}
                    className={`
                      p-4 border-b border-slate-100 cursor-pointer transition-colors
                      ${isSelected
                        ? 'bg-primary-50 border-l-4 border-l-primary-600'
                        : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-800 text-sm">
                        {apply.standardData.nameCn || apply.standardData.code}
                      </h4>
                      <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${isSelected ? 'text-primary-600' : 'text-slate-300'}`} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag variant="accent">{typeLabels[apply.type]}申请</Tag>
                      <Tag variant={statusCfg.variant}>
                        <span className="flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                      </Tag>
                    </div>
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

              {filteredApplies.length === 0 && (
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
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-slate-800">审核详情</h3>
                      <Tag variant={statusConfig[selectedApply.status as keyof typeof statusConfig].variant}>
                        {statusConfig[selectedApply.status as keyof typeof statusConfig].label}
                      </Tag>
                      <Tag variant="accent">{typeLabels[selectedApply.type]}申请</Tag>
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
                      <p className="text-slate-700 text-sm mt-1">{selectedApply.applyReason}</p>
                    </div>
                  </div>

                  {selectedApply.type === 'update' && selectedApply.standardId ? (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700">变更对比</h4>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="p-4 border-r border-slate-200">
                          <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                            <X className="w-3 h-3" /> 修改前
                          </div>
                          <div className="space-y-3 text-sm">
                            <div>
                              <div className="text-xs text-slate-500 mb-1">标准含义</div>
                              <p className="text-slate-700 line-through text-slate-400">
                                单笔交易的金额，正数表示收入，负数表示支出。
                              </p>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1">取值范围</div>
                              <p className="text-slate-700 line-through text-slate-400">
                                数值范围：-9999999999.99 ~ 9999999999.99，保留两位小数
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-success-50/30">
                          <div className="text-xs text-success-600 mb-2 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> 修改后
                          </div>
                          <div className="space-y-3 text-sm">
                            <div>
                              <div className="text-xs text-slate-500 mb-1">标准含义</div>
                              <p className="text-slate-700">
                                {selectedApply.standardData.meaning || '单笔交易的金额，正数表示收入，负数表示支出。金额精度扩展到4位小数，支持加密货币交易。'}
                              </p>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1">取值范围</div>
                              <p className="text-slate-700">
                                {selectedApply.standardData.valueRange || '数值范围：-9999999999.9999 ~ 9999999999.9999，保留四位小数'}
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
                    </div>
                  )}

                  {selectedApply.auditRecords.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-3">审核记录</h4>
                      <div className="space-y-3">
                        {selectedApply.auditRecords.map((record) => (
                          <div key={record.id} className="bg-slate-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                                  <User className="w-3.5 h-3.5 text-primary-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">{record.auditor}</span>
                                <Tag variant={record.result === 'approved' ? 'success' : 'danger'}>
                                  {record.result === 'approved' ? '通过' : '驳回'}
                                </Tag>
                              </div>
                              <span className="text-xs text-slate-400">{record.auditTime}</span>
                            </div>
                            <p className="text-sm text-slate-600 pl-9">{record.comment}</p>
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
                        placeholder="请输入审核意见（选填）"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm
                          focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                      />
                    </div>
                  )}
                </div>

                {selectedApply.status === 'pending' && (
                  <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button
                      onClick={handleReject}
                      className="px-5 py-2 text-sm text-danger-600 bg-danger-50 border border-danger-200 rounded-md hover:bg-danger-100 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        驳回
                      </span>
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-5 py-2 text-sm text-white bg-success-600 rounded-md hover:bg-success-700 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        通过
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <AlertCircle className="w-16 h-16 mb-4 text-slate-300" />
                <p className="text-base">请选择一条申请查看详情</p>
                <p className="text-sm mt-1">点击左侧列表中的申请项</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
