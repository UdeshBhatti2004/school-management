import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { useFetch } from '../../lib/useFetch';
import { PageHeader } from '../../components/ui/blocks';
import { Button, Input, Label, Select, Card, Badge, Spinner, EmptyState } from '../../components/ui/primitives';
import Modal from '../../components/ui/Modal';

const emptyForm = (role) => ({
  name: '', email: '', password: '', role, phone: '', isActive: true,
  // teacher
  employeeId: '', department: '', subjects: '',
  // student
  rollNumber: '', classRoom: '', guardianName: '', guardianPhone: '',
});

export default function UsersManager({ role, title, subtitle, icon: Icon }) {
  const { data: users, loading, refetch } = useFetch(`/users?role=${role}`, [role]);
  const { data: classes } = useFetch('/classes', []);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm(role));
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(role));
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      ...emptyForm(role),
      ...u,
      password: '',
      subjects: Array.isArray(u.subjects) ? u.subjects.join(', ') : '',
      classRoom: u.classRoom?._id || u.classRoom || '',
    });
    setModalOpen(true);
  };

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        subjects: form.subjects
          ? form.subjects.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        classRoom: form.classRoom || undefined,
      };
      if (!payload.password) delete payload.password;

      if (editing) {
        await api.put(`/users/${editing._id}`, payload);
        toast.success(`${title.slice(0, -1)} updated`);
      } else {
        await api.post('/users', payload);
        toast.success(`${title.slice(0, -1)} added`);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!confirm(`Remove ${u.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      toast.success('Removed');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = (users || []).filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> Add {title.slice(0, -1).toLowerCase()}
          </Button>
        }
      />

      <div className="mb-4 relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <Input
          placeholder={`Search ${title.toLowerCase()}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-6 w-6" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Icon}
            title={`No ${title.toLowerCase()} yet`}
            description={`Add your first ${title.slice(0, -1).toLowerCase()} to get started.`}
            action={<Button onClick={openCreate}><Plus size={16} /> Add {title.slice(0, -1).toLowerCase()}</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Contact</th>
                  {role === 'teacher' ? (
                    <>
                      <th className="px-5 py-3">Department</th>
                      <th className="px-5 py-3">Subjects</th>
                    </>
                  ) : (
                    <>
                      <th className="px-5 py-3">Roll No.</th>
                      <th className="px-5 py-3">Class</th>
                    </>
                  )}
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-ink-700">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-ink-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-500">
                      <div className="flex items-center gap-1.5"><Mail size={13} /> {u.email}</div>
                      {u.phone && <div className="mt-0.5 flex items-center gap-1.5 text-xs"><Phone size={12} /> {u.phone}</div>}
                    </td>
                    {role === 'teacher' ? (
                      <>
                        <td className="px-5 py-3.5 text-ink-600">{u.department || '—'}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {(u.subjects || []).slice(0, 3).map((s) => (
                              <Badge key={s} tone="brand">{s}</Badge>
                            ))}
                            {(u.subjects || []).length === 0 && <span className="text-ink-400">—</span>}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-3.5 text-ink-600">{u.rollNumber || '—'}</td>
                        <td className="px-5 py-3.5 text-ink-600">
                          {u.classRoom ? `${u.classRoom.name} · ${u.classRoom.section}` : '—'}
                        </td>
                      </>
                    )}
                    <td className="px-5 py-3.5">
                      <Badge tone={u.isActive ? 'green' : 'rose'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="rounded-lg p-2 text-ink-400 hover:bg-slate-100 hover:text-ink-700" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(u)} className="rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-600" title="Remove">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${title.slice(0, -1).toLowerCase()}` : `Add ${title.slice(0, -1).toLowerCase()}`}
        description={editing ? 'Update the details below.' : 'Create a new account. They can sign in with the email and password you set.'}
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : editing ? 'Save changes' : 'Create account'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <Label>{editing ? 'New password (optional)' : 'Password'}</Label>
              <Input type="password" value={form.password} onChange={set('password')} placeholder={editing ? 'Leave blank to keep' : ''} required={!editing} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={set('phone')} />
            </div>

            {role === 'teacher' ? (
              <>
                <div>
                  <Label>Employee ID</Label>
                  <Input value={form.employeeId} onChange={set('employeeId')} />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input value={form.department} onChange={set('department')} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Subjects (comma separated)</Label>
                  <Input value={form.subjects} onChange={set('subjects')} placeholder="Physics, Mathematics" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Roll number</Label>
                  <Input value={form.rollNumber} onChange={set('rollNumber')} />
                </div>
                <div>
                  <Label>Class</Label>
                  <Select value={form.classRoom} onChange={set('classRoom')}>
                    <option value="">Unassigned</option>
                    {(classes || []).map((c) => (
                      <option key={c._id} value={c._id}>{c.name} · {c.section}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Guardian name</Label>
                  <Input value={form.guardianName} onChange={set('guardianName')} />
                </div>
                <div>
                  <Label>Guardian phone</Label>
                  <Input value={form.guardianPhone} onChange={set('guardianPhone')} />
                </div>
              </>
            )}
          </div>

          <label className="flex items-center gap-2.5 pt-1">
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400" />
            <span className="text-sm text-ink-700">Account active</span>
          </label>
        </form>
      </Modal>
    </div>
  );
}
