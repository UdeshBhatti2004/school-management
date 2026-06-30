import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

const toneStyles = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  sky: 'bg-sky-50 text-sky-600',
  violet: 'bg-violet-50 text-violet-600',
};

export function StatCard({ icon: Icon, label, value, tone = 'brand', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-card"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', toneStyles[tone])}>
          {Icon && <Icon size={18} />}
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-ink-900">{value}</p>
    </motion.div>
  );
}
