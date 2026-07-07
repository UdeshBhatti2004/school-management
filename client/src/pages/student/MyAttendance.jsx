import { CalendarCheck, Check, X, Clock } from 'lucide-react';
import { useGetMyAttendanceQuery } from '../../features/attendance/attendanceApi';
import { PageHeader, StatCard } from '../../components/ui/blocks';
import { Card, Spinner, Badge, EmptyState } from '../../components/ui/primitives';
const toneFor = (status) => (status === 'present' ? 'green' : status === 'late' ? 'amber' : 'rose');
const iconFor = (status) => (status === 'present' ? Check : status === 'late' ? Clock : X);
const fmt = (d) => new Date(d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

export default function MyAttendance() {
  const { data, isLoading: loading } = useGetMyAttendanceQuery();
  const summary = data?.summary;
  const history = data?.history || [];

  return (
    <div>
      <PageHeader title="My attendance" subtitle="Track your attendance and attendance percentage." />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : !summary || summary.total === 0 ? (
        <Card><EmptyState icon={CalendarCheck} title="No attendance yet" description="Your attendance will appear once teachers start marking it." /></Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={CalendarCheck} label="Attendance" value={`${summary.percent}%`} tone="brand" index={0} />
            <StatCard icon={Check} label="Present" value={summary.present} tone="emerald" index={1} />
            <StatCard icon={Clock} label="Late" value={summary.late} tone="amber" index={2} />
            <StatCard icon={X} label="Absent" value={summary.absent} tone="sky" index={3} />
          </div>

          <Card className="mt-6 divide-y divide-slate-100">
            <div className="px-5 py-3 text-sm font-semibold text-ink-900">History</div>
            {history.map((h, i) => {
              const Icon = iconFor(h.status);
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-ink-500"><CalendarCheck size={16} /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-800">{fmt(h.date)}</p>
                    <p className="text-xs text-ink-400">
  Marked by {h.markedBy || "—"}
</p>
                  </div>
                  <Badge tone={toneFor(h.status)} className="capitalize"><Icon size={12} /> {h.status}</Badge>
                </div>
              );
            })}
          </Card>
        </>
      )}
    </div>
  );
}
