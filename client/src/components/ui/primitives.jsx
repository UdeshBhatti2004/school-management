import { cn } from '../../lib/cn';

/* ---------------- Button ---------------- */
const buttonVariants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 shadow-sm disabled:bg-brand-300',
  secondary:
    'bg-white text-ink-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
  ghost: 'text-ink-600 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300',
  subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
};
const buttonSizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-[15px]',
  icon: 'h-9 w-9',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------------- Label ---------------- */
export function Label({ className, children, ...props }) {
  return (
    <label className={cn('block text-sm font-medium text-ink-700 mb-1.5', className)} {...props}>
      {children}
    </label>
  );
}

/* ---------------- Input ---------------- */
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full h-10 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus-visible:outline-none disabled:bg-slate-50',
        className
      )}
      {...props}
    />
  );
}

/* ---------------- Textarea ---------------- */
export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus-visible:outline-none',
        className
      )}
      {...props}
    />
  );
}

/* ---------------- Select ---------------- */
export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink-800 transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus-visible:outline-none',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

/* ---------------- Card ---------------- */
export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('rounded-xl border border-slate-200/80 bg-white shadow-card', className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* ---------------- Badge ---------------- */
const badgeTones = {
  slate: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-50 text-brand-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
};
export function Badge({ tone = 'slate', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------------- Spinner ---------------- */
export function Spinner({ className }) {
  return (
    <div
      className={cn(
        'h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600',
        className
      )}
    />
  );
}

/* ---------------- EmptyState ---------------- */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-ink-400">
          <Icon size={22} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
