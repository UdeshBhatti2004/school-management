import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ShieldAlert,
  Clock3,
  Mail,
  Phone,
  ArrowLeft,
} from "lucide-react";

const SchoolAccess = () => {
  const [loading, setLoading] = useState(true);

  const [accessError, setAccessError] = useState({
    code: "",
    message: "",
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("schoolAccessError");

    if (stored) {
      try {
        setAccessError(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse school access error:", error);
      }

      sessionStorage.removeItem("schoolAccessError");
    }

    setLoading(false);
  }, []);

  if (loading) {
    return null;
  }

  const { code, message } = accessError;

  if (!code) {
    return <Navigate to="/login" replace />;
  }

  const isTrialExpired = code === "TRIAL_EXPIRED";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 shadow-xl">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full ${
              isTrialExpired
                ? "bg-amber-100 text-amber-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isTrialExpired ? (
              <Clock3 size={40} />
            ) : (
              <ShieldAlert size={40} />
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="mt-8 text-center text-3xl font-bold text-slate-900">
          {isTrialExpired
            ? "Trial Period Expired"
            : "School Access Disabled"}
        </h1>

        {/* Message */}
        <p className="mt-4 text-center leading-7 text-slate-600">
          {message ||
            (isTrialExpired
              ? "Your school's trial period has ended. Please contact Scholora to continue using the platform."
              : "Your school's account has been deactivated. Please contact Scholora for assistance.")}
        </p>

        {/* Contact */}
        <div className="mt-8 space-y-4 rounded-xl bg-slate-100 p-5">
          <div className="flex items-center gap-3 text-slate-700">
            <Mail size={18} />
            <span>udesh.bhatti123@gmail.com</span>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <Phone size={18} />
            <span>+91 7990496001</span>
          </div>
        </div>

        {/* Back Button */}
        <Link
          to="/login"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          <ArrowLeft size={18} />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default SchoolAccess;