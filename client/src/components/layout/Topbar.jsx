import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onOpenMobile }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onOpenMobile}
        className="rounded-lg p-2 text-ink-500 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <Link
        to="/app/profile"
        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100"
      >
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-ink-800">{user.name}</p>
          <p className="text-xs capitalize text-ink-400">{user.role}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
          {user.name?.[0]?.toUpperCase()}
        </div>
      </Link>
    </header>
  );
}
