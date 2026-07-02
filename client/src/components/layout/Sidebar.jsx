import { NavLink } from 'react-router-dom';
import { GraduationCap, LogOut, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { navByRole, roleLabels } from '../../lib/nav';
import { cn } from '../../lib/cn';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, logout } from '../../features/auth/authSlice';
import {useNavigate} from 'react-router-dom';
import { apiSlice } from '../../features/api/apiSlice';

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const dispatch = useDispatch();
const user = useSelector(selectCurrentUser);

const navigate = useNavigate();

const handleLogout = () => {
  dispatch(logout());
  dispatch(apiSlice.util.resetApiState());

  navigate('/login', { replace: true });
};
  const items = navByRole[user.role] || [];

  const content = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="text-[15px] font-bold leading-none text-ink-900">Scholora</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-ink-400">
              {roleLabels[user.role]}
            </p>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 text-ink-400 hover:bg-slate-100 lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-600 hover:bg-slate-100 hover:text-ink-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-600"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <item.icon size={18} className="shrink-0" />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-ink-700">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-800">{user.name}</p>
            <p className="truncate text-xs text-ink-400">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40" onClick={onCloseMobile} />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-0 h-full w-64 bg-white shadow-pop"
          >
            {content}
          </motion.aside>
        </div>
      )}
    </>
  );
}
