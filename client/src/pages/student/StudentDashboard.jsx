import { Link } from 'react-router-dom';
import { BookCopy, Video, Award, Calendar, ArrowRight, Clock } from 'lucide-react';
import { useGetAssignmentsQuery } from '../../features/assignments/assignmentApi';
import { useGetLecturesQuery } from '../../features/lectures/lectureApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { PageHeader, StatCard } from '../../components/ui/blocks';
import { Card, Spinner, Badge } from '../../components/ui/primitives';

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export default function StudentDashboard() {
  const user = useSelector(selectCurrentUser);
  const {
  data: assignments,
  isLoading: loading,
} = useGetAssignmentsQuery(undefined, {
  refetchOnMountOrArgChange: true,
});
  const { data: lectures } = useGetLecturesQuery(undefined, {
  refetchOnMountOrArgChange: true,
});

  const pending = (assignments || []).filter((a) => !a.mySubmission);
  const graded = (assignments || []).filter((a) => a.mySubmission?.status === 'graded');
  const upcoming = pending
    .slice()
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`Hi, ${user?.name?.split(' ')[0] || 'Student'}`}
        subtitle="Stay on top of your assignments and lectures." />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link to="/app/assignments"><StatCard icon={BookCopy} label="To submit" value={pending.length} tone="amber" index={0} /></Link>
          <Link to="/app/assignments"><StatCard icon={Award} label="Graded" value={graded.length} tone="emerald" index={1} /></Link>
          <Link to="/app/lectures"><StatCard icon={Video} label="Lectures" value={lectures?.length ?? 0} tone="sky" index={2} /></Link>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">Due soon</h2>
            <Link to="/app/assignments" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">All <ArrowRight size={14} /></Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-400">You're all caught up.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((a) => {
                const overdue = new Date(a.dueDate) < new Date();
                return (
                  <li key={a._id} className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${overdue ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                      <Clock size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-800">{a.title}</p>
                      <p className="text-xs text-ink-400">{a.subject || a.classRoom?.name}</p>
                    </div>
                    <Badge tone={overdue ? 'rose' : 'amber'}><Calendar size={12} /> {fmtDate(a.dueDate)}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">Latest lectures</h2>
            <Link to="/app/lectures" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">All <ArrowRight size={14} /></Link>
          </div>
          {(lectures || []).length === 0 ? (
            <p className="text-sm text-ink-400">No lectures posted yet.</p>
          ) : (
            <ul className="space-y-3">
              {lectures.slice(0, 5).map((l) => (
                <li key={l._id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600"><Video size={16} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-800">{l.title}</p>
                    <p className="text-xs text-ink-400">{l.createdBy?.name}</p>
                  </div>
                  {l.subject && <Badge tone="slate">{l.subject}</Badge>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
