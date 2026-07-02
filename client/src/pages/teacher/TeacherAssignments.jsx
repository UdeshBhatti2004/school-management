import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Trash2, Users, Calendar, ClipboardCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetAssignmentsQuery, useCreateAssignmentMutation, useDeleteAssignmentMutation, useGetSubmissionsQuery, useGradeSubmissionMutation } from '../../features/assignments/assignmentApi';
import { useGetClassesQuery } from '../../features/classes/classApi';
import { PageHeader } from '../../components/ui/blocks';
import { Button, Input, Label, Select, Textarea, Card, Badge, Spinner, EmptyState } from '../../components/ui/primitives';
import Modal from '../../components/ui/Modal';
import {getErrMsg} from '../../lib/getErrMsg';

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

const emptyForm = { title: '', description: '', subject: '', classRoom: '', dueDate: '', maxMarks: 100, attachmentUrl: '' };

export default function TeacherAssignments() {
  const { data: assignments, isLoading: loading } =
  useGetAssignmentsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: classes } = useGetClassesQuery();
  const [createAssignment] = useCreateAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();
  const [gradeSubmission] = useGradeSubmissionMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // submissions viewer — querying by assignment id, cached per assignment
  const [active, setActive] = useState(null);
  const { data: subs, isLoading: subsLoading } = useGetSubmissionsQuery(active?._id, { skip: !active });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createAssignment({ ...form, maxMarks: Number(form.maxMarks) }).unwrap();
      toast.success('Assignment posted');
      setModalOpen(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a) => {
    if (!confirm(`Delete "${a.title}"? All submissions will be removed.`)) return;
    try {
      await deleteAssignment(a._id).unwrap();
      toast.success('Deleted');
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };

  const grade = async (sub, marks, feedback) => {
    try {
      await gradeSubmission({ submissionId: sub._id, assignmentId: active._id, marks: Number(marks), feedback }).unwrap();
      toast.success('Graded');
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle="Post work to your classes and review what students submit."
        action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> New assignment</Button>}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : (assignments || []).length === 0 ? (
        <Card>
          <EmptyState icon={FileText} title="No assignments yet" description="Create an assignment and it will appear for the selected class."
            action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> New assignment</Button>} />
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((a, i) => {
            const overdue = new Date(a.dueDate) < new Date();
            return (
              <motion.div key={a._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: Math.min(i * 0.03, 0.25) }}>
                <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-ink-900">{a.title}</h3>
                      {a.subject && <Badge tone="brand">{a.subject}</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                      <span className="flex items-center gap-1"><Users size={13} /> {a.classRoom?.name} · {a.classRoom?.section}</span>
                      <span className="flex items-center gap-1"><Calendar size={13} /> Due {fmtDate(a.dueDate)}</span>
                      <span>Max {a.maxMarks} marks</span>
                      {overdue && <Badge tone="amber">Past due</Badge>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setActive(a)}>
                      <ClipboardCheck size={15} /> Submissions
                    </Button>
                    <button onClick={() => handleDelete(a)} className="rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New assignment"
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Post assignment'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={set('title')} required />
          </div>
          <div>
            <Label>Instructions</Label>
            <Textarea rows={3} value={form.description} onChange={set('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Class</Label>
              <Select value={form.classRoom} onChange={set('classRoom')} required>
                <option value="">Select class</option>
                {(classes || []).map((c) => <option key={c._id} value={c._id}>{c.name} · {c.section}</option>)}
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={form.subject} onChange={set('subject')} placeholder="Physics" />
            </div>
            <div>
              <Label>Due date</Label>
              <Input type="date" value={form.dueDate} onChange={set('dueDate')} required />
            </div>
            <div>
              <Label>Max marks</Label>
              <Input type="number" value={form.maxMarks} onChange={set('maxMarks')} />
            </div>
          </div>
          <div>
            <Label>Attachment link (optional)</Label>
            <Input value={form.attachmentUrl} onChange={set('attachmentUrl')} placeholder="https://…" />
          </div>
        </form>
      </Modal>

      {/* Submissions modal */}
      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? `Submissions — ${active.title}` : ''}
        description={active ? `${active.classRoom?.name} · ${active.classRoom?.section}` : ''}
        maxWidth="max-w-2xl"
      >
        {subsLoading ? (
          <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
        ) : !subs || subs.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-400">No submissions yet.</p>
        ) : (
          <div className="space-y-3">
            {subs.map((s) => (
              <SubmissionRow key={s._id} sub={s} maxMarks={active.maxMarks} onGrade={grade} />
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

function SubmissionRow({ sub, maxMarks, onGrade }) {
  const [marks, setMarks] = useState(sub.marks ?? '');
  const [feedback, setFeedback] = useState(sub.feedback ?? '');
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink-800">{sub.student?.name}</p>
          <p className="text-xs text-ink-400">{sub.student?.rollNumber || sub.student?.email}</p>
        </div>
        <Badge tone={sub.status === 'graded' ? 'green' : sub.status === 'late' ? 'amber' : 'slate'} className="capitalize">
          {sub.status}
        </Badge>
      </div>
      {sub.content && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-ink-700">{sub.content}</p>}
      {sub.link && <a href={sub.link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline">Open submitted link →</a>}
      <div className="mt-3 flex items-end gap-2">
        <div className="w-24">
          <Label className="text-xs">Marks /{maxMarks}</Label>
          <Input type="number" value={marks} onChange={(e) => setMarks(e.target.value)} className="h-9" />
        </div>
        <div className="flex-1">
          <Label className="text-xs">Feedback</Label>
          <Input value={feedback} onChange={(e) => setFeedback(e.target.value)} className="h-9" placeholder="Optional note" />
        </div>
        <Button size="sm" onClick={() => onGrade(sub, marks, feedback)}>Save</Button>
      </div>
    </div>
  );
}
