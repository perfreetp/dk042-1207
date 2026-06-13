import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  FilePlus,
  CheckSquare,
  Link2,
  Database,
  Library,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '标准目录', icon: BookOpen },
  { path: '/apply', label: '标准申请', icon: FilePlus },
  { path: '/audit', label: '审核中心', icon: CheckSquare },
  { path: '/reference', label: '引用查询', icon: Link2 },
];

export function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="h-16 flex items-center px-5 border-b border-slate-200 bg-primary-700">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Library className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-base leading-tight">数据标准库</div>
            <div className="text-white/60 text-xs">Data Dictionary</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            end={item.path === '/'}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Database className="w-4 h-4" />
            <span>标准总量</span>
          </div>
          <div className="text-2xl font-bold text-primary-700">128</div>
          <div className="text-xs text-slate-400 mt-1">覆盖 5 个业务域</div>
        </div>
      </div>
    </aside>
  );
}
