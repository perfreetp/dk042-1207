export interface BusinessDomain {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  children?: BusinessDomain[];
  standardCount: number;
}

export interface Synonym {
  id: string;
  name: string;
  type: 'alias' | 'abbreviation';
}

export interface ForbiddenWord {
  id: string;
  name: string;
  reason: string;
}

export interface EnumValue {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface Standard {
  id: string;
  nameCn: string;
  nameEn: string;
  code: string;
  domainId: string;
  domainName: string;
  status: 'draft' | 'effective' | 'deprecated';
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'enum';
  meaning: string;
  valueRange: string;
  example: string;
  owner: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  synonyms: Synonym[];
  forbiddenWords: ForbiddenWord[];
  enumValues: EnumValue[];
}

export interface StandardVersion {
  id: string;
  standardId: string;
  version: string;
  content: Partial<Standard>;
  changeLog: string;
  operator: string;
  createdAt: string;
}

export interface AuditRecord {
  id: string;
  requestId: string;
  auditor: string;
  result: 'approved' | 'rejected';
  comment: string;
  auditTime: string;
}

export interface ApplyRequest {
  id: string;
  type: 'create' | 'update' | 'deprecated';
  status: 'pending' | 'approved' | 'rejected';
  standardId?: string;
  standardData: Partial<Standard>;
  applicant: string;
  applyReason: string;
  submitTime: string;
  auditRecords: AuditRecord[];
}

export interface BusinessSystem {
  id: string;
  name: string;
  code: string;
  description: string;
  owner: string;
  standardCount: number;
}

export interface Reference {
  id: string;
  standardId: string;
  standardName: string;
  systemId: string;
  systemName: string;
  usage: string;
  referencedAt: string;
}

export interface User {
  id: string;
  name: string;
  role: 'user' | 'owner' | 'admin';
  avatar?: string;
}

export type FilterStatus = 'all' | 'effective' | 'draft' | 'deprecated';
export type FilterTimeRange = 'all' | 'today' | 'week' | 'month' | 'quarter';
