import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Wallet, Trash2, IndianRupee, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { useFetch } from '../../lib/useFetch';
import { PageHeader, StatCard } from '../../components/ui/blocks';
import { Button, Input, Label, Select, Card, Badge, Spinner, EmptyState } from '../../components/ui/primitives';
import Modal from '../../components/ui/Modal';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmt = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const statusTone = { paid: 'green', partial: 'amber', pending: 'slate' };

export default function FeesManager() {
  const { data: fees, loading, refetch } = useFetch('/fees', []);
  const { data: summary, refetch: refetchSummary } = useFetch('/fees/summary', []);
  const { data: classes } = useFetch('/classes', []);
  const { data: students } = useFetch('/users?role=student', []);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [target, setTarget] = useState('student'); // 'student' | 'class'
  const [form, setForm] = useState({ student: '', issueToClass: '', title: '', amount: '', dueDate: '', notes: '' });

  // payment modal
  const [payFor, setPayFor] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('upi');

  const reload = () => { refetch(); refetchSummary(); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        notes: form.notes,
        ...(target === 'class' ? { issueToClass: form.issueToClass } : { student: form.student }),
      };
      await api.post('/fees', payload);
      toast.success('Fee issued');
      setOpen(false);
      setForm({ student: '', issueToClass: '', title: '', amount: '', dueDate: '', notes: '' });
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openPay = (fee) => {
    setPayFor(fee);
    setPayAmount(String(fee.amount - fee.paidAmount));
    setPayMethod('upi');
  };

  const recordPayment = async () => {
    try {
      await api.put(`/fees/${payFor._id}/pay`, { paidAmount: Number(payAmount), method: payMethod });
      toast.success('Payment recorded');
      setPayFor(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (fee) => {
    if (!confirm('Delete this fee record?')) return;
    try {
      await api.delete(`/fees/${fee._id}`);
      toast.success('Deleted');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader title="Fees" subtitle="Issue fees, record payments, and track collection."
        action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Issue fee</Button>} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Billed" value={inr(summary?.totalBilled)} tone="brand" index={0} />
        <StatCard icon={CheckCircle2} label="Collected" value={inr(summary?.totalCollected)} tone="emerald" index={1} />
        <StatCard icon={Clock} label="Outstanding" value={inr(summary?.outstanding)} tone="amber" index={2} />
        <StatCard icon={Wallet} label="Pending bills" value={summary?.pending ?? 0} tone="sky" index={3} />
      </div>

      <Card className="mt-6 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
        ) : (fees || []).length === 0 ? (
          <EmptyState icon={Wallet} title="No fees issued" description="Issue a fee to a student or a whole class to get started."
            action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Issue fee</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Fee</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Due</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f, i) => (
                  <motion.tr key={f._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink-800">{f.student?.name}</p>
                      <p className="text-xs text-ink-400">{f.student?.rollNumber}</p>
                    </td>
                    <td className="px-5 py-3.5 text-ink-600">{f.title}</td>
                    <td className="px-5 py-3.5 font-medium text-ink-800">
                      {inr(f.amount)}
                      {f.paidAmount > 0 && f.status !== 'paid' && <span className="block text-xs font-normal text-emerald-600">{inr(f.paidAmount)} paid</span>}
                    </td>
                    <td className="px-5 py-3.5 text-ink-500">{fmt(f.dueDate)}</td>
                    <td className="px-5 py-3.5"><Badge tone={statusTone[f.status]} className="capitalize">{f.status}</Badge></td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        {f.status !== 'paid' && <Button size="sm" variant="secondary" onClick={() => openPay(f)}>Record payment</Button>}
                        <button onClick={() => remove(f)} className="rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Issue fee */}
      <Modal open={open} onClose={() => setOpen(false)} title="Issue fee" maxWidth="max-w-lg"
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving}>{saving ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Issue'}</Button>
        </>}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label>Issue to</Label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setTarget('student')} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${target === 'student' ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-ink-600'}`}>One student</button>
              <button type="button" onClick={() => setTarget('class')} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${target === 'class' ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-ink-600'}`}>Whole class</button>
            </div>
          </div>
          {target === 'student' ? (
            <div>
              <Label>Student</Label>
              <Select value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required>
                <option value="">Select student</option>
                {(students || []).map((s) => <option key={s._id} value={s._id}>{s.name}{s.rollNumber ? ` (${s.rollNumber})` : ''}</option>)}
              </Select>
            </div>
          ) : (
            <div>
              <Label>Class</Label>
              <Select value={form.issueToClass} onChange={(e) => setForm({ ...form, issueToClass: e.target.value })} required>
                <option value="">Select class</option>
                {(classes || []).map((c) => <option key={c._id} value={c._id}>{c.name} · {c.section} ({c.studentCount} students)</option>)}
              </Select>
            </div>
          )}
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Term 1 Tuition" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount (₹)</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <Label>Due date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
            </div>
          </div>
        </form>
      </Modal>

      {/* Record payment */}
      <Modal open={!!payFor} onClose={() => setPayFor(null)} title="Record payment"
        description={payFor ? `${payFor.student?.name} · ${payFor.title}` : ''} maxWidth="max-w-sm"
        footer={<>
          <Button variant="secondary" onClick={() => setPayFor(null)}>Cancel</Button>
          <Button onClick={recordPayment}>Save payment</Button>
        </>}>
        {payFor && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <div className="flex justify-between"><span className="text-ink-500">Total</span><span className="font-medium">{inr(payFor.amount)}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">Already paid</span><span className="font-medium">{inr(payFor.paidAmount)}</span></div>
            </div>
            <div>
              <Label>Amount received (₹)</Label>
              <Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
            </div>
            <div>
              <Label>Method</Label>
              <Select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank transfer</option>
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
