import { useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckSquare, Clock, User, FileText, CheckCircle, XCircle, MessageSquare,
  ChevronRight, Eye, AlertCircle, X, Info, ExternalLink, ArrowLeft,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Tag } from '@/components/ui/Tag';
import { useUnifiedApplyStore } from '@/store/useUnifiedApplyStore';
import { useStandardStore } from '@/store/useStandardStore';

const typeLabels: Record<string, string> = { create: '新增', update: '修改', deprecated: '停用' };

const statusConfig = {
  all: { label: '全部', variant: 'default' as const, icon: FileText },
  pending: { label: '待审核', variant: 'warning' as const, icon: Clock },
  approved: { label: '已通过', variant: 'success' as const, icon: CheckCircle },
  rejected: { label: '已驳回', variant: 'danger' as const, icon: XCircle },
};

export default function Audit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getStandardById, standards } = useStandardStore();

  // 直接订阅全量 applies，确保任何状态变化都触发重渲染，统计数字实时更新
  const allApplies = useUnifiedApplyStore((s) => s.applies);
  const {
    auditFilterStatus, setAuditFilterStatus,
    selectedApplyId, setSelectedApplyId,
    auditComment, setAuditComment,
    getFilteredAppliesForAudit, getSelectedApply,
    approveApply, rejectApply,
  } = useUnifiedApplyStore();

  const applies = getFilteredAppliesForAudit();
  const selectedApply = getSelectedApply();

  // 跳转定位：从标准详情/引用查询过来时，自动切换筛选保证目标可见
  const state = location.state as { focusApplyId?: string; fromStandardId?: string; fromApplyId?: string } | null;
  useEffect(() => {
    const targetId = state?.focusApplyId || state?.fromApplyId;
    if (targetId) {
      const target = allApplies.find(a => a.id === targetId);
      if (target) {
        // 若当前筛选不含该申请，自动切到 'all' 保证可见
        if (auditFilterStatus !== 'all' && target.status !== auditFilterStatus) {
          setAuditFilterStatus('all');
        }
        setSelectedApplyId(target.id);
        setAuditComment('');
        return;
      }
    }
    if (state?.fromStandardId) {
      // 在全量中找第 1 条匹配的，避免被筛选挡住
      const first = allApplies.find(a =>
        a.standardId === state.fromStandardId ||
        (a.type === 'create' && a.status === 'approved' &&
          standards.find(s => s.code === a.standardData.code)?.id === state.fromStandardId)
      );
      if (first) {
        if (auditFilterStatus !== 'all' && first.status !== auditFilterStatus) {
          setAuditFilterStatus('all');
        }
        setSelectedApplyId(first.id);
        setAuditComment('');
      }
    }
  }, [state?.focusApplyId, state?.fromStandardId, state?.fromApplyId, allApplies, standards, auditFilterStatus]);

  // 基于全量 applies 计算统计，实时且准确
  const pendingCount = useMemo(() => allApplies.filter(a => a.status === 'pending').length, [allApplies]);
  const approvedCount = useMemo(() => allApplies.filter(a => a.status === 'approved').length, [allApplies]);
  const rejectedCount = useMemo(() => allApplies.filter(a => a.status === 'rejected').length, [allApplies]);
  const totalCount = allApplies.length;

  const getOriginalStandard = (standardId?: string) => {
    if (!standardId) return null;
    return getStandardById(standardId) || null;
  };

  const findLinkedStandardByApply = (apply: any) => {
    if (apply.type === 'create' && apply.status === 'approved') {
      return standards.find(s => s.code === apply.standardData.code);
    }
    if (apply.standardId) return getStandardById(apply.standardId);
    return undefined;
  };

  const handleSelectApply = (id: string) => {
    setSelectedApplyId(id);
    setAuditComment('');
  };

  const handleApprove = () => {
    if (selectedApply) approveApply();
  };
  const handleReject = () => {
    if (selectedApply) rejectApply();
  };

  return (
    <Layout title="审核中心" subtitle="审核标准申请，管理标准生命周期">
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => navigate('/apply', { state: { fromAudit: true } })}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />返回申请列表
          </button>
          {selectedApply?.id && (
            <div className="text-xs text-slate-400 font-mono bg-slate-50 px-3 py-1 rounded">
              当前申请：{selectedApply.id}
            </div>
          )}
        </div>

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

        <div className="flex gap-4 h-[calc(100vh-340px)]">
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
                      className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors flex items-center justify-center gap-1 ${isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
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
                const linkedStd = findLinkedStandardByApply(apply);
                return (
                  <div
                    key={apply.id}
                    onClick={() => handleSelectApply(apply.id)}
                    className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${isSelected ? 'bg-primary-50 border-l-4 border-l-primary-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
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
                        <span className="flex items-center gap-1"><StatusIcon className="w-3 h-3" />{statusCfg.label}</span>
                      </Tag>
                      {linkedStd && (
                        <Tag variant="primary" className="text-[10px]">已发布</Tag>
                      )}
                    </div>
                    {apply.standardData.code && (
                      <div className="text-xs text-slate-400 font-mono mb-2">{apply.standardData.code}</div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{apply.applicant}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apply.submitTime.split(' ')[0]}</span>
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
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-medium text-slate-800">审核详情</h3>
                      <Tag variant={statusConfig[selectedApply.status as keyof typeof statusConfig].variant}>
                        {statusConfig[selectedApply.status as keyof typeof statusConfig].label}
                      </Tag>
                      <Tag variant="accent">{typeLabels[selectedApply.type]}申请</Tag>
                      {selectedApply.status === 'pending' && (
                        <span className="text-xs text-warning-600 bg-warning-50 px-2 py-1 rounded flex items-center gap-1">
                          <Info className="w-3 h-3" />请仔细审核后做出决定
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const linkedStd = findLinkedStandardByApply(selectedApply);
                        if (linkedStd) {
                          return (
                            <button
                              onClick={() => navigate(`/standard/${linkedStd.id}`, { state: { fromApplyId: selectedApply.id } })}
                              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />查看标准
                            </button>
                          );
                        }
                        if (selectedApply.status === 'pending') {
                          return (
                            <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                              <Eye className="w-4 h-4" />预览变更效果
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </div>
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
                            if (!original) return <p className="text-sm text-slate-400 italic">未找到原始标准数据</p>;
                            return (
                              <div className="space-y-3 text-sm">
                                {[
                                  { label: '中文名', v: original.nameCn },
                                  { label: '英文名', v: original.nameEn },
                                  { label: '标准含义', v: original.meaning },
                                  { label: '取值范围', v: original.valueRange },
                                  { label: '示例', v: original.example },
                                ].map(item => (
                                  <div key={item.label}>
                                    <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                                    <p className="text-slate-500 line-through decoration-danger-300">{item.v}</p>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="p-4 bg-success-50/30">
                          <div className="text-xs text-success-600 mb-3 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> 修改后（申请内容）
                          </div>
                          <div className="space-y-3 text-sm">
                            {[
                              { label: '中文名', v: selectedApply.standardData.nameCn },
                              { label: '英文名', v: selectedApply.standardData.nameEn },
                              { label: '标准含义', v: selectedApply.standardData.meaning },
                              { label: '取值范围', v: selectedApply.standardData.valueRange },
                              { label: '示例', v: selectedApply.standardData.example },
                            ].map(item => (
                              <div key={item.label}>
                                <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                                <p className="text-slate-800 font-medium">{item.v || '-'}</p>
                              </div>
                            ))}
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
                          <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-xs">{selectedApply.standardData.code || '-'}</code>
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
                            className={`rounded-lg p-4 ${record.result === 'approved' ? 'bg-success-50/50 border border-success-100' : 'bg-danger-50/50 border border-danger-100'}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${record.result === 'approved' ? 'bg-success-100' : 'bg-danger-100'}`}>
                                  <User className={`w-4 h-4 ${record.result === 'approved' ? 'text-success-600' : 'text-danger-600'}`} />
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
                                <MessageSquare className="w-3 h-3" />审核意见
                              </div>
                              <p className={`text-sm leading-relaxed ${record.result === 'approved' ? 'text-success-800' : 'text-danger-800'}`}>
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
                        <MessageSquare className="w-4 h-4" />审核批注
                      </h4>
                      <textarea
                        value={auditComment}
                        onChange={(e) => setAuditComment(e.target.value)}
                        rows={3}
                        placeholder="请输入审核意见，您的批注将被保存到审核记录中（驳回建议填写原因）"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none transition-all"
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Info className="w-3 h-3" />审核意见将永久保存，再次打开本申请仍可查看
                        </p>
                        <span className="text-xs text-slate-400">{auditComment.length}/500</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedApply.status === 'pending' && (
                  <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>申请编号：<span className="font-mono text-slate-600">{selectedApply.id}</span></span>
                      <button
                        onClick={() => navigate('/apply', { state: { focusApplyId: selectedApply.id } })}
                        className="text-primary-600 hover:text-primary-700 flex items-center gap-1 border-l border-slate-300 pl-2"
                      >
                        <ExternalLink className="w-3 h-3" />在申请中打开
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleReject}
                        className="px-5 py-2 text-sm text-danger-600 bg-white border border-danger-200 rounded-md hover:bg-danger-50 hover:border-danger-300 transition-all font-medium shadow-sm"
                      >
                        <span className="flex items-center gap-1.5"><XCircle className="w-4 h-4" />驳回申请</span>
                      </button>
                      <button
                        onClick={handleApprove}
                        className="px-5 py-2 text-sm text-white bg-success-600 rounded-md hover:bg-success-700 transition-all font-medium shadow-sm"
                      >
                        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" />通过申请</span>
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
                <button
                  onClick={() => navigate('/apply')}
                  className="mt-4 text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                >
                  去提交新申请 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
