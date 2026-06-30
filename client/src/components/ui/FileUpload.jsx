import { useRef, useState } from 'react';
import { UploadCloud, FileCheck2, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadFile } from '../../lib/upload';
import { cn } from '../../lib/cn';

// Calls onUploaded({ url, publicId, resourceType, fileName }) when done.
export default function FileUpload({ accept, label = 'Upload a file', hint, onUploaded, value, onClear }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadFile(file, setProgress);
      onUploaded?.(result);
      toast.success('File uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  if (value?.url) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
        <FileCheck2 size={18} className="shrink-0 text-emerald-600" />
        <span className="min-w-0 flex-1 truncate text-sm text-emerald-800">{value.fileName || value.url}</span>
        <button type="button" onClick={onClear} className="rounded p-1 text-emerald-700 hover:bg-emerald-100">
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => !uploading && inputRef.current?.click()}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-200 px-4 py-6 text-center transition-colors',
        uploading ? 'cursor-wait bg-slate-50' : 'hover:border-brand-300 hover:bg-brand-50/40'
      )}
    >
      <input ref={inputRef} type="file" accept={accept} onChange={handleSelect} className="hidden" />
      {uploading ? (
        <>
          <Loader2 size={20} className="animate-spin text-brand-600" />
          <span className="text-sm font-medium text-ink-600">Uploading… {progress}%</span>
          <div className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </>
      ) : (
        <>
          <UploadCloud size={20} className="text-ink-400" />
          <span className="text-sm font-medium text-ink-700">{label}</span>
          {hint && <span className="text-xs text-ink-400">{hint}</span>}
        </>
      )}
    </button>
  );
}
