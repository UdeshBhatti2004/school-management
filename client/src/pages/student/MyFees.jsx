import { Wallet, CheckCircle2, Clock } from 'lucide-react';
import { useGetFeesQuery } from '../../features/fees/feeApi';
import { PageHeader, StatCard } from '../../components/ui/blocks';
import { Card, Badge, Spinner, EmptyState } from '../../components/ui/primitives';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmt = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const statusTone = { paid: 'green', partial: 'amber', pending: 'rose' };

export default function MyFees() {
  const { data: fees, isLoading: loading } = useGetFeesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const totalDue = (fees || []).reduce((s, f) => s + (f.amount - f.paidAmount), 0);
  const totalPaid = (fees || []).reduce((s, f) => s + f.paidAmount, 0);

  return (
    <div>
      <PageHeader title="My fees" subtitle="Your fee statements and payment status." />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : (fees || []).length === 0 ? (
        <Card><EmptyState icon={Wallet} title="No fees" description="You have no fee records at the moment." /></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard icon={Clock} label="Outstanding" value={inr(totalDue)} tone="amber" index={0} />
            <StatCard icon={CheckCircle2} label="Paid to date" value={inr(totalPaid)} tone="emerald" index={1} />
          </div>

          <div className="mt-6 space-y-3">
            {fees.map((f) => {
              const due = f.amount - f.paidAmount;
              const overdue = f.status !== 'paid' && new Date(f.dueDate) < new Date();
              return (
                <Card key={f._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Wallet size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-900 truncate">{f.title}</p>
                      <p className="text-xs text-ink-400 truncate">
                        Due {fmt(f.dueDate)}{f.paidDate ? ` · paid ${fmt(f.paidDate)}` : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4 border-t border-ink-100 pt-3 sm:border-0 sm:pt-0 sm:justify-end sm:text-right">
                    <div>
                      <p className="font-semibold text-ink-900">{inr(f.amount)}</p>
                      {due > 0 && <p className="text-xs text-rose-600">{inr(due)} due</p>}
                    </div>
                    <Badge tone={overdue ? 'rose' : statusTone[f.status]} className="capitalize shrink-0">
                      {overdue ? 'Overdue' : f.status}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}