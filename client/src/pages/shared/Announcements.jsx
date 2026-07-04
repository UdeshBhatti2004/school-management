import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Megaphone, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetAnnouncementsQuery, useCreateAnnouncementMutation ,useUpdateAnnouncementMutation, useDeleteAnnouncementMutation } from '../../features/announcements/announcementApi';
import { useGetClassesQuery } from '../../features/classes/classApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { PageHeader } from '../../components/ui/blocks';
import { Button, Input, Label, Select, Textarea, Card, Badge, Spinner, EmptyState } from '../../components/ui/primitives';
import Modal from '../../components/ui/Modal';
import { getErrMsg } from '../../lib/getErrMsg';
import FileUpload from "../../components/ui/FileUpload";


const fmt = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export default function Announcements() {
  const user = useSelector(selectCurrentUser);
  const canPost = user?.role === 'admin' || user?.role === 'teacher';
  const { data: items, isLoading: loading } = useGetAnnouncementsQuery(undefined, {
  refetchOnMountOrArgChange: true,
}); 
  const { data: classes } = useGetClassesQuery();
  const [createAnnouncement] = useCreateAnnouncementMutation();
  const [updateAnnouncement] = useUpdateAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();
  const [open, setOpen] = useState(false);

  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

 const emptyForm = {
  title: "",
  body: "",
  audience: "all",
  classRoom: "",
  attachmentUrl: "",
  attachmentName: "",
};

const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);

   const title = form.title.trim();
const body = form.body.trim();

if (!title) {
  toast.error("Please enter a title.");
  setSaving(false);
  return;
}

if (!/[A-Za-z]/.test(title)) {
  toast.error("Title must contain at least one letter.");
  setSaving(false);
  return;
}

if (!body) {
  toast.error("Please enter a message.");
  setSaving(false);
  return;
}

if (!/[A-Za-z]/.test(body)) {
  toast.error("Message must contain at least one letter.");
  setSaving(false);
  return;
}

if (form.audience === "class" && !form.classRoom) {
  toast.error("Please select a class.");
  setSaving(false);
  return;
}



    try {
 const payload = {
  ...form,
  title,
  body,
  attachmentUrl: form.attachmentUrl,
  attachmentName: form.attachmentName,
  classRoom: form.audience === "class" ? form.classRoom : undefined,
};
      if (editingAnnouncement) {
  await updateAnnouncement({
    id: editingAnnouncement._id,
    ...payload,
  }).unwrap();

  toast.success("Announcement updated");
} else {
  await createAnnouncement(payload).unwrap();

  toast.success("Announcement posted");
}
      setOpen(false);
setEditingAnnouncement(null);
setForm(emptyForm);
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(a._id).unwrap();
      toast.success('Deleted');
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };


  const handleEdit = (announcement) => {
  setEditingAnnouncement(announcement);

  setForm({
    title: announcement.title,
    body: announcement.body,
    audience: announcement.audience,
    classRoom: announcement.classRoom?._id || "",
    attachmentUrl: announcement.attachmentUrl || "",
    attachmentName: announcement.attachmentName || "",
  });

  setOpen(true);
};

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Important updates and notices."
        action={canPost ?<Button
  onClick={() => {
    setEditingAnnouncement(null);
    setForm(emptyForm);
    setOpen(true);
  }}
>
  <Plus size={16} />
  Post
</Button> : null}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : (items || []).length === 0 ? (
        <Card>
          <EmptyState icon={Megaphone} title="No announcements" description="Notices posted by the school appear here."
           action={
  canPost ? (
    <Button
      onClick={() => {
        setEditingAnnouncement(null);
        setForm(emptyForm);
        setOpen(true);
      }}
    >
      <Plus size={16} />
      Post announcement
    </Button>
  ) : null
} />
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: Math.min(i * 0.03, 0.25) }}>
              <Card className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink-900">{a.title}</h3>
                      <Badge tone="brand" className="capitalize">{a.audience}{a.classRoom ? ` · ${a.classRoom.name}` : ''}</Badge>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink-600">{a.body}</p>
 {a.attachmentUrl && (
  <a
    href={a.attachmentUrl}
    target="_blank"
    rel="noreferrer"
    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
  >
    📎 {a.attachmentName || "Open attachment"}
  </a>
)}
                    <p className="mt-3 text-xs text-ink-400">
                      {a.createdBy?.name} · <span className="capitalize">{a.createdBy?.role}</span> · {fmt(a.createdAt)}
                    </p>
                  </div>
                  {(user?.role === 'admin' || a.createdBy?._id === user?._id) && (
                    <div className="flex shrink-0 gap-2">
  <Button
    variant="secondary"
    size="sm"
    onClick={() => handleEdit(a)}
  >
    Edit
  </Button>

  <button
    onClick={() => handleDelete(a)}
    className="rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-600"
  >
    <Trash2 size={16} />
  </button>
</div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => {
  setOpen(false);
  setEditingAnnouncement(null);
  setForm(emptyForm);
}}
        title={
  editingAnnouncement
    ? "Edit Announcement"
    : "New Announcement"
}
        maxWidth="max-w-lg"
        footer={
          <>
            <Button
  variant="secondary"
  onClick={() => {
    setOpen(false);
    setEditingAnnouncement(null);
    setForm(emptyForm);
  }}
>
  Cancel
</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? (
  <Spinner className="h-4 w-4 border-white/40 border-t-white" />
) : editingAnnouncement ? (
  "Save Changes"
) : (
  "Post"
)}
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
            <Label>Message</Label>
            <Textarea rows={4} value={form.body} onChange={set('body')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
  <div>
    <Label>Audience</Label>
    <Select value={form.audience} onChange={set("audience")}>
      <option value="all">Everyone</option>
      {user?.role === "admin" && (
        <option value="teachers">Teachers</option>
      )}
      <option value="students">Students</option>
      <option value="class">Specific class</option>
    </Select>
  </div>

  {form.audience === "class" && (
    <div>
      <Label>Class</Label>
      <Select
        value={form.classRoom}
        onChange={set("classRoom")}
        required
      >
        <option value="">Select class</option>

        {(classes || []).map((c) => (
          <option key={c._id} value={c._id}>
            {c.name} · {c.section}
          </option>
        ))}
      </Select>
    </div>
  )}
</div>
<div>
  <Label>Announcement Attachment (Optional)</Label>

  <FileUpload
    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,image/*,video/*"
    label="Upload announcement attachment"
    hint="Stored securely on Cloudinary"
    value={
      form.attachmentUrl
        ? {
            url: form.attachmentUrl,
            fileName: form.attachmentName,
          }
        : null
    }
    onUploaded={(result) =>
      setForm((prev) => ({
        ...prev,
        attachmentUrl: result.url,
        attachmentName: result.fileName,
      }))
    }
    onClear={() =>
      setForm((prev) => ({
        ...prev,
        attachmentUrl: "",
        attachmentName: "",
      }))
    }
  />
</div>  
        </form>
      </Modal>
    </div>
  );
}
