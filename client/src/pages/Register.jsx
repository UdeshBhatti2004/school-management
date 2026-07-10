import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  School,
  Mail,
  Phone,
  MapPin,
  User,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { selectCurrentUser } from '../features/auth/authSlice';
import { useRegisterMutation } from '../features/auth/authApi';

import { Button, Input, Label, Spinner } from '../components/ui/primitives';
import { getErrMsg } from '../lib/getErrMsg';
import { isValidEmail, isValidPhone } from "../lib/validators";



export default function Register() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [register, { isLoading }] = useRegisterMutation();
  const [errors, setErrors] = useState({
    phone: "",
    schoolEmail: "",
    adminEmail: "",
  });

  const [form, setForm] = useState({
    school: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    admin: {
      name: '',
      email: '',
      password: '',
    },
  });

  if (user) return <Navigate to="/app" replace />;

  const updateSchool = (key, value) => {
    setForm((prev) => ({
      ...prev,
      school: {
        ...prev.school,
        [key]: value,
      },
    }));
  };

  const updateAdmin = (key, value) => {
    setForm((prev) => ({
      ...prev,
      admin: {
        ...prev.admin,
        [key]: value,
      },
    }));

    
  };


 const validateSchoolEmail = () => {
  setErrors((prev) => ({
    ...prev,
    schoolEmail:
      form.school.email && !isValidEmail(form.school.email)
        ? "Please enter a valid school email."
        : "",
  }));
};

const validateAdminEmail = () => {
  setErrors((prev) => ({
    ...prev,
    adminEmail:
      form.admin.email && !isValidEmail(form.admin.email)
        ? "Please enter a valid admin email."
        : "",
  }));
};

const validatePhone = () => {
  setErrors((prev) => ({
    ...prev,
    phone:
      form.school.phone && !isValidPhone(form.school.phone)
        ? "Please enter a valid 10-digit phone number."
        : "",
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();
const newErrors = {
  schoolEmail: !isValidEmail(form.school.email)
    ? "Please enter a valid school email."
    : "",
  adminEmail: !isValidEmail(form.admin.email)
    ? "Please enter a valid administrator email."
    : "",
  phone: !isValidPhone(form.school.phone)
    ? "Please enter a valid 10-digit phone number."
    : "",
};

setErrors(newErrors);

if (newErrors.schoolEmail || newErrors.adminEmail || newErrors.phone) {
  toast.error("Please correct the highlighted fields.");
  return;
}

if (form.admin.password.length < 6) {
  toast.error("Password must be at least 6 characters.");
  return;
}

    try {
      await register(form).unwrap();
      toast.success('School created successfully.');
      navigate('/app', { replace: true });
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };

  return (
    <div className="flex h-screen w-screen max-h-screen overflow-hidden bg-white selection:bg-brand-100">
      {/* Left Panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-ink-900 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-800 to-ink-950" />

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-sm">
              <GraduationCap size={22} className="text-brand-200" />
            </div>
            <span className="text-xl font-bold tracking-tight">Scholora</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="max-w-md text-4xl font-extrabold leading-[1.15] tracking-tight">
              Create your school's digital workspace.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70 font-medium">
              Set up your school, create your administrator account and start
              managing students, teachers, attendance, fees and academics from
              one secure platform.
            </p>
          </motion.div>

          <p className="text-xs font-medium text-white/40 tracking-wide">
            &copy; {new Date().getFullYear()} Scholora. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full flex-col h-full lg:w-1/2 bg-ink-25/30">
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-8 sm:px-12 md:px-16 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-xl my-auto py-4"
          >
            {/* Mobile Branding */}
            <div className="mb-6 flex items-center gap-2.5 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                <GraduationCap size={20} />
              </div>
              <span className="text-lg font-bold text-ink-900 tracking-tight">
                Scholora
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                Create your school
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Set up your school and administrator account to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* School Information */}
              <div className="bg-white p-5 rounded-xl border border-ink-100 shadow-sm transition-all duration-200 hover:shadow-md/5">
                <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">
                  School Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-ink-700">School Name</Label>
                    <div className="relative group">
                      <School className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 group-focus-within:text-brand-500 transition-colors" size={15} />
                      <Input
                        className="pl-9 h-9.5 text-sm rounded-lg"
                        placeholder="e.g. Greenvalley High"
                        value={form.school.name}
                        onChange={(e) => updateSchool('name', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-ink-700">School Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 group-focus-within:text-brand-500 transition-colors" size={15} />
                      <Input
  type="email"
  className="pl-9 h-9.5 text-sm rounded-lg"
  placeholder="info@school.com"
  value={form.school.email}
  onChange={(e) => updateSchool("email", e.target.value)}
  onBlur={validateSchoolEmail}
  required
/>
                    </div>

                    {errors.schoolEmail && (
                      <p className="text-xs text-rose-600">
                        {errors.schoolEmail}
                      </p>
                    )}


                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-ink-700">Phone</Label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 group-focus-within:text-brand-500 transition-colors" size={15} />
                      <Input
  type="tel"
  inputMode="numeric"
  autoComplete="tel"
  maxLength={10}
  className="pl-9 h-9.5 text-sm rounded-lg"
  placeholder="9876543210"
  value={form.school.phone}
  onChange={(e) =>
    updateSchool("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
  }
  onBlur={validatePhone}
  required
/>

                    </div>
                    {errors.phone && (
                      <p className="text-xs text-rose-600">
                        {errors.phone}
                      </p>
                    )}

                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-ink-700">Address</Label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 group-focus-within:text-brand-500 transition-colors" size={15} />
                      <Input
                        className="pl-9 h-9.5 text-sm rounded-lg"
                        placeholder="City, State, Country"
                        value={form.school.address}
                        onChange={(e) => updateSchool('address', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrator */}
              <div className="bg-white p-5 rounded-xl border border-ink-100 shadow-sm transition-all duration-200 hover:shadow-md/5">
                <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">
                  Administrator Detail
                </h3>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-ink-700">
  Full Name
</Label>

<div className="relative group">
  <User
    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 group-focus-within:text-brand-500 transition-colors"
    size={15}
  />

  <Input
    className="pl-9 h-9.5 text-sm rounded-lg"
    placeholder="John Doe"
    value={form.admin.name}
    onChange={(e) => updateAdmin("name", e.target.value)}
    required
  />
</div>                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-ink-700">Admin Email</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 group-focus-within:text-brand-500 transition-colors" size={15} />
                        <Input
  type="email"
  className="pl-9 h-9.5 text-sm rounded-lg"
  placeholder="admin@school.com"
  value={form.admin.email}
  onChange={(e) => updateAdmin("email", e.target.value)}
  onBlur={validateAdminEmail}
  required
/>
                      </div>
                      {errors.adminEmail && (
                        <p className="text-xs text-rose-600">
                          {errors.adminEmail}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-ink-700">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 group-focus-within:text-brand-500 transition-colors" size={15} />
                        <Input
                          type="password"
                          className="pl-9 h-9.5 text-sm rounded-lg"
                          placeholder="••••••••"
                          minLength={6}
                          value={form.admin.password}
                          onChange={(e) => updateAdmin('password', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-11 rounded-xl font-semibold shadow-sm shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                ) : (
                  <>
                    Create School
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </form>

            {/* Inline clean call-to-action */}
            <p className="mt-6 text-center text-sm text-ink-500">
              Already have a school?{' '}
              <Link
                to="/login"
                className="font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline inline-flex items-center gap-0.5"
              >
                Sign in to your account
                <ArrowRight size={14} className="mt-0.5" />
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}