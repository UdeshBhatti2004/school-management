import { Link } from 'react-router-dom';
import { GraduationCap, Users, School, FileText, Video, ArrowRight, Megaphone, Wallet, CalendarCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetOverviewStatsQuery } from '../../features/dashboard/dashboardApi';
import { useGetAnnouncementsQuery } from '../../features/announcements/announcementApi';
import { PageHeader, StatCard } from '../../components/ui/blocks';
import { Card, Spinner, Badge } from '../../components/ui/primitives';

export default function AdminDashboard() {
  const user = useSelector(selectCurrentUser);

  // Cached + deduped by RTK Query: navigating away and back to this page no
  // longer re-fires the request unless the cache was invalidated (e.g. a
  // teacher/student was added or removed) or the data went stale.
  const {
  data: stats,
  isLoading: loading,
} = useGetOverviewStatsQuery(undefined, {
  refetchOnMountOrArgChange: true,
});
  const { data: announcements } = useGetAnnouncementsQuery(undefined, {
  refetchOnMountOrArgChange: true,
});

  const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
  const cards = [
    { label: 'Teachers', value: stats?.teachers ?? 0, icon: GraduationCap, tone: 'brand', to: '/app/teachers' },
    { label: 'Students', value: stats?.students ?? 0, icon: Users, tone: 'emerald', to: '/app/students' },
    { label: 'Classes', value: stats?.classes ?? 0, icon: School, tone: 'violet', to: '/app/classes' },
    { label: 'Fees due', value: inr(stats?.outstanding), icon: Wallet, tone: 'amber', to: '/app/fees' },
    { label: 'Lectures', value: stats?.lectures ?? 0, icon: Video, tone: 'sky', to: '/app/announcements' },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Admin'}`} subtitle="Here's an overview of your school today." />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {cards.map((c, i) => (
            <Link key={c.label} to={c.to}>
              <StatCard icon={c.icon} label={c.label} value={c.value} tone={c.tone} index={i} />
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-ink-900">Quick actions</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <QuickLink to="/app/teachers" icon={GraduationCap} title="Add a teacher" desc="Onboard teaching staff" />
            <QuickLink to="/app/students" icon={Users} title="Enroll a student" desc="Add student records" />
            <QuickLink to="/app/classes" icon={School} title="Create a class" desc="Set up grades & sections" />
            <QuickLink to="/app/fees" icon={Wallet} title="Issue fees" desc="Bill students or classes" />
            <QuickLink to="/app/attendance" icon={CalendarCheck} title="View attendance" desc="Per-class summaries" />
            <QuickLink to="/app/announcements" icon={Megaphone} title="Post announcement" desc="Notify the whole school" />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink-900">Recent announcements</h2>
          {(announcements || []).length === 0 ? (
            <p className="text-sm text-ink-400">No announcements yet.</p>
          ) : (
            <ul className="space-y-3">
              {announcements.slice(0, 4).map((a) => (
                <li key={a._id} className="border-l-2 border-brand-200 pl-3">
                  <p className="text-sm font-medium text-ink-800">{a.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">{a.body}</p>
                  <Badge tone="slate" className="mt-1.5 capitalize">{a.audience}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, title, desc }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-ink-600 transition-colors group-hover:bg-brand-100 group-hover:text-brand-600">
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-ink-800">{title}</p>
        <p className="text-xs text-ink-400">{desc}</p>
      </div>
      <ArrowRight size={16} className="text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
    </Link>
  );
}
