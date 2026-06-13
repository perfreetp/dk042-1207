import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import type { BusinessDomain } from '@/types';
import { useStandardStore } from '@/store/useStandardStore';

interface DomainTreeProps {
  domains: BusinessDomain[];
  level?: number;
}

function DomainTreeNode({ domain, level = 0, selectedId, onSelect }: {
  domain: BusinessDomain;
  level?: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = domain.children && domain.children.length > 0;
  const isSelected = selectedId === domain.id;

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    }
    onSelect(domain.id);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-2 py-2 px-3 cursor-pointer rounded-md text-sm
          transition-colors duration-150
          ${isSelected
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-slate-700 hover:bg-slate-50'
          }
        `}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        {hasChildren ? (
          <span className="text-slate-400 w-4 h-4 flex items-center justify-center flex-shrink-0">
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        ) : (
          <span className="w-4 h-4 flex-shrink-0"></span>
        )}
        
        {hasChildren ? (
          expanded ? (
            <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
          )
        ) : (
          <Folder className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
        
        <span className="flex-1 truncate">{domain.name}</span>
        <span className={`
          text-xs px-1.5 py-0.5 rounded flex-shrink-0
          ${isSelected ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}
        `}>
          {domain.standardCount}
        </span>
      </div>

      {hasChildren && expanded && (
        <div>
          {domain.children!.map((child) => (
            <DomainTreeNode
              key={child.id}
              domain={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DomainTree({ domains }: DomainTreeProps) {
  const { selectedDomainId, setSelectedDomain } = useStandardStore();

  const handleSelect = (id: string | null) => {
    if (selectedDomainId === id) {
      setSelectedDomain(null);
    } else {
      setSelectedDomain(id);
    }
  };

  return (
    <div className="space-y-0.5">
      <div
        onClick={() => handleSelect(null)}
        className={`
          flex items-center gap-2 py-2 px-3 cursor-pointer rounded-md text-sm
          transition-colors duration-150
          ${selectedDomainId === null
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-slate-700 hover:bg-slate-50'
          }
        `}
      >
        <Folder className="w-4 h-4 text-primary-500 flex-shrink-0" />
        <span className="flex-1">全部标准</span>
        <span className={`
          text-xs px-1.5 py-0.5 rounded
          ${selectedDomainId === null ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}
        `}>
          128
        </span>
      </div>

      {domains.map((domain) => (
        <DomainTreeNode
          key={domain.id}
          domain={domain}
          level={0}
          selectedId={selectedDomainId}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
