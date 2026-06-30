import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Megaphone, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { useFetch } from '../../lib/useFetch';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/blocks';
import { Button, Input, Label, Select, Textarea, Card, Badge, Spinner, EmptyState } from '../../components/ui/primitives';
import Modal from '../../components/ui/Modal';

const fmt = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export default function Announcements() {
  const { user } = useAuth();
  const canPost = user.role === 'admin' || user.role === 'teacher';
  const { data: items, loading, refetch } = useFetch('/announcements', []);
  const { data: classes } = useFetch('/classes', []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', audience: 'all', classRoom: '' });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, classRoom: form.audience === 'class' ? form.classRoom : undefined };
      await api.post('/announcements', payload);
      toast.success('Announcement posted');
      setOpen(false);
      setForm({ title: '', body: '', audience: 'all', classRoom: '' });
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${a._id}`);
      toast.success('Deleted');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Important updates and notices."
        action={canPost ? <Button onClick={() => setOpen(true)}><Plus size={16} /> Post</Button> : null}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : (items || []).length === 0 ? (
        <Card>
          <EmptyState icon={Megaphone} title="No announcements" description="Notices posted by the school appear here."
            action={canPost ? <Button onClick={() => setOpen(true)}><Plus size={16} /> Post announcement</Button> : null} />
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
                    <p className="mt-3 text-xs text-ink-400">
                      {a.createdBy?.name} · <span className="capitalize">{a.createdBy?.role}</span> · {fmt(a.createdAt)}
                    </p>
                  </div>
                  {(user.role === 'admin' || a.createdBy?._id === user._id) && (
                    <button onClick={() => handleDelete(a)} className="rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New announcement"
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Post'}
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
              <Select value={form.audience} onChange={set('audience')}>
                <option value="all">Everyone</option>
                {user.role === 'admin' && <option value="teachers">Teachers</option>}
                <option value="students">Students</option>
                <option value="class">Specific class</option>
              </Select>
            </div>
            {form.audience === 'class' && (
              <div>
                <Label>Class</Label>
                <Select value={form.classRoom} onChange={set('classRoom')} required>
                  <option value="">Select class</option>
                  {(classes || []).map((c) => <option key={c._id} value={c._id}>{c.name} · {c.section}</option>)}
                </Select>
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
