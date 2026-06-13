import { cn } from '@/lib/utils';

type TagVariant = 'default' | 'success' | 'warning' | 'danger' | 'primary' | 'accent';

interface TagProps {
  variant?: TagVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<TagVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  danger: 'bg-danger-50 text-danger-600',
  primary: 'bg-primary-50 text-primary-700',
  accent: 'bg-accent-50 text-accent-600',
};

export function Tag({ variant = 'default', children, className }: TagProps) {
  return (
    <span
      className={cn(
      'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded',
      variantStyles[variant],
      className
    )}
    >
      {children}
    </span>
  );
}
