import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Video, Trash2, Play, Clock, User,Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetLecturesQuery, useCreateLectureMutation, useUpdateLectureMutation, useDeleteLectureMutation } from '../../features/lectures/lectureApi';
import { useGetClassesQuery } from '../../features/classes/classApi';
import { PageHeader } from '../../components/ui/blocks';
import { Button, Input, Label, Select, Textarea, Card, Badge, Spinner, EmptyState } from '../../components/ui/primitives';
import Modal from '../../components/ui/Modal';
import FileUpload from '../../components/ui/FileUpload';
import { getErrMsg } from '../../lib/getErrMsg';

function toEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed${u.pathname}`;
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch { /* not parseable */ }
  return null;
}

const emptyForm = { title: '', description: '', subject: '', classRoom: '', videoUrl: '', durationMinutes: '', sourceType: 'link', publicId: '' };

export default function LecturesView({ manage = false }) {
  const { data: lectures, isLoading: loading } = useGetLecturesQuery(undefined, {
  refetchOnMountOrArgChange: true,
});
  const { data: classes } = useGetClassesQuery();
  const [createLecture] = useCreateLectureMutation();
  const [deleteLecture] = useDeleteLectureMutation();
  const [updateLecture] = useUpdateLectureMutation();


  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('link');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [editingLecture, setEditingLecture] = useState(null);


const selectedClass = classes?.find(
  (c) => c._id === form.classRoom
);


  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

const closeModal = () => {
  setEditingLecture(null);
  setModalOpen(false);
  setForm(emptyForm);
  setMode("link");
};

const openModal = () => {
  setEditingLecture(null);
  setForm(emptyForm);
  setMode("link");
  setModalOpen(true);
};

const openEditModal = (lecture) => {
  setEditingLecture(lecture);

  setForm({
    title: lecture.title,
    description: lecture.description || "",
    subject: lecture.subject,
    classRoom: lecture.classRoom._id,
    videoUrl: lecture.videoUrl,
    durationMinutes: lecture.durationMinutes || "",
    sourceType: lecture.sourceType,
    publicId: lecture.publicId || "",
  });

  setMode(lecture.sourceType);
  setModalOpen(true);
};

const handleClassChange = (e) => {
  const classRoom = e.target.value;

  setForm((prev) => ({
    ...prev,
    classRoom,
    subject: '',
  }));
};


const switchToLink = () => {
  setMode("link");

  setForm((prev) => ({
    ...prev,
    sourceType: "link",
    videoUrl: "",
    publicId: "",
  }));
};

const switchToUpload = () => {
  setMode("upload");

  setForm((prev) => ({
    ...prev,
    sourceType: "upload",
    videoUrl: "",
    publicId: "",
  }));
};


  const handleCreate  = async (e) => {
    e.preventDefault();
    if (!form.videoUrl) return toast.error('Add a video link or upload a file');
    setSaving(true);
    try {
      const payload = {
  ...form,
  durationMinutes: form.durationMinutes
    ? Number(form.durationMinutes)
    : 0,
};

if (editingLecture) {
  await updateLecture({
    id: editingLecture._id,
    ...payload,
  }).unwrap();

  toast.success("Lecture updated");
} else {
  await createLecture(payload).unwrap();

  toast.success("Lecture published");
}
      closeModal();
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (l) => {
    if (!confirm(`Delete "${l.title}"?`)) return;
    try {
      await deleteLecture(l._id).unwrap();
      toast.success('Deleted');
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Lectures"
        subtitle={manage ? 'Publish video lectures for your classes.' : 'Watch lectures shared by your teachers.'}
        action={manage ? <Button onClick={openModal}><Plus size={16} /> New lecture</Button> : null}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : (lectures || []).length === 0 ? (
        <Card>
          <EmptyState icon={Video} title="No lectures yet"
            description={manage ? 'Add a video link and it will be available to the class.' : "Your teachers haven't posted any lectures yet."}
            action={manage ? <Button onClick={openModal}><Plus size={16} /> New lecture</Button> : null} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lectures.map((l, i) => (
            <motion.div key={l._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}>
              <Card className="group flex h-full flex-col overflow-hidden">
                <button onClick={() => setPlaying(l)} className="relative flex aspect-video items-center justify-center bg-ink-900">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-700/30 to-ink-900" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow-soft transition-transform group-hover:scale-105">
                    <Play size={20} className="ml-0.5" fill="currentColor" />
                  </div>
                </button>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug text-ink-900">{l.title}</h3>
                    {manage && (
  <div className="flex items-center gap-1">
    <button
      onClick={() => openEditModal(l)}
      className="rounded-lg p-1.5 text-ink-400 hover:bg-brand-50 hover:text-brand-600"
    >
      <Pencil size={14} />
    </button>

    <button
      onClick={() => handleDelete(l)}
      className="rounded-lg p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-600"
    >
      <Trash2 size={14} />
    </button>
  </div>
)}
                  </div>
                  {l.description && <p className="mt-1 line-clamp-2 text-sm text-ink-500">{l.description}</p>}
                  <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-ink-400">
                    {l.subject && <Badge tone="brand">{l.subject}</Badge>}
                    <span className="flex items-center gap-1"><User size={12} /> {l.createdBy?.name}</span>
                    {l.durationMinutes > 0 && <span className="flex items-center gap-1"><Clock size={12} /> {l.durationMinutes} min</span>}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {manage && (
        <Modal open={modalOpen}   onClose={closeModal} title={editingLecture ? "Edit Lecture" : "New Lecture"}
         maxWidth="max-w-xl"
          footer={
            <>
              <Button
  variant="secondary"
  onClick={closeModal}
  disabled={saving}
>Cancel</Button>
       <Button
  type="button"
  onClick={handleCreate}
  disabled={saving}
>
  {saving ? (
    <Spinner className="h-4 w-4 border-white/40 border-t-white" />
  ) : (
    editingLecture ? "Update" : "Publish"
  )}
</Button>
            </>
          }>
          <form onSubmit={handleCreate} className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={set('title')} required /></div>
            <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={set('description')} /></div>
            <div>
              <Label>Video source</Label>
              <div className="mb-2 flex gap-2">
                <button type="button" onClick={switchToLink} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${mode === 'link' ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-ink-600'}`}>Paste link</button>
                <button type="button" onClick={switchToUpload} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${mode === 'upload' ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-ink-600'}`}>Upload video</button>

       

              </div>


              <p className="mb-2 text-xs text-ink-500">
  Only one video source can be used. Switching between <strong>Paste Link</strong> and{" "}
  <strong>Upload Video</strong> will clear the previously selected source.
</p>
              {mode === 'link' ? (
                <>
                  <Input value={form.sourceType === 'link' ? form.videoUrl : ''} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value, sourceType: 'link', publicId: '' }))} placeholder="https://www.youtube.com/watch?v=…" />
                  <p className="mt-1 text-xs text-ink-400">YouTube and Vimeo links embed automatically.</p>
                </>
              ) : (
                <FileUpload accept="video/*" label="Upload a video file" hint="MP4/WebM · stored on Cloudinary"
                  value={form.sourceType === 'upload' && form.videoUrl ? { url: form.videoUrl, fileName: 'Uploaded video' } : null}
                  onUploaded={(r) => setForm((f) => ({ ...f, videoUrl: r.url, sourceType: 'upload', publicId: r.publicId }))}
                  onClear={() => setForm((f) => ({ ...f, videoUrl: '', sourceType: 'link', publicId: '' }))} />
              )}

              
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label>Class</Label>
                <Select value={form.classRoom} onChange={handleClassChange} required>
                  <option value="">Select class</option>
                  {(classes || []).map((c) => <option key={c._id} value={c._id}>{c.name} · {c.section}</option>)}
                </Select>
              </div>
              <div><Label>Minutes</Label><Input type="number" min={0}
  max={600}
  step={1} value={form.durationMinutes} onChange={set('durationMinutes')} /></div>
            </div>
    <div>
  <Label>Subject</Label>

  <Select
    value={form.subject}
    onChange={set("subject")}
    required
    disabled={!form.classRoom}
  >
    <option value="">
      {form.classRoom
        ? "Select subject"
        : "Select class first"}
    </option>

    {(selectedClass?.subjects || []).map((subject) => (
      <option
        key={subject.name}
        value={subject.name}
      >
        {subject.name}
      </option>
    ))}
  </Select>
</div>
          </form>
        </Modal>
      )}

      <Modal open={!!playing} onClose={() => setPlaying(null)} title={playing?.title} maxWidth="max-w-3xl">
        {playing && (
          <div>
            {playing.sourceType === 'upload' ? (
              <div className="aspect-video overflow-hidden rounded-xl bg-ink-900">
                <video src={playing.videoUrl} controls className="h-full w-full" />
              </div>
            ) : toEmbed(playing.videoUrl) ? (
              <div className="aspect-video overflow-hidden rounded-xl bg-ink-900">
                <iframe src={toEmbed(playing.videoUrl)} title={playing.title} className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-6 text-center">
                <p className="text-sm text-ink-500">This video can't be embedded here.</p>
                <a href={playing.videoUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block">
                  <Button size="sm">Open video in new tab</Button>
                </a>
              </div>
            )}
            {playing.description && <p className="mt-4 text-sm text-ink-600">{playing.description}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
