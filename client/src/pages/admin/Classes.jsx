import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, School, Users, X, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { useFetch } from '../../lib/useFetch';
import { PageHeader } from '../../components/ui/blocks';
import { Button, Input, Label, Select, Card, Badge, Spinner, EmptyState } from '../../components/ui/primitives';
import Modal from '../../components/ui/Modal';

const emptyForm = { name: '', section: 'A', classTeacher: '', subjects: [] };

export default function Classes() {
  const { data: classes, loading, refetch } = useFetch('/classes', []);
  const { data: teachers } = useFetch('/users?role=teacher', []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [roster, setRoster] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      section: c.section,
      classTeacher: c.classTeacher?._id || c.classTeacher || '',
      subjects: (c.subjects || []).map((s) => ({
        name: s.name,
        teacher: s.teacher?._id || s.teacher || '',
      })),
    });
    setModalOpen(true);
  };

  const addSubject = () => setForm((f) => ({ ...f, subjects: [...f.subjects, { name: '', teacher: '' }] }));
  const updateSubject = (i, key, val) =>
    setForm((f) => ({
      ...f,
      subjects: f.subjects.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)),
    }));
  const removeSubject = (i) =>
    setForm((f) => ({ ...f, subjects: f.subjects.filter((_, idx) => idx !== i) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        section: form.section,
        classTeacher: form.classTeacher || undefined,
        subjects: form.subjects
          .filter((s) => s.name.trim())
          .map((s) => ({ name: s.name.trim(), teacher: s.teacher || undefined })),
      };
      if (editing) {
        await api.put(`/classes/${editing._id}`, payload);
        toast.success('Class updated');
      } else {
        await api.post('/classes', payload);
        toast.success('Class created');
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Delete ${c.name} · ${c.section}? Students will be unassigned.`)) return;
    try {
      await api.delete(`/classes/${c._id}`);
      toast.success('Class deleted');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const viewRoster = async (c) => {
    try {
      const { data } = await api.get(`/classes/${c._id}`);
      setRoster(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Classes"
        subtitle="Organize grades and sections, assign class teachers and subjects."
        action={<Button onClick={openCreate}><Plus size={16} /> New class</Button>}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      ) : (classes || []).length === 0 ? (
        <Card>
          <EmptyState
            icon={School}
            title="No classes yet"
            description="Create your first class to start assigning students and teachers."
            action={<Button onClick={openCreate}><Plus size={16} /> New class</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
            >
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <School size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink-900">{c.name}</h3>
                      <p className="text-sm text-ink-400">Section {c.section}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-ink-400 hover:bg-slate-100 hover:text-ink-700"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(c)} className="rounded-lg p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-ink-600">
                    <UserCheck size={15} className="text-ink-400" />
                    {c.classTeacher?.name || <span className="text-ink-400">No class teacher</span>}
                  </div>
                  <div className="flex items-center gap-2 text-ink-600">
                    <Users size={15} className="text-ink-400" />
                    {c.studentCount} student{c.studentCount === 1 ? '' : 's'}
                  </div>
                </div>

                {(c.subjects || []).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.subjects.map((s) => (
                      <Badge key={s.name} tone="slate">{s.name}</Badge>
                    ))}
                  </div>
                )}

                <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => viewRoster(c)}>
                  View roster
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / edit */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit class' : 'New class'}
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : editing ? 'Save changes' : 'Create class'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Class name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Grade 10" required />
            </div>
            <div>
              <Label>Section</Label>
              <Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="A" />
            </div>
          </div>
          <div>
            <Label>Class teacher</Label>
            <Select value={form.classTeacher} onChange={(e) => setForm({ ...form, classTeacher: e.target.value })}>
              <option value="">None</option>
              {(teachers || []).map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="mb-0">Subjects</Label>
              <button type="button" onClick={addSubject} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                + Add subject
              </button>
            </div>
            <div className="space-y-2">
              {form.subjects.length === 0 && <p className="text-sm text-ink-400">No subjects added.</p>}
              {form.subjects.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input className="flex-1" placeholder="Subject name" value={s.name} onChange={(e) => updateSubject(i, 'name', e.target.value)} />
                  <Select className="flex-1" value={s.teacher} onChange={(e) => updateSubject(i, 'teacher', e.target.value)}>
                    <option value="">Teacher…</option>
                    {(teachers || []).map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </Select>
                  <button type="button" onClick={() => removeSubject(i)} className="rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-600">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Roster */}
      <Modal
        open={!!roster}
        onClose={() => setRoster(null)}
        title={roster ? `${roster.name} · ${roster.section}` : ''}
        description={roster?.classTeacher ? `Class teacher: ${roster.classTeacher.name}` : undefined}
        maxWidth="max-w-lg"
      >
        {roster && (
          <div>
            {(roster.students || []).length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">No students assigned to this class yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {roster.students.map((s) => (
                  <li key={s._id} className="flex items-center gap-3 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-ink-700">
                      {s.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-800">{s.name}</p>
                      <p className="truncate text-xs text-ink-400">{s.email}</p>
                    </div>
                    {s.rollNumber && <Badge tone="slate">{s.rollNumber}</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
