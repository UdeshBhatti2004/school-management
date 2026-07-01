import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Upload, CheckCircle2, Clock, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetAssignmentsQuery, useSubmitAssignmentMutation } from '../../features/assignments/assignmentApi';
import { PageHeader } from '../../components/ui/blocks';
import { Button, Input, Label, Textarea, Card, Badge, Spinner, EmptyState } from '../../components/ui/primitives';
import Modal from '../../components/ui/Modal';
import { getErrMsg } from '../../lib/getErrMsg';

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export default function StudentAssignments() {
  const { data: assignments, isLoading: loading } = useGetAssignmentsQuery();
  const [submitAssignment] = useSubmitAssignmentMutation();
  const [active, setActive] = useState(null);
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [saving, setSaving] = useState(false);

  const openSubmit = (a) => {
    setActive(a);
    setContent(a.mySubmission?.content || '');
    setLink(a.mySubmission?.link || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await submitAssignment({ id: active._id, content, link }).unwrap();
      toast.success('Submitted');
      setActive(null);
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const statusOf = (a) => {
    if (a.mySubmission?.status === 'graded') return { tone: 'green', label: 'Graded', icon: Award };
    if (a.mySubmission) return { tone: 'brand', label: 'Submitted', icon: CheckCircle2 };
    if (new Date(a.dueDate) < new Date()) return { tone: 'rose', label: 'Overdue', icon: Clock };
    return { tone: 'amber', label: 'Pending', icon: Clock };
  };

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Submit your work and track grades and feedback." />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : (assignments || []).length === 0 ? (
        <Card>
          <EmptyState icon={FileText} title="No assignments" description="When your teachers post assignments, they'll show up here." />
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((a, i) => {
            const st = statusOf(a);
            const graded = a.mySubmission?.status === 'graded';
            return (
              <motion.div key={a._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: Math.min(i * 0.03, 0.25) }}>
                <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink-900">{a.title}</h3>
                      {a.subject && <Badge tone="slate">{a.subject}</Badge>}
                    </div>
                    {a.description && <p className="mt-1 line-clamp-1 text-sm text-ink-500">{a.description}</p>}
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                      <span className="flex items-center gap-1"><Calendar size={13} /> Due {fmtDate(a.dueDate)}</span>
                      <span>Max {a.maxMarks} marks</span>
                      {graded && <span className="font-medium text-emerald-600">Scored {a.mySubmission.marks}/{a.maxMarks}</span>}
                    </div>
                    {graded && a.mySubmission.feedback && (
                      <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                        <span className="font-medium">Feedback:</span> {a.mySubmission.feedback}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge tone={st.tone}><st.icon size={12} /> {st.label}</Badge>
                    <Button variant={a.mySubmission ? 'secondary' : 'primary'} size="sm" onClick={() => openSubmit(a)} disabled={graded}>
                      <Upload size={15} /> {a.mySubmission ? 'View / edit' : 'Submit'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.title}
        description={active ? `Due ${fmtDate(active.dueDate)} · Max ${active.maxMarks} marks` : ''}
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setActive(null)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Submit work'}
            </Button>
          </>
        }
      >
        {active && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {active.description && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-ink-600">{active.description}</div>
            )}
            <div>
              <Label>Your answer</Label>
              <Textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type your response…" />
            </div>
            <div>
              <Label>Link (optional)</Label>
              <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Google Drive, GitHub, etc." />
            </div>
            <p className="text-xs text-ink-400">You can resubmit until your teacher grades the work.</p>
          </form>
        )}
      </Modal>
    </div>
  );
}
