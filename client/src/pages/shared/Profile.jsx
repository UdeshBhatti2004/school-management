import { useState } from 'react';
import { UserCircle, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useUpdateProfileMutation, useChangePasswordMutation } from '../../features/auth/authApi';
import { PageHeader } from '../../components/ui/blocks';
import { Button, Input, Label, Card, Spinner, Badge } from '../../components/ui/primitives';
import { getErrMsg } from '../../lib/getErrMsg';

export default function Profile() {
  const { user } = useAuth();
  const [updateProfile] = useUpdateProfileMutation();
  const [changePassword] = useChangePasswordMutation();

  const [profile, setProfile] = useState({ name: user.name, phone: user.phone || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      // onQueryStarted in authApi dispatches updateUser to the Redux store
      // automatically, so useAuth().user updates everywhere with no extra code.
      await updateProfile(profile).unwrap();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await changePassword(pw).unwrap();
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div>
      <PageHeader title="My profile" subtitle="Manage your account details and password." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center p-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <h2 className="mt-4 font-semibold text-ink-900">{user.name}</h2>
          <p className="text-sm text-ink-400">{user.email}</p>
          <div className="mt-4 w-full border-t border-slate-200 pt-4 space-y-2">
            {user.role === 'student' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-500">Class</span>
                  <span className="font-medium text-ink-900">{user.classRoom?.label || 'Not Assigned'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-500">Roll No.</span>
                  <span className="font-medium text-ink-900">{user.rollNumber || '—'}</span>
                </div>
              </>
            )}
            {user.role === 'teacher' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-500">Department</span>
                  <span className="font-medium text-ink-900">{user.department || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-500">Employee ID</span>
                  <span className="font-medium text-ink-900">{user.employeeId || '—'}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-ink-500">Phone</span>
              <span className="font-medium text-ink-900">{user.phone || '—'}</span>
            </div>
            <div className="flex justify-center pt-3">
              <Badge tone="brand" className="capitalize">{user.role}</Badge>
            </div>
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <UserCircle size={18} className="text-ink-400" />
              <h3 className="text-sm font-semibold text-ink-900">Account details</h3>
            </div>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <Label>Full name</Label>
                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user.email} disabled className="bg-slate-50 text-ink-400" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Save changes'}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound size={18} className="text-ink-400" />
              <h3 className="text-sm font-semibold text-ink-900">Change password</h3>
            </div>
            <form onSubmit={savePassword} className="space-y-4">
              <div>
                <Label>Current password</Label>
                <Input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
              </div>
              <div>
                <Label>New password</Label>
                <Input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required minLength={6} />
                <p className="mt-1 text-xs text-ink-400">At least 6 characters.</p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={savingPw}>
                  {savingPw ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Update password'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
