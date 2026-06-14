import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FileText, Upload, Plus, Download, Clock, User, CheckCircle, XCircle,
  Trash2, FileSpreadsheet, AlertCircle, X, Edit3, ChevronRight, Check,
  ExternalLink, RefreshCcw, Eye, Save, Database, ShieldCheck, Link2,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Tag } from '@/components/ui/Tag';
import { useUnifiedApplyStore } from '@/store/useUnifiedApplyStore';
import { useStandardStore } from '@/store/useStandardStore';
import type { Standard } from '@/types';

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

interface FormState {
  nameCn: string; nameEn: string; code: string; domainName: string;
  dataType: string; owner: string; meaning: string; valueRange: string;
  example: string; applyReason: string;
}

const emptyForm: FormState = {
  nameCn: '', nameEn: '', code: '', domainName: '',
  dataType: 'string', owner: '', meaning: '', valueRange: '',
  example: '', applyReason: '',
};

export default function Apply() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getStandardById, standards } = useStandardStore();

  // 直接订阅全量 applies，保证实时性和定位准确性
  const allApplies = useUnifiedApplyStore((s) => s.applies);
  const {
    listFilterStatus, applyCurrentTab, setListFilterStatus, setApplyCurrentTab,
    getFilteredAppliesForList, createApply, withdrawApply,
    batchImported, batchData, setBatchImported, confirmBatchImport,
    updateBatchItem, validateAndSubmitBatchItem, removeBatchItem, resetBatchData,
  } = useUnifiedApplyStore();

  const [activeTab, setActiveTab] = useState<TabKey>(applyCurrentTab);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>(listFilterStatus);
  const [formType, setFormType] = useState<FormType>(null);
  const [formData, setFormData] = useState<FormState>({ ...emptyForm });
  const [editStandardId, setEditStandardId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [withdrawConfirm, setWithdrawConfirm] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [rowDraft, setRowDraft] = useState<any>(null);
  const [singleResultMsg, setSingleResultMsg] = useState<string | null>(null);
  const [highlightStandardId, setHighlightStandardId] = useState<string | null>(null);
  const [highlightApplyId, setHighlightApplyId] = useState<string | null>(null);
  const [highlightBreadcrumb, setHighlightBreadcrumb] = useState<{ standard?: Standard; applyId?: string } | null>(null);

  // 跳转定位：自动切 Tab + 自动调筛选，确保目标申请可见
  useEffect(() => {
    const state = location.state as {
      editStandardId?: string; formType?: 'update'; fromAuditId?: string;
      focusApplyId?: string; focusStandardId?: string; fromApplyId?: string;
    } | null;

    const targetApplyId = state?.focusApplyId || state?.fromApplyId;
    let targetApply = targetApplyId ? allApplies.find(a => a.id === targetApplyId) : undefined;

    // 从标准详情来，找第 1 条关联申请
    if (!targetApply && state?.focusStandardId) {
      targetApply = allApplies.find(a =>
        a.standardId === state.focusStandardId ||
        (a.type === 'create' && a.status === 'approved' &&
          standards.find(s => s.code === a.standardData.code)?.id === state.focusStandardId)
      );
    }

    if (targetApply) {
      // 切到我的申请 Tab
      setActiveTab('my-applies');
      // 若当前筛选不包含目标申请，自动切到 all
      if (filterStatus !== 'all' && targetApply.status !== filterStatus) {
        setFilterStatus('all');
      }
      setHighlightApplyId(targetApply.id);
    }

    if (state?.editStandardId && state?.formType === 'update') {
      const standard = getStandardById(state.editStandardId);
      if (standard) {
        setEditStandardId(state.editStandardId);
        setFormType('update');
        setFormData({
          nameCn: standard.nameCn, nameEn: standard.nameEn, code: standard.code,
          domainName: standard.domainName, dataType: standard.dataType, owner: standard.owner,
          meaning: standard.meaning, valueRange: standard.valueRange, example: standard.example,
          applyReason: '',
        });
        setActiveTab('my-applies');
      }
    }
    if (state?.fromAuditId) {
      setActiveTab('my-applies');
    }
    if (state?.focusStandardId) {
      setHighlightStandardId(state.focusStandardId);
      setActiveTab('my-applies');
      const std = getStandardById(state.focusStandardId);
      setHighlightBreadcrumb({ standard: std, applyId: targetApply?.id });
    }
    if (state?.focusApplyId || state?.fromApplyId) {
      // 面包屑里展示申请对应的标准信息
      const apply = targetApply || allApplies.find(a => a.id === (state.focusApplyId || state.fromApplyId));
      if (apply) {
        const std = apply.standardId
          ? getStandardById(apply.standardId)
          : apply.type === 'create' && apply.status === 'approved'
            ? standards.find(s => s.code === apply.standardData.code)
            : undefined;
        setHighlightBreadcrumb({ standard: std, applyId: apply.id });
      }
    }
  }, [location.state, getStandardById, allApplies, standards, filterStatus]);

  useEffect(() => { setListFilterStatus(filterStatus); }, [filterStatus, setListFilterStatus]);
  useEffect(() => { setApplyCurrentTab(activeTab); }, [activeTab, setApplyCurrentTab]);

  const filteredApplies = getFilteredAppliesForList();

  const handleOpenCreateForm = () => {
    setFormType('create');
    setEditStandardId(null);
    setFormData({ ...emptyForm });
    setFormError('');
  };

  const handleCloseForm = () => {
    setFormType(null);
    setEditStandardId(null);
    setFormData({ ...emptyForm });
    setFormError('');
    navigate('/apply', { replace: true });
  };

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.nameCn.trim()) { setFormError('请输入标准中文名'); return false; }
    if (!formData.nameEn.trim()) { setFormError('请输入标准英文名'); return false; }
    if (!formData.code.trim()) { setFormError('请输入标准编码'); return false; }
    if (!formData.domainName.trim()) { setFormError('请选择所属业务域'); return false; }
    if (!formData.owner.trim()) { setFormError('请输入标准负责人'); return false; }
    if (!formData.meaning.trim()) { setFormError('请输入标准含义'); return false; }
    if (!formData.applyReason.trim()) { setFormError('请输入申请原因'); return false; }
    setFormError('');
    return true;
  };

  const handleSubmitApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !formType) return;

    const standardData: Partial<Standard> = {
      nameCn: formData.nameCn.trim(), nameEn: formData.nameEn.trim(),
      code: formData.code.trim().toUpperCase(), domainName: formData.domainName,
      dataType: formData.dataType as Standard['dataType'], owner: formData.owner.trim(),
      meaning: formData.meaning.trim(),
      valueRange: formData.valueRange.trim() || '无特殊限制',
      example: formData.example.trim() || '无',
    };

    createApply({
      type: formType,
      standardId: editStandardId || undefined,
      standardData,
      applicant: '当前用户',
      applyReason: formData.applyReason.trim(),
    });

    handleCloseForm();
  };

  const handleWithdraw = (id: string) => {
    const ok = withdrawApply(id);
    if (ok) setWithdrawConfirm(null);
  };

  const handleConfirmImport = () => {
    const result = confirmBatchImport();
    setImportResult(result);
    setTimeout(() => setImportResult(null), 5000);
    setActiveTab('my-applies');
  };

  const gotoAuditAndSelect = (applyId: string) => {
    navigate('/audit', { state: { focusApplyId: applyId } });
  };

  const findStandardFromApply = (apply: any): Standard | undefined => {
    if (apply.type === 'create' && apply.status === 'approved') {
      return standards.find(s => s.code === apply.standardData.code);
    }
    if (apply.standardId) return getStandardById(apply.standardId);
    return undefined;
  };

  const startEditRow = (idx: number) => {
    setEditingRow(idx);
    setRowDraft({ ...batchData[idx] });
  };

  const cancelEditRow = () => {
    setEditingRow(null);
    setRowDraft(null);
  };

  const saveRowDraft = () => {
    if (editingRow === null || !rowDraft) return;
    updateBatchItem(editingRow, {
      nameCn: rowDraft.nameCn, nameEn: rowDraft.nameEn,
      code: rowDraft.code, domain: rowDraft.domain,
    });
    setEditingRow(null);
    setRowDraft(null);
  };

  const submitSingleRow = (idx: number) => {
    const applyId = validateAndSubmitBatchItem(idx);
    if (applyId) {
      setSingleResultMsg(`已修复并生成申请：${applyId}`);
      setTimeout(() => setSingleResultMsg(null), 4000);
    }
  };

  return (
    <Layout title="标准申请" subtitle="提交新增或修改标准的申请">
      <div className="space-y-4">
        {importResult && (
          <div className="bg-success-50 border border-success-200 text-success-700 rounded-lg px-4 py-3 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-medium">批量导入完成！</span>
              <span className="ml-2">成功生成 {importResult.success} 条待审核申请</span>
              {importResult.failed > 0 && (
                <span className="ml-2 text-danger-600">，{importResult.failed} 条数据因异常已跳过（仍保留在列表中可修复）</span>
              )}
            </div>
            <button onClick={() => setActiveTab('batch-import')} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              查看异常行 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {singleResultMsg && (
          <div className="bg-primary-50 border border-primary-200 text-primary-700 rounded-lg px-4 py-3 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>{singleResultMsg}</div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('my-applies')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'my-applies' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                我的申请
                <Tag variant="default" className="ml-1">{filteredApplies.length}</Tag>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('batch-import')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'batch-import' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                批量导入
                {batchData.some(d => d.error) && (
                  <Tag variant="danger" className="ml-1">{batchData.filter(d => d.error).length}</Tag>
                )}
              </span>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'my-applies' && (
              <div>
                {/* 面包屑联动提示 */}
                {highlightBreadcrumb && (highlightBreadcrumb.standard || highlightBreadcrumb.applyId) && (
                  <div className="mb-4 bg-gradient-to-r from-accent-50 to-primary-50 border border-accent-100 rounded-lg px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      {highlightBreadcrumb.standard && (
                        <>
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <Database className="w-4 h-4 text-accent-600" />
                            标准：<span className="font-medium">{highlightBreadcrumb.standard.nameCn}</span>
                            <span className="font-mono text-xs text-slate-500">({highlightBreadcrumb.standard.code})</span>
                          </span>
                          <button
                            onClick={() => navigate(`/standard/${highlightBreadcrumb.standard!.id}`, {
                              state: { focusTab: 'ledger' },
                            })}
                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 bg-white/60 hover:bg-white px-2.5 py-1 rounded-md transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            打开详情
                          </button>
                          <button
                            onClick={() => navigate('/audit', {
                              state: { fromStandardId: highlightBreadcrumb.standard!.id },
                            })}
                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 bg-white/60 hover:bg-white px-2.5 py-1 rounded-md transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            审核记录
                          </button>
                          <button
                            onClick={() => navigate('/reference', {
                              state: { focusStandardId: highlightBreadcrumb.standard!.id },
                            })}
                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 bg-white/60 hover:bg-white px-2.5 py-1 rounded-md transition-colors"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            引用查询
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setHighlightBreadcrumb(null);
                        setHighlightStandardId(null);
                        setHighlightApplyId(null);
                      }}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      清除定位
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 text-xs rounded transition-colors ${filterStatus === status ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                      >
                        {status === 'all' ? '全部' : statusConfig[status as keyof typeof statusConfig]?.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleOpenCreateForm}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />新增标准
                  </button>
                </div>

                <div className="space-y-3">
                  {filteredApplies.length > 0 ? (
                    filteredApplies.map((apply) => {
                      const statusCfg = statusConfig[apply.status as keyof typeof statusConfig];
                      const StatusIcon = statusCfg.icon;
                      const linkedStd = findStandardFromApply(apply);
                      const isHighlightByApply = apply.id === highlightApplyId;
                      const isHighlightByStandard = highlightStandardId && (
                        apply.standardId === highlightStandardId ||
                        (apply.type === 'create' && apply.status === 'approved' &&
                          linkedStd?.id === highlightStandardId)
                      );
                      const isHighlighted = isHighlightByApply || isHighlightByStandard;
                      return (
                        <div
                          key={apply.id}
                          className={`border rounded-lg p-4 transition-colors ${
                            isHighlighted
                              ? 'border-primary-300 ring-2 ring-primary-200 bg-gradient-to-r from-primary-50/50 to-transparent shadow-sm'
                              : 'border-slate-200 hover:border-primary-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h4 className="font-medium text-slate-800">
                                  {apply.standardData.nameCn || apply.standardData.code || '未命名标准'}
                                </h4>
                                {apply.standardData.code && (
                                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                                    {apply.standardData.code}
                                  </code>
                                )}
                                <Tag variant="accent">{typeLabels[apply.type]}</Tag>
                                <Tag variant={statusCfg.variant}>
                                  <span className="flex items-center gap-1"><StatusIcon className="w-3 h-3" />{statusCfg.label}</span>
                                </Tag>
                                {apply.standardData.domainName && <Tag variant="default">{apply.standardData.domainName}</Tag>}
                                <span className="text-xs text-slate-400 font-mono">#{apply.id}</span>
                              </div>

                              {apply.standardData.meaning && (
                                <div className="mb-2">
                                  <p className="text-xs text-slate-400 mb-1">标准含义</p>
                                  <p className="text-sm text-slate-600 bg-slate-50 rounded px-3 py-2 line-clamp-2">
                                    {apply.standardData.meaning}
                                  </p>
                                </div>
                              )}

                              <div className="grid grid-cols-3 gap-4 mb-2">
                                {apply.standardData.valueRange && (
                                  <div>
                                    <p className="text-xs text-slate-400 mb-1">取值范围</p>
                                    <p className="text-sm text-slate-600 line-clamp-1">{apply.standardData.valueRange}</p>
                                  </div>
                                )}
                                {apply.standardData.example && (
                                  <div>
                                    <p className="text-xs text-slate-400 mb-1">示例</p>
                                    <p className="text-sm text-slate-600 line-clamp-1">{apply.standardData.example}</p>
                                  </div>
                                )}
                                {apply.standardData.owner && (
                                  <div>
                                    <p className="text-xs text-slate-400 mb-1">负责人</p>
                                    <p className="text-sm text-slate-600">{apply.standardData.owner}</p>
                                  </div>
                                )}
                              </div>

                              <div className="bg-amber-50 border border-amber-100 rounded px-3 py-2 mb-3">
                                <p className="text-xs text-amber-600">
                                  <span className="font-medium">申请原因：</span>{apply.applyReason}
                                </p>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                                <span className="flex items-center gap-1"><User className="w-3 h-3" />申请人：{apply.applicant}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />提交时间：{apply.submitTime}</span>
                                {apply.auditRecords.length > 0 && (
                                  <span className="text-primary-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />已审核 {apply.auditRecords.length} 次</span>
                                )}
                              </div>

                              {apply.auditRecords.length > 0 && (
                                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                                  {apply.auditRecords.map((record) => (
                                    <div
                                      key={record.id}
                                      className={`rounded-lg p-3 text-sm ${record.result === 'approved' ? 'bg-success-50 border border-success-100' : 'bg-danger-50 border border-danger-100'}`}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                          {record.result === 'approved' ? <Check className="w-4 h-4 text-success-600" /> : <X className="w-4 h-4 text-danger-600" />}
                                          <span className={record.result === 'approved' ? 'text-success-700 font-medium' : 'text-danger-700 font-medium'}>
                                            {record.auditor} · {record.result === 'approved' ? '审核通过' : '审核驳回'}
                                          </span>
                                        </div>
                                        <span className="text-xs text-slate-400">{record.auditTime}</span>
                                      </div>
                                      <p className="text-slate-600 text-xs mt-1"><span className="font-medium">审核意见：</span>{record.comment}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              {linkedStd && (
                                <button
                                  onClick={() => navigate(`/standard/${linkedStd.id}`)}
                                  className="text-xs text-slate-500 hover:text-primary-600 flex items-center gap-1"
                                  title="查看标准详情"
                                >
                                  <Eye className="w-3.5 h-3.5" />查看标准
                                </button>
                              )}
                              {apply.status === 'pending' && withdrawConfirm !== apply.id && (
                                <button
                                  onClick={() => setWithdrawConfirm(apply.id)}
                                  className="p-2 text-slate-400 hover:text-danger-500 hover:bg-danger-50 rounded transition-colors"
                                  title="撤回申请"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              {apply.status === 'pending' && withdrawConfirm === apply.id && (
                                <div className="flex items-center gap-1 bg-danger-50 border border-danger-200 rounded px-2 py-1">
                                  <span className="text-xs text-danger-600">确认撤回？</span>
                                  <button onClick={() => handleWithdraw(apply.id)} className="text-xs bg-danger-600 text-white px-2 py-0.5 rounded hover:bg-danger-700">确认</button>
                                  <button onClick={() => setWithdrawConfirm(null)} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-0.5">取消</button>
                                </div>
                              )}
                              <button
                                onClick={() => gotoAuditAndSelect(apply.id)}
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                              >
                                查看审核 <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>暂无申请记录</p>
                      <p className="text-xs mt-1">点击右上角"新增标准"按钮提交申请</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'batch-import' && (
              <div className="space-y-6">
                <div
                  className={`border-2 rounded-lg p-8 text-center transition-colors cursor-pointer ${!batchImported ? 'border-dashed border-slate-300 hover:border-primary-400' : 'border-solid border-success-300 bg-success-50/30'}`}
                  onClick={() => !batchImported && setBatchImported(true)}
                >
                  {!batchImported ? (
                    <>
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 mb-1">点击或拖拽文件到此处上传</p>
                      <p className="text-xs text-slate-400">支持 .xlsx / .xls 格式，单个文件不超过 10MB</p>
                      <button className="mt-4 px-4 py-2 text-sm text-primary-600 border border-primary-200 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors">
                        选择文件
                      </button>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-700 mb-1">标准导入模板.xlsx</p>
                      <p className="text-xs text-slate-400 mb-3">25.6KB · 已上传</p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setBatchImported(false); resetBatchData(); }}
                          className="text-xs text-danger-600 hover:text-danger-700"
                        >
                          重新上传
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    不确定模板格式？
                    <button className="text-primary-600 hover:text-primary-700 ml-1">
                      <span className="flex items-center gap-1 inline-flex">
                        <Download className="w-3.5 h-3.5" />下载导入模板
                      </span>
                    </button>
                  </div>
                  {batchData.length > 0 && (
                    <button
                      onClick={resetBatchData}
                      className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      <RefreshCcw className="w-3 h-3" />重置数据
                    </button>
                  )}
                </div>

                {batchImported && (
                  <div className="border border-slate-200 rounded-lg">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-sm font-medium text-slate-700">数据预览（支持行内修改异常数据）</h4>
                      <div className="flex items-center gap-2 text-xs">
                        <Tag variant="success">{batchData.filter(d => !d.error && !d.imported).length} 条有效待提交</Tag>
                        <Tag variant="default">{batchData.filter(d => d.imported).length} 条已生成申请</Tag>
                        <Tag variant="danger">{batchData.filter(d => d.error).length} 条异常</Tag>
                        <Tag variant="default">共 {batchData.length} 条</Tag>
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
                            <th className="text-right py-2.5 px-4 font-medium text-slate-600">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batchData.map((item, idx) => {
                            const isEditing = editingRow === idx;
                            const data = isEditing ? rowDraft : item;
                            return (
                              <tr
                                key={idx}
                                className={`${idx !== batchData.length - 1 ? 'border-b border-slate-100' : ''} ${item.error && !isEditing ? 'bg-danger-50/30' : ''}`}
                              >
                                <td className="py-3 px-4">
                                  {isEditing ? (
                                    <input
                                      value={data?.nameCn || ''}
                                      onChange={(e) => setRowDraft({ ...rowDraft, nameCn: e.target.value })}
                                      className="w-full h-8 px-2 bg-white border border-primary-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    />
                                  ) : (
                                    <span className={`${item.error ? 'text-danger-700 font-medium' : 'text-slate-700'}`}>{item.nameCn}</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {isEditing ? (
                                    <input
                                      value={data?.nameEn || ''}
                                      onChange={(e) => setRowDraft({ ...rowDraft, nameEn: e.target.value })}
                                      className="w-full h-8 px-2 bg-white border border-primary-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    />
                                  ) : <span className="text-slate-500">{item.nameEn}</span>}
                                </td>
                                <td className="py-3 px-4">
                                  {isEditing ? (
                                    <input
                                      value={data?.code || ''}
                                      onChange={(e) => setRowDraft({ ...rowDraft, code: e.target.value.toUpperCase() })}
                                      className="w-full h-8 px-2 bg-white border border-primary-300 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    />
                                  ) : <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">{item.code}</code>}
                                </td>
                                <td className="py-3 px-4">
                                  {isEditing ? (
                                    <select
                                      value={data?.domain || ''}
                                      onChange={(e) => setRowDraft({ ...rowDraft, domain: e.target.value })}
                                      className="w-full h-8 px-2 bg-white border border-primary-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    >
                                      <option>客户域</option><option>产品域</option><option>交易域</option>
                                      <option>账务域</option><option>风控域</option>
                                    </select>
                                  ) : <span className="text-slate-500">{item.domain}</span>}
                                </td>
                                <td className="py-3 px-4 min-w-[180px]">
                                  {isEditing ? (
                                    <div className="text-xs text-primary-600 flex items-center gap-1">
                                      <Edit3 className="w-3 h-3" />编辑中，保存后重新校验
                                    </div>
                                  ) : item.imported ? (
                                    <div className="flex items-center gap-1 text-primary-600">
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      <span className="text-xs">{item.status}</span>
                                    </div>
                                  ) : item.error ? (
                                    <div>
                                      <div className="flex items-center gap-1 text-danger-600">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="text-xs">{item.error}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <Tag variant="success">{item.status}</Tag>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  {isEditing ? (
                                    <div className="flex items-center justify-end gap-1">
                                      <button onClick={saveRowDraft} className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-success-600 rounded hover:bg-success-700">
                                        <Save className="w-3 h-3" />保存
                                      </button>
                                      <button onClick={cancelEditRow} className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 rounded">
                                        取消
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end gap-1">
                                      {!item.imported && !item.error && (
                                        <button
                                          onClick={() => submitSingleRow(idx)}
                                          className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-primary-600 rounded hover:bg-primary-700"
                                          title="单独提交该行"
                                        >
                                          <CheckCircle className="w-3 h-3" />提交
                                        </button>
                                      )}
                                      {item.error && (
                                        <button onClick={() => startEditRow(idx)} className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-warning-500 rounded hover:bg-warning-600">
                                          <Edit3 className="w-3 h-3" />修复
                                        </button>
                                      )}
                                      <button
                                        onClick={() => removeBatchItem(idx)}
                                        className="p-1 text-slate-400 hover:text-danger-500 rounded hover:bg-danger-50"
                                        title="移除该行"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-3 bg-slate-50 rounded-b-lg flex items-center justify-between flex-wrap gap-2">
                      <p className="text-xs text-slate-500">
                        <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-warning-500" />
                        异常行可点击「修复」直接修改，改完点「保存」→ 再点「提交」单独走审核；或直接「确认导入」批量处理有效行
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setBatchImported(false); resetBatchData(); }}
                          className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleConfirmImport}
                          className="px-4 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 className="w-4 h-4" />
                          确认导入并生成申请
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-lg font-medium text-slate-800">
                    {formType === 'create' ? '新增标准申请' : '修改标准申请'}
                  </h3>
                  {formType === 'update' && (
                    <p className="text-xs text-slate-400 mt-0.5">修改已发布的标准定义，审核通过后将生成新版本</p>
                  )}
                </div>
                <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600 p-1">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitApply} className="p-6 space-y-4 overflow-y-auto flex-1">
                {formError && (
                  <div className="bg-danger-50 border border-danger-200 text-danger-700 rounded-md px-4 py-2.5 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">中文名 <span className="text-danger-500">*</span></label>
                    <input type="text" value={formData.nameCn} onChange={(e) => handleInputChange('nameCn', e.target.value)} placeholder="请输入标准中文名"
                      className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">英文名 <span className="text-danger-500">*</span></label>
                    <input type="text" value={formData.nameEn} onChange={(e) => handleInputChange('nameEn', e.target.value)} placeholder="请输入标准英文名"
                      className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">标准编码 <span className="text-danger-500">*</span></label>
                    <input type="text" value={formData.code} onChange={(e) => handleInputChange('code', e.target.value)} placeholder="如：CUST_ID（自动转为大写）"
                      className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">所属业务域 <span className="text-danger-500">*</span></label>
                    <select value={formData.domainName} onChange={(e) => handleInputChange('domainName', e.target.value)}
                      className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                      <option value="">请选择业务域</option>
                      <option>客户域</option><option>产品域</option><option>交易域</option><option>账务域</option><option>风控域</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">数据类型 <span className="text-danger-500">*</span></label>
                    <select value={formData.dataType} onChange={(e) => handleInputChange('dataType', e.target.value)}
                      className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                      <option value="string">字符串</option><option value="number">数值</option><option value="boolean">布尔</option>
                      <option value="date">日期</option><option value="enum">枚举</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">标准负责人 <span className="text-danger-500">*</span></label>
                    <input type="text" value={formData.owner} onChange={(e) => handleInputChange('owner', e.target.value)} placeholder="请输入负责人姓名"
                      className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">标准含义 <span className="text-danger-500">*</span></label>
                  <textarea rows={3} value={formData.meaning} onChange={(e) => handleInputChange('meaning', e.target.value)}
                    placeholder="请详细描述标准的含义和业务规则"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">取值范围</label>
                  <textarea rows={2} value={formData.valueRange} onChange={(e) => handleInputChange('valueRange', e.target.value)}
                    placeholder="请描述标准的取值范围或约束条件"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">示例</label>
                  <input type="text" value={formData.example} onChange={(e) => handleInputChange('example', e.target.value)}
                    placeholder="请输入标准的使用示例"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">申请原因 <span className="text-danger-500">*</span></label>
                  <textarea rows={2} value={formData.applyReason} onChange={(e) => handleInputChange('applyReason', e.target.value)}
                    placeholder="请说明申请新增/修改的原因和业务背景"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none" />
                </div>
              </form>

              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 flex-shrink-0 bg-slate-50">
                <button type="button" onClick={handleCloseForm}
                  className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors">取消</button>
                <button type="submit" onClick={handleSubmitApply}
                  className="px-5 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors font-medium">提交申请</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
