import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Upload, CheckCircle2, Clock, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetAssignmentsQuery, useSubmitAssignmentMutation } from '../../features/assignments/assignmentApi';
import { PageHeader } from '../../components/ui/blocks';
import { Button, Input, Label, Textarea, Card, Badge, Spinner, EmptyState } from '../../components/ui/primitives';
import Modal from '../../components/ui/Modal';
import FileUpload from '../../components/ui/FileUpload';
import { getErrMsg } from '../../lib/getErrMsg';

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export default function StudentAssignments() {
const {
  data: assignments,
  isLoading: loading,
} = useGetAssignmentsQuery(undefined, {
  refetchOnMountOrArgChange: true,
});
  const [submitAssignment] = useSubmitAssignmentMutation();
  const [active, setActive] = useState(null);
  const [content, setContent] = useState('');
const [link, setLink] = useState('');
const [fileUrl, setFileUrl] = useState('');
const [fileName, setFileName] = useState('');
  const [saving, setSaving] = useState(false);

  const openSubmit = (a) => {
  setActive(a);

  setContent(a.mySubmission?.content || '');
  setLink(a.mySubmission?.link || '');

  setFileUrl(a.mySubmission?.fileUrl || '');
  setFileName(a.mySubmission?.fileName || '');
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  console.log({
  content,
  link,
  fileUrl,
});


if (!content.trim()) {
  toast.error("Please enter your submission.");
  return;
}

if (!fileUrl && !link.trim()) {
  toast.error("Please upload a file or provide a submission link.");
  return;
}

  setSaving(true);
    try {
      await submitAssignment({
  id: active._id,
  content,
  link,
  fileUrl,
  fileName,
}).unwrap();
      toast.success('Submitted');
      setContent("");
setLink("");
setFileUrl("");
setFileName("");
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

  const canSubmit =
  content.trim() && (fileUrl || link.trim());

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
        onClose={() => {
  setActive(null);
  setContent("");
  setLink("");
  setFileUrl("");
  setFileName("");
}}
        title={active?.title}
        description={active ? `Due ${fmtDate(active.dueDate)} · Max ${active.maxMarks} marks` : ''}
        maxWidth="max-w-lg"
        footer={
          <>
          <Button
  variant="secondary"
  onClick={() => {
    setActive(null);
    setContent("");
    setLink("");
    setFileUrl("");
    setFileName("");
  }}
>
  Cancel
</Button>
            <Button
  onClick={handleSubmit}
  disabled={saving || !canSubmit}
>
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
              <Label>
  Submission <span className="text-rose-500">*</span>
</Label>
              <Textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Describe your work, approach, or answer..." />
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
  <h4 className="text-sm font-semibold text-blue-900">
    Submission Requirements
  </h4>

  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-700">
    <li>Submission description is required.</li>
    <li>Upload a file <strong>OR</strong> provide a submission link.</li>
  </ul>
</div>

           <div className="space-y-4">
  <div>
    <Label>Upload Assignment File</Label>

    <FileUpload
      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,image/*,video/*"
      label="Upload your assignment"
      hint="Stored securely on Cloudinary"
      value={
        fileUrl
          ? {
              url: fileUrl,
              fileName,
            }
          : null
      }
      onUploaded={(result) => {
        setFileUrl(result.url);
        setFileName(result.fileName);
      }}
      onClear={() => {
        setFileUrl("");
        setFileName("");
      }}
    />
  </div>

  <div className="flex items-center gap-3 py-2">
  <div className="h-px flex-1 bg-slate-200" />

  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
    OR
  </span>

  <div className="h-px flex-1 bg-slate-200" />
</div>

  <div>
    <Label>Submission link</Label>

    <Input
      value={link}
      onChange={(e) => setLink(e.target.value)}
      placeholder="Paste a Google Drive, GitHub, OneDrive, or Figma link"
    />
  </div>
 {fileUrl ? (
  <p className="text-xs text-emerald-600">
    ✓ File attached. Submission requirements are satisfied.
  </p>
) : link.trim() ? (
  <p className="text-xs text-emerald-600">
    ✓ Submission link added. Submission requirements are satisfied.
  </p>
) : (
  <p className="text-xs text-amber-600">
    Upload a file <strong>or</strong> provide a submission link to complete your submission.
  </p>
)}
</div>


            <p className="text-xs text-ink-400">You can resubmit until your teacher grades the work.</p>
          </form>
        )}
      </Modal>
    </div>
  );
}
