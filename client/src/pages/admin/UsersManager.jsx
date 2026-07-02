import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from '../../features/users/userApi';
import { useGetClassesQuery } from '../../features/classes/classApi';
import { PageHeader } from '../../components/ui/blocks';
import { Button, Input, Label, Select, Card, Badge, Spinner, EmptyState } from '../../components/ui/primitives';
import Modal from '../../components/ui/Modal';
import { getErrMsg } from '../../lib/getErrMsg';
import { ChevronRight } from "lucide-react";
import { isValidEmail, isValidPhone } from "../../lib/validators";


const emptyForm = (role) => ({
  name: '', email: '', password: '', role, phone: '', isActive: true,
  // teacher
  employeeId: '', department: '', subjects: '',
  // student
  rollNumber: '', classRoom: '', guardianName: '', guardianPhone: '',
});

export default function UsersManager({ role, title, subtitle, icon: Icon }) {
  // Cached per-role: switching Teachers -> Students -> Teachers reuses the
  // cache instead of refetching, same as the dashboard.
  const { data: users, isLoading: loading } = useGetUsersQuery(role, {
    refetchOnMountOrArgChange: true,
  });
  const { data: classes } = useGetClassesQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    guardianPhone: "",
  });

  const [selectedUser, setSelectedUser] = useState(null);

  const [viewOpen, setViewOpen] = useState(false);

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

  const set = (key) => (e) => {
    let value =
      e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value;

    // Phone fields
    if (key === "phone" || key === "guardianPhone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateEmail = () => {
    setErrors((prev) => ({
      ...prev,
      email:
        form.email && !isValidEmail(form.email)
          ? "Please enter a valid email address."
          : "",
    }));
  };

  const validatePhone = (field) => {
    setErrors((prev) => ({
      ...prev,
      [field]:
        form[field] && !isValidPhone(form[field])
          ? "Please enter a valid 10-digit phone number."
          : "",
    }));
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

     if (!isValidEmail(form.email)) {
  setErrors((prev) => ({
    ...prev,
    email: "Please enter a valid email address.",
  }));

  toast.error("Please enter a valid email address.");
  return;
}

if (form.phone && !isValidPhone(form.phone)) {
  setErrors((prev) => ({
    ...prev,
    phone: "Please enter a valid 10-digit phone number.",
  }));

  toast.error("Please enter a valid phone number.");
  return;
}

if (
  form.guardianPhone &&
  !isValidPhone(form.guardianPhone)
) {
  setErrors((prev) => ({
    ...prev,
    guardianPhone: "Please enter a valid 10-digit phone number.",
  }));

  toast.error("Please enter a valid guardian phone number.");
  return;
}

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
        await updateUser({ id: editing._id, role, ...payload }).unwrap();
        toast.success(`${title.slice(0, -1)} updated`);
      } else {
        await createUser(payload).unwrap();
        toast.success(`${title.slice(0, -1)} added`);
      }
      setModalOpen(false);
      // No refetch() call — invalidatesTags on the mutation already told
      // RTK Query which cached queries (this list + dashboard stats) to refresh.
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!confirm(`Remove ${u.name}? This cannot be undone.`)) return;
    try {
      await deleteUser({ id: u._id, role }).unwrap();
      toast.success('Removed');
    } catch (err) {
      toast.error(getErrMsg(err));
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
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Contact</th>
                    {role === 'teacher' ? (
                      <>
                        <th className="px-5 py-3">Department</th>
                        <th className="hidden lg:table-cell px-5 py-3">
                          Subjects
                        </th>
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
                          <td className="hidden lg:table-cell px-5 py-3.5">
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
            <div className="divide-y divide-slate-100 md:hidden">
              {filtered.map((u) => (
                <button
                  key={u._id}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50"
                  onClick={() => setSelectedUser(u)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold text-ink-700">
                      {u.name?.[0]?.toUpperCase()}
                    </div>

                    <div>
                      <p className="font-medium text-ink-800">
                        {u.name}
                      </p>

                      <p className="text-sm text-ink-500">
                        {role === "teacher"
                          ? u.department || "No Department"
                          : u.classRoom
                            ? `${u.classRoom.name} · ${u.classRoom.section}`
                            : "No Class"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge tone={u.isActive ? "green" : "rose"}>
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>

                    <ChevronRight
                      size={18}
                      className="text-slate-400"
                      onClick={() => {
                        setSelectedUser(u);
                        setViewOpen(true);
                      }}
                    />

                  </div>
                </button>
              ))}
            </div>


          </>
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
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <Label>Email</Label>

              <Input
                type="email"
                value={form.email}
                onChange={set("email")}
                onBlur={validateEmail}
                required
              />

              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <Label>{editing ? 'New password (optional)' : 'Password'}</Label>
              <Input type="password" value={form.password} onChange={set('password')} placeholder={editing ? 'Leave blank to keep' : ''} required={!editing} />
            </div>
            <div className="flex flex-col">
              <Label>Phone</Label>

              <Input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={set("phone")}
                onBlur={() => validatePhone("phone")}
              />

              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.phone}
                </p>
              )}
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
                  <Input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.guardianPhone}
                    onChange={set("guardianPhone")}
                    onBlur={() => validatePhone("guardianPhone")}
                  />

                  {errors.guardianPhone && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.guardianPhone}
                    </p>
                  )}
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

      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title={selectedUser?.name || "User Details"}
        description={selectedUser?.email}
        maxWidth="max-w-3xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                className="h-9 px-3 text-xs"
                onClick={() => {
                  setViewOpen(false);
                  handleDelete(selectedUser);
                }}
              >
                <Trash2 size={14} className="mr-1.5" />
                Delete
              </Button>

              <Button
                className="h-9 px-3 text-xs"
                onClick={() => {
                  setViewOpen(false);
                  openEdit(selectedUser);
                }}
              >
                <Pencil size={14} className="mr-1.5" />
                Edit
              </Button>
            </div>

            <Button
              variant="secondary"
              className="h-9 px-3 text-xs"
              onClick={() => setViewOpen(false)}
            >
              Done
            </Button>
          </div>
        }
      >
        {selectedUser && (
          <div className="max-h-[70vh] overflow-y-auto space-y-5 pr-1">

            {/* General */}

            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                General
              </h3>

              <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">

                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-500">Phone</span>
                  <span className="text-sm font-medium">
                    {selectedUser.phone || "—"}
                  </span>
                </div>

              </div>
            </div>

            {role === "teacher" ? (
              <div>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Employment
                </h3>

                <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">

                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-slate-500">
                      Employee ID
                    </span>

                    <span className="text-sm font-medium">
                      {selectedUser.employeeId || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-slate-500">
                      Department
                    </span>

                    <span className="text-sm font-medium">
                      {selectedUser.department || "—"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between px-4 py-2.5">
                    <span className="text-xs text-slate-500">
                      Subjects
                    </span>

                    <div className="flex max-w-[60%] flex-wrap justify-end gap-1">
                      {selectedUser.subjects?.length ? (
                        selectedUser.subjects.map((subject) => (
                          <Badge
                            key={subject}
                            tone="brand"
                            className="text-[10px]"
                          >
                            {subject}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm font-medium">—</span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Student Information
                </h3>

                <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">

                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-slate-500">
                      Roll Number
                    </span>

                    <span className="text-sm font-medium">
                      {selectedUser.rollNumber || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-slate-500">
                      Class
                    </span>

                    <span className="text-sm font-medium">
                      {selectedUser.classRoom
                        ? `${selectedUser.classRoom.name} · ${selectedUser.classRoom.section}`
                        : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-slate-500">
                      Guardian
                    </span>

                    <span className="text-sm font-medium">
                      {selectedUser.guardianName || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-slate-500">
                      Guardian Phone
                    </span>

                    <span className="text-sm font-medium">
                      {selectedUser.guardianPhone || "—"}
                    </span>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
