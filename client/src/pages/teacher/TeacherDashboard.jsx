import { Link } from 'react-router-dom';
import { FileText, Video, Calendar, Megaphone, ArrowRight } from 'lucide-react';
import { useGetAssignmentsQuery } from '../../features/assignments/assignmentApi';
import { useGetLecturesQuery } from '../../features/lectures/lectureApi';
import { useGetAnnouncementsQuery } from '../../features/announcements/announcementApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { PageHeader, StatCard } from '../../components/ui/blocks';
import { Card, Spinner, Badge } from '../../components/ui/primitives';

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export default function TeacherDashboard() {
  const user = useSelector(selectCurrentUser);
  const { data: assignments, isLoading: loading } = useGetAssignmentsQuery();
  const { data: lectures } = useGetLecturesQuery();
  const { data: announcements } = useGetAnnouncementsQuery();

  const upcoming = (assignments || [])
    .filter((a) => new Date(a.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
  title={`Hello, ${user?.name?.split(' ')[0] || 'Teacher'}`} subtitle="Your teaching activity at a glance." />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <Link to="/app/assignments"><StatCard icon={FileText} label="Assignments" value={assignments?.length ?? 0} tone="brand" index={0} /></Link>
          <Link to="/app/lectures"><StatCard icon={Video} label="Lectures" value={lectures?.length ?? 0} tone="sky" index={1} /></Link>
          <Link to="/app/announcements"><StatCard icon={Megaphone} label="Announcements" value={announcements?.length ?? 0} tone="amber" index={2} /></Link>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">Upcoming due dates</h2>
            <Link to="/app/assignments" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              All <ArrowRight size={14} />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-400">Nothing due soon.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((a) => (
                <li key={a._id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Calendar size={16} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-800">{a.title}</p>
                    <p className="text-xs text-ink-400">{a.classRoom?.name} · {a.classRoom?.section}</p>
                  </div>
                  <Badge tone="slate">Due {fmtDate(a.dueDate)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink-900">Recent announcements</h2>
          {(announcements || []).length === 0 ? (
            <p className="text-sm text-ink-400">No announcements.</p>
          ) : (
            <ul className="space-y-3">
              {announcements.slice(0, 4).map((a) => (
                <li key={a._id} className="border-l-2 border-brand-200 pl-3">
                  <p className="text-sm font-medium text-ink-800">{a.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">{a.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
