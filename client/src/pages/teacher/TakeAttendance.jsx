import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Check, X, Clock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetClassesQuery, useLazyGetClassByIdQuery } from '../../features/classes/classApi';
import { useGetAttendanceQuery, useMarkAttendanceMutation } from '../../features/attendance/attendanceApi';
import { PageHeader } from '../../components/ui/blocks';
import { Button, Input, Label, Select, Card, Spinner, EmptyState, Badge } from '../../components/ui/primitives';
import { cn } from '../../lib/cn';
import { getErrMsg } from '../../lib/getErrMsg';
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";



const STATUSES = [
  { key: 'present', label: 'Present', icon: Check, tone: 'bg-emerald-600' },
  { key: 'late', label: 'Late', icon: Clock, tone: 'bg-amber-500' },
  { key: 'absent', label: 'Absent', icon: X, tone: 'bg-rose-600' },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function TakeAttendance() {
  const { data: classes } = useGetClassesQuery();
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(todayStr());
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);


  const user = useSelector(selectCurrentUser);

  // Roster comes from the class detail endpoint (separate cache entry, kept
  // warm across date/subject changes within the same class).
  const [fetchClass, { data: classDetail, isFetching: rosterLoading }] = useLazyGetClassByIdQuery();
  const students = classDetail?.students;



const filteredClasses = useMemo(() => {
  if (!classes) return [];

  if (user?.role === "admin") {
  return classes;
}

return classes.filter(
  (c) => c.classTeacher?._id === user?._id
);
}, [classes, user]);


useEffect(() => {
  if (
    user?.role === "teacher" &&
    filteredClasses.length === 1 &&
    !classId
  ) {
    setClassId(filteredClasses[0]._id);
  }
}, [user, filteredClasses, classId]);

  // Existing attendance sheet for this class+date — refetches automatically
  // whenever classId or date change because they're part of the query arg.
  const { data: existingSheet, isFetching: sheetLoading } =
  useGetAttendanceQuery(
    { classRoom: classId, date },
    {
      skip: !classId,
      refetchOnMountOrArgChange: true,
    }
  );
  const [markAttendance] = useMarkAttendanceMutation();

  useEffect(() => {
  if (classId) {
    fetchClass(classId);
  }
}, [classId, fetchClass]);

  // Seed the per-student status map whenever the roster or the existing
  // sheet for this subject changes.
  useEffect(() => {
  if (!students?.length) {
    setMarks({});
    return;
  }

  const existing = existingSheet?.[0];

  const init = {};

  students.forEach((s) => {
    const rec = existing?.records?.find(
      (r) => (r.student._id || r.student) === s._id
    );

    init[s._id] = rec?.status || "present";
  });

  setMarks(init);
}, [students, existingSheet]);

  const loading = Boolean(classId) && (rosterLoading || sheetLoading);

  const setStatus = (studentId, status) => setMarks((m) => ({ ...m, [studentId]: status }));
  const markAll = (status) => {
    const next = {};
    students.forEach((s) => (next[s._id] = status));
    setMarks(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      const records = students.map((s) => ({ student: s._id, status: marks[s._id] || 'present' }));
      await markAttendance({
  classRoom: classId,
  date,
  records,
}).unwrap();
      toast.success('Attendance saved');
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const counts = useMemo(() => {
  if (!students?.length) {
    return {
      present: 0,
      late: 0,
      absent: 0,
    };
  }

  return students.reduce(
    (acc, s) => {
      acc[marks[s._id] || "present"] += 1;
      return acc;
    },
    {
      present: 0,
      late: 0,
      absent: 0,
    }
  );
}, [students, marks]);

console.log("User:", user);
console.log("Filtered Classes:", filteredClasses);

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Mark attendance for your class." />

      <Card className="mb-5 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label>Class</Label>
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">Select a class</option>
              {filteredClasses.map((c) => (
  <option key={c._id} value={c._id}>
    {c.name} · {c.section}
  </option>
))}
            </Select>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayStr()} />
          </div>
        </div>
      </Card>

      {!classId ? (
        <Card><EmptyState icon={CalendarCheck} title="Pick a class" description="Choose a class above to load its students and start marking." /></Card>
      ) : loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : !students?.length ? (
  <Card>
    <EmptyState
      icon={CalendarCheck}
      title="No students"
      description="This class has no students assigned yet."
    />
  </Card>
) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <Badge tone="green">{counts.present} present</Badge>
              <Badge tone="amber">{counts.late} late</Badge>
              <Badge tone="rose">{counts.absent} absent</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => markAll('present')}>Mark all present</Button>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : <><Save size={15} /> Save</>}
              </Button>
            </div>
          </div>

          <Card className="divide-y divide-slate-100">
            {students?.map((s, i) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
                className="flex items-center gap-3 px-5 py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-ink-700">
                  {s.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-800">{s.name}</p>
                  {s.rollNumber && <p className="text-xs text-ink-400">{s.rollNumber}</p>}
                </div>
                <div className="flex gap-1.5">
                  {STATUSES.map((st) => {
                    const active = (marks[s._id] || 'present') === st.key;
                    return (
                      <button
                        key={st.key}
                        onClick={() => setStatus(s._id, st.key)}
                        className={cn(
                          'flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition-colors',
                          active ? `${st.tone} text-white` : 'bg-slate-100 text-ink-500 hover:bg-slate-200'
                        )}
                      >
                        <st.icon size={13} /> <span className="hidden sm:inline">{st.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}
