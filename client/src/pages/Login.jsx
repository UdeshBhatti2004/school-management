import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useLoginMutation } from '../features/auth/authApi';
import { selectCurrentUser } from '../features/auth/authSlice';
import { Button, Input, Label, Spinner } from '../components/ui/primitives';
import { getErrMsg } from '../lib/getErrMsg';
import { isValidEmail } from "../lib/validators";

export default function Login() {
  const user = useSelector(selectCurrentUser);

  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  const [errors, setErrors] = useState({
    email: "",
  });

  if (user) return <Navigate to="/app" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();

if (!isValidEmail(email)) {
  setErrors((prev) => ({
    ...prev,
    email: "Please enter a valid email address.",
  }));

  toast.error("Please enter a valid email address.");
  return;
}

if (!password.trim()) {
  toast.error("Password is required.");
  return;
}

    try {
      await login({
        email,
        password,
      }).unwrap();
      const dest = location.state?.from?.pathname || '/app';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };


 const validateEmail = () => {
  setErrors((prev) => ({
    ...prev,
    email:
      email && !isValidEmail(email)
        ? "Please enter a valid email address."
        : "",
  }));
};

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-ink-900 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-ink-900" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <GraduationCap size={22} />
            </div>
            <span className="text-lg font-bold">Scholora</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h1 className="max-w-md text-3xl font-bold leading-tight">
              One platform for your whole school.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
              Manage students and staff, share lectures, assign and grade work — all in a single,
              calm workspace built for administrators, teachers, and students.
            </p>
          </motion.div>
          <p className="text-sm text-white/40">© {new Date().getFullYear()} Scholora</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <GraduationCap size={22} />
            </div>
            <span className="text-lg font-bold text-ink-900">Scholora</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-ink-900">Sign in</h2>
          <p className="mt-1.5 text-sm text-ink-500">
            Enter your credentials to access your dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <Input
  id="email"
  type="email"
  required
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onBlur={validateEmail}
  placeholder="you@school.edu"
  className="pl-9"
/>
              </div>

              {errors.email && (
                <p className="text-xs text-rose-600">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Spinner className="h-4 w-4 border-white/40 border-t-white" />
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="px-3 text-[10px] font-medium uppercase tracking-wider text-ink-400">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Inline clean call-to-action */}
          <p className="text-center text-sm text-ink-500">
            New to Scholora?{' '}
            <Link
              to="/register"
              className="font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline inline-flex items-center gap-0.5"
            >
              Register your school
              <ArrowRight size={14} className="mt-0.5" />
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}