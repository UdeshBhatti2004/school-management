import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, NotebookText, Trash2, FileText, Download, LinkIcon, User, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetNotesQuery, useCreateNoteMutation, useUpdateNoteMutation , useDeleteNoteMutation } from '../../features/notes/noteApi';
import { useGetClassesQuery } from '../../features/classes/classApi';
import { PageHeader } from '../../components/ui/blocks';
import { Button, Input, Label, Select, Textarea, Card, Badge, Spinner, EmptyState } from '../../components/ui/primitives';
import Modal from '../../components/ui/Modal';
import FileUpload from '../../components/ui/FileUpload';
import { getErrMsg } from '../../lib/getErrMsg';

const emptyForm = { title: '', description: '', subject: '', classRoom: '', fileUrl: '', fileName: '', fileType: 'link', publicId: '' };

const hasAlphabet = (text = "") => /[A-Za-z]/.test(text);

const isValidSubject = (subject = "") =>
  /^[A-Za-z\s]+$/.test(subject.trim());

const isValidUrl = (url = "") => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function NotesView({ manage = false }) {
  const { data: notes, isLoading: loading } = useGetNotesQuery(undefined, {
  refetchOnMountOrArgChange: true,
});
  const { data: classes } = useGetClassesQuery();
  const [createNote] = useCreateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();
  const [updateNote] = useUpdateNoteMutation();


  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('upload');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const reset = () => {
  setEditingNote(null);
  setForm(emptyForm);
  setMode("upload");
};

  const handleCreate = async (e) => {
    e.preventDefault();
if (!form.title.trim()) {
  return toast.error("Title is required");
}

if (!hasAlphabet(form.title)) {
  return toast.error("Title must contain alphabets");
}

if (form.description && !hasAlphabet(form.description)) {
  return toast.error("Description must contain alphabets");
}

if (!form.subject.trim()) {
  return toast.error("Subject is required");
}

if (!isValidSubject(form.subject)) {
  return toast.error("Subject can contain only letters and spaces");
}

if (!form.classRoom) {
  return toast.error("Please select a class");
}

if (!form.fileUrl.trim()) {
  return toast.error("Upload a file or provide a link");
}

if (
  form.fileType === "link" &&
  !isValidUrl(form.fileUrl)
) {
  return toast.error("Please enter a valid URL");
}
    setSaving(true);
    try {
      if (editingNote) {
  await updateNote({
    id: editingNote._id,
    ...form,
  }).unwrap();

  toast.success("Note updated");
} else {
  await createNote(form).unwrap();

  toast.success("Note published");
}
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note) => {
  setEditingNote(note);

  setForm({
    title: note.title,
    description: note.description || "",
    subject: note.subject,
    classRoom: note.classRoom?._id || note.classRoom,
    fileUrl: note.fileUrl || "",
    fileName: note.fileName || "",
    fileType: note.fileType || "link",
    publicId: note.publicId || "",
  });

  setMode(note.fileType === "link" ? "link" : "upload");
  setOpen(true);
};

  const remove = async (n) => {
    if (!confirm(`Delete "${n.title}"?`)) return;
    try {
      await deleteNote(n._id).unwrap();
      toast.success('Deleted');
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };

  return (
    <div>
      <PageHeader title="Notes & materials"
        subtitle={manage ? 'Share study material with your classes.' : 'Study material shared by your teachers.'}
        action={manage ? <Button onClick={() => { reset(); setOpen(true); }}><Plus size={16} /> Add note</Button> : null} />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : (notes || []).length === 0 ? (
        <Card><EmptyState icon={NotebookText} title="No notes yet"
          description={manage ? 'Upload a PDF or share a link to get started.' : 'Materials posted by your teachers will appear here.'}
          action={manage ? <Button onClick={() => { reset(); setOpen(true); }}><Plus size={16} /> Add note</Button> : null} /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((n, i) => (
            <motion.div key={n._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    {n.fileType === 'link' ? <LinkIcon size={20} /> : <FileText size={20} />}
                  </div>
                  
                  {manage && (
  <div className="flex gap-2">
    <button
      onClick={() => handleEdit(n)}
      className="rounded-lg p-1.5 text-ink-400 hover:bg-brand-50 hover:text-brand-600" title="Edit"
    >
      <Pencil size={14} />
    </button>

    <button
      onClick={() => remove(n)}
      className="rounded-lg p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-600" title="Delete"
    >
      <Trash2 size={14} />
    </button>
  </div>
)}
                </div>
                <h3 className="mt-3 font-semibold leading-snug text-ink-900">{n.title}</h3>
                {n.description && <p className="mt-1 line-clamp-2 text-sm text-ink-500">{n.description}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
                  {n.subject && <Badge tone="brand">{n.subject}</Badge>}
                  <span className="flex items-center gap-1"><User size={12} /> {n.createdBy?.name}</span>
                </div>
                <a href={n.fileUrl} target="_blank" rel="noreferrer" className="mt-4">
                  <Button variant="secondary" size="sm" className="w-full">
                    {n.fileType === 'link' ? <><LinkIcon size={15} /> Open link</> : <><Download size={15} /> Open / download</>}
                  </Button>
                </a>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {manage && (
        <Modal open={open} onClose={() => {
  reset();
  setOpen(false);
}} title={editingNote ? "Edit Note" : "Add Note"} maxWidth="max-w-lg"
          footer={<>
            <Button
  variant="secondary"
  onClick={() => {
    reset();
    setOpen(false);
  }}
>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
  {saving ? (
    <Spinner className="h-4 w-4 border-white/40 border-t-white" />
  ) : (
    editingNote ? "Update" : "Publish"
  )}
</Button>
          </>}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div><Label>Title</Label><Input   maxLength={100} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
             <p className="mt-1 text-xs text-ink-400">
  {form.title.length}/100
</p>
            </div>

            <div><Label>Description</Label><Textarea   maxLength={3000} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <p className="mt-1 text-xs text-ink-400">
  {form.description.length}/3000
</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
              <div>
                <Label>Class</Label>
                <Select value={form.classRoom}  disabled={!!editingNote} onChange={(e) => setForm({ ...form, classRoom: e.target.value })} required>
                  <option value="">Select class</option>
                  {(classes || []).map((c) => <option key={c._id} value={c._id}>{c.name} · {c.section}</option>)}
                </Select>
              </div>
              <div><Label>Subject</Label><Input   maxLength={100} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Physics" />
                <p className="mt-1 text-xs text-ink-400">
  {form.subject.length}/100
</p>
              </div>
            </div>
            <div>
              <Label>Material</Label>
              <div className="mb-2 flex gap-2">
                <button type="button" onClick={() => setMode('upload')} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${mode === 'upload' ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-ink-600'}`}>{editingNote ? "Replace file" : "Upload file"}</button>
                <button type="button" onClick={() => setMode('link')} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${mode === 'link' ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-ink-600'}`}>Add link</button>
              </div>
              {mode === 'upload' ? (
                <FileUpload accept=".pdf,.doc,.docx,.ppt,.pptx,image/*" label={
  editingNote
    ? "Replace PDF, doc, or image"
    : "Upload PDF, doc, or image"
} hint="Stored on Cloudinary"
                  value={form.fileType !== 'link' && form.fileUrl ? { url: form.fileUrl, fileName: form.fileName } : null}
                  onUploaded={(r) => setForm({ ...form, fileUrl: r.url, fileName: r.fileName, fileType: r.resourceType, publicId: r.publicId })}
                  onClear={() => setForm({ ...form, fileUrl: '', fileName: '', fileType: 'link', publicId: '' })} />
              ) : (
                <Input value={form.fileType === 'link' ? form.fileUrl : ''} onChange={(e) => setForm({ ...form, fileUrl: e.target.value, fileType: 'link', fileName: 'External resource', publicId: '' })} placeholder="https://…" />
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
