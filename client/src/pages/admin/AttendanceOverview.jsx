import { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { useGetClassesQuery } from '../../features/classes/classApi';
import { useGetClassSummaryQuery } from '../../features/attendance/attendanceApi';
import { PageHeader } from '../../components/ui/blocks';
import { Card, Select, Label, Spinner, EmptyState, Badge } from '../../components/ui/primitives';

const percentTone = (p) => (p >= 75 ? 'green' : p >= 50 ? 'amber' : 'rose');

export default function AttendanceOverview() {
  const { data: classes } = useGetClassesQuery();
  const [classId, setClassId] = useState('');
  const { data: summary, isLoading: loading } = useGetClassSummaryQuery(classId, { skip: !classId });

  return (
    <div>
      <PageHeader title="Attendance overview" subtitle="Per-student attendance by class." />

      <Card className="mb-5 max-w-sm p-5">
        <Label>Class</Label>
        <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">Select a class</option>
          {(classes || []).map((c) => <option key={c._id} value={c._id}>{c.name} · {c.section}</option>)}
        </Select>
      </Card>

      {!classId ? (
        <Card><EmptyState icon={CalendarCheck} title="Select a class" description="Choose a class to see attendance percentages." /></Card>
      ) : loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : !summary || summary.summary.length === 0 ? (
        <Card><EmptyState icon={CalendarCheck} title="No data" description="No students or attendance records for this class yet." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Roll no.</th>
                <th className="px-5 py-3">Present / Total</th>
                <th className="px-5 py-3">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {summary.summary.map((row) => (
                <tr key={row.student._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-ink-800">{row.student.name}</td>
                  <td className="px-5 py-3.5 text-ink-500">{row.student.rollNumber || '—'}</td>
                  <td className="px-5 py-3.5 text-ink-600">{row.present} / {row.total}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${row.percent >= 75 ? 'bg-emerald-500' : row.percent >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${row.percent}%` }} />
                      </div>
                      <Badge tone={percentTone(row.percent)}>{row.percent}%</Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}
    </div>
  );
}
