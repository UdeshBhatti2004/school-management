import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, description, children, footer, maxWidth = 'max-w-lg' }) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6">
          <motion.div
            className="fixed inset-0 bg-ink-900/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.div
            className={`relative z-10 mt-4 mb-4 sm:mt-8 sm:mb-8 flex w-full ${maxWidth} max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] flex-col rounded-2xl bg-white shadow-pop`}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header — pinned */}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-ink-900 break-words">{title}</h2>
                {description && <p className="mt-1 text-xs sm:text-sm text-ink-500 break-words">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="shrink-0 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-slate-100 hover:text-ink-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 text-sm sm:text-base">
              {children}
            </div>

            {/* Footer — pinned */}
            {footer && (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3 border-t border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}