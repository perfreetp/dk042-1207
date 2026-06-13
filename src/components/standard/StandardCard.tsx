import { useNavigate } from 'react-router-dom';
import { Clock, User, Hash } from 'lucide-react';
import type { Standard } from '@/types';
import { Tag } from '@/components/ui/Tag';

interface StandardCardProps {
  standard: Standard;
}

const statusConfig = {
  effective: { label: '生效中', variant: 'success' as const },
  draft: { label: '草稿', variant: 'warning' as const },
  deprecated: { label: '已停用', variant: 'default' as const },
};

const dataTypeLabels: Record<string, string> = {
  string: '字符串',
  number: '数值',
  boolean: '布尔',
  date: '日期',
  enum: '枚举',
};

export function StandardCard({ standard }: StandardCardProps) {
  const navigate = useNavigate();
  const status = statusConfig[standard.status];

  return (
    <div
      onClick={() => navigate(`/standard/${standard.id}`)}
      className="bg-white border border-slate-200 rounded-lg p-4 cursor-pointer
        transition-all duration-200 hover:shadow-card-hover hover:border-primary-200
        hover:-translate-y-0.5 group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-slate-800 group-hover:text-primary-700 transition-colors truncate">
              {standard.nameCn}
            </h3>
            <Tag variant={status.variant}>{status.label}</Tag>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-mono text-xs bg-slate-50 px-1.5 py-0.5 rounded">
              {standard.code}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs">{standard.nameEn}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-600 line-clamp-2 mb-3 min-h-[2.5rem]">
        {standard.meaning}
      </p>

      <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <Hash className="w-3.5 h-3.5" />
          <span>{dataTypeLabels[standard.dataType]}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="w-3.5 h-3.5" />
          <span>{standard.owner}</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Clock className="w-3.5 h-3.5" />
          <span>{standard.updatedAt}</span>
        </div>
      </div>

      {standard.synonyms.length > 0 && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">同义词：</span>
          <div className="flex flex-wrap gap-1">
            {standard.synonyms.slice(0, 3).map((syn) => (
              <Tag key={syn.id} variant="accent" className="text-[10px]">
                {syn.name}
              </Tag>
            ))}
            {standard.synonyms.length > 3 && (
              <Tag variant="default" className="text-[10px]">
                +{standard.synonyms.length - 3}
              </Tag>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
