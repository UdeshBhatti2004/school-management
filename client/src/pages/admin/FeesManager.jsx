import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Wallet, Trash2, IndianRupee, CheckCircle2, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetFeesQuery, useGetFeeSummaryQuery, useCreateFeeMutation, useRecordPaymentMutation, useDeleteFeeMutation } from '../../features/fees/feeApi';
import { useGetClassesQuery } from '../../features/classes/classApi';
import { useGetUsersQuery } from '../../features/users/userApi';
import { PageHeader, StatCard } from '../../components/ui/blocks';
import { Button, Input, Label, Select, Card, Badge, Spinner, EmptyState } from '../../components/ui/primitives';
import Modal from '../../components/ui/Modal';
import { getErrMsg } from '../../lib/getErrMsg';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmt = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const statusTone = { paid: 'green', partial: 'amber', pending: 'slate' };

export default function FeesManager() {
  const { data: fees, isLoading: loading } = useGetFeesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: summary } = useGetFeeSummaryQuery();
  const { data: classes } = useGetClassesQuery();
  const { data: students } = useGetUsersQuery('student', {
    refetchOnMountOrArgChange: true,
  });
  const [createFee] = useCreateFeeMutation();
  const [recordPaymentMutation] = useRecordPaymentMutation();
  const [deleteFee] = useDeleteFeeMutation();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [target, setTarget] = useState('student'); // 'student' | 'class'
  const [form, setForm] = useState({ student: '', issueToClass: '', title: '', amount: '', dueDate: '', notes: '' });

  // Mobile View Detail States
  const [selectedFee, setSelectedFee] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  // payment modal
  const [payFor, setPayFor] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('upi');
  const [payRemarks, setPayRemarks] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Fee title is required.");
      return;
    }

    if (Number(form.amount) <= 0) {
      toast.error("Amount must be greater than 0.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (form.dueDate < today) {
      toast.error("Due date cannot be in the past.");
      return;
    }

    if (target === "student" && !form.student) {
      toast.error("Please select a student.");
      return;
    }

    if (target === "class" && !form.issueToClass) {
      toast.error("Please select a class.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        notes: form.notes,
        ...(target === 'class' ? { issueToClass: form.issueToClass } : { student: form.student }),
      };
      await createFee(payload).unwrap();
      toast.success('Fee issued');
      setOpen(false);
      setForm({ student: '', issueToClass: '', title: '', amount: '', dueDate: '', notes: '' });
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const openPay = (fee) => {
    setPayFor(fee);
    setPayAmount(String(fee.amount - fee.paidAmount));
    setPayMethod('upi');
    setPayRemarks("");
  };

  const recordPayment = async () => {

    if (!payAmount || Number(payAmount) <= 0) {
      toast.error("Enter a valid payment amount.");
      return;
    }

    const outstanding = payFor.amount - payFor.paidAmount;

    if (Number(payAmount) > outstanding) {
      toast.error(`Outstanding balance is ${inr(outstanding)}.`);
      return;
    }

    try {
      await recordPaymentMutation({
        id: payFor._id,
        paidAmount: Number(payAmount),
        method: payMethod,
        remarks: payRemarks,
      }).unwrap();
      toast.success('Payment recorded');
      setPayAmount("");
      setPayMethod("upi");
      setPayRemarks("");
      setPayFor(null);
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };

  const remove = async (fee) => {
    if (!confirm('Delete this fee record?')) return;
    try {
      await deleteFee(fee._id).unwrap();
      toast.success('Deleted');
    } catch (err) {
      toast.error(getErrMsg(err));
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
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
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
                      {/* Replace the desktop actions td with this */}
                      <td className="px-5 py-3.5">
  <div className="flex justify-end items-center gap-1">

    {/* View */}
    <button
      title="View Details"
      onClick={() => {
        setSelectedFee(f);
        setViewOpen(true);
      }}
      className="rounded-lg p-2 text-ink-500 transition hover:bg-slate-100 hover:text-brand-600"
    >
      <ChevronRight size={18} />
    </button>

    {/* Record Payment */}
    <button
      title="Record Payment"
      disabled={f.status === "paid"}
      onClick={() => openPay(f)}
      className={`rounded-lg p-2 transition ${
        f.status === "paid"
          ? "cursor-not-allowed opacity-40"
          : "text-brand-600 hover:bg-brand-50"
      }`}
    >
      <IndianRupee size={18} />
    </button>

    {/* Delete */}
    <button
      title="Delete Fee"
      disabled={f.payments?.length > 0}
      onClick={() => remove(f)}
      className={`rounded-lg p-2 transition ${
        f.payments?.length > 0
          ? "cursor-not-allowed opacity-40"
          : "text-rose-500 hover:bg-rose-50"
      }`}
    >
      <Trash2 size={17} />
    </button>

  </div>
</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Responsive View */}
            <div className="divide-y divide-slate-100 md:hidden">
              {fees.map((f) => (
                <button
                  key={f._id}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50"
                  onClick={() => {
                    setSelectedFee(f);
                    setViewOpen(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold text-ink-700">
                      {f.student?.name?.[0]?.toUpperCase() || <Wallet size={16} />}
                    </div>

                    <div>
                      <p className="font-medium text-ink-800">
                        {f.student?.name || 'Unknown Student'}
                      </p>
                      <p className="text-xs text-ink-400 font-normal">
                        {f.title} · <span className="font-medium text-ink-700">{inr(f.amount)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge tone={statusTone[f.status]} className="capitalize">
                      {f.status}
                    </Badge>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Issue fee Modal */}
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
          <div>
            <Label>Notes (Optional)</Label>

            <Input
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
              placeholder="Optional notes..."
              maxLength={500}
            />
          </div>
        </form>
      </Modal>

      {/* Record payment Modal */}
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
              <div className="flex justify-between">
                <span className="text-ink-500">Outstanding</span>
                <span className="font-semibold text-rose-600">
                  {inr(payFor.amount - payFor.paidAmount)}
                </span>
              </div>
            </div>
            <div>
              <Label>Amount received (₹)</Label>
              <Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
            </div>
            <div>
              <Label>Method</Label>
              <Select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank transfer</option>
              </Select>

            </div>

            <div>
              <Label>Remarks (Optional)</Label>

              <Input
                value={payRemarks}
                onChange={(e) => setPayRemarks(e.target.value)}
                placeholder="Cash received / UPI Ref / Cheque No..."
                maxLength={500}
              />

              <p className="mt-1 text-xs text-ink-400">
                {payRemarks.length}/500
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Mobile Detailed Fee Action Drawer / Modal */}
      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title={selectedFee?.student?.name || "Fee Details"}
        description={selectedFee?.title}
        maxWidth="max-w-3xl"
       footer={
  selectedFee && (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                disabled={selectedFee?.payments?.length > 0}
                className="h-9 px-3 text-xs"
                onClick={() => {
                  setViewOpen(false);
                  remove(selectedFee);
                }}
              >
                <Trash2 size={14} className="mr-1.5" />
                Delete
              </Button>

              {selectedFee?.status !== 'paid' && (
                <Button
                  className="h-9 px-3 text-xs"
                  onClick={() => {
                    setViewOpen(false);
                    openPay(selectedFee);
                  }}
                >
                  Record Payment
                </Button>
              )}
            </div>

            <Button
              variant="secondary"
              className="h-9 px-3 text-xs"
              onClick={() => setViewOpen(false)}
            >
              Done
            </Button>
          </div>
  )
        }
      >
        {selectedFee && (
          <div className="max-h-[70vh] overflow-y-auto space-y-5 pr-1">
            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Fee Overview
              </h3>

              <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-500">Roll Number</span>
                  <span className="text-sm font-medium">{selectedFee.student?.rollNumber || "—"}</span>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-500">Total Billed</span>
                  <span className="text-sm font-semibold text-ink-800">{inr(selectedFee.amount)}</span>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-500">Amount Paid</span>
                  <span className="text-sm font-medium text-emerald-600">{inr(selectedFee.paidAmount)}</span>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-500">
                    Remaining
                  </span>

                  <span className="text-sm font-semibold text-rose-600">
                    {inr(selectedFee.amount - selectedFee.paidAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-500">
                    Payments
                  </span>

                  <span className="text-sm font-medium">
                    {selectedFee.payments?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-500">Due Date</span>
                  <span className="text-sm font-medium text-ink-500">{fmt(selectedFee.dueDate)}</span>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-500">Status</span>
                  <Badge tone={statusTone[selectedFee.status]} className="capitalize">{selectedFee.status}</Badge>
                </div>
              </div>
            </div>

           {selectedFee?.payments?.length > 0 && (
              <div>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Payment History
                </h3>

                <div className="space-y-3">
                  {selectedFee?.payments?.map((payment, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-slate-100 p-3"
                    >
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          {inr(payment.amount)}
                        </span>

                        <Badge tone="emerald">
                          {payment.method}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        {fmt(payment.receivedAt)}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Received by {payment.receivedBy?.name || "Admin"}
                      </p>

                      {payment.remarks && (
                        <p className="mt-2 text-xs text-slate-600">
                          {payment.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedFee?.notes && (
              <div> 
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Notes
                </h3>
                <div className="rounded-lg border border-slate-100 p-3 text-xs text-ink-600 bg-slate-50/50">
                  {selectedFee.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}