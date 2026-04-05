import { useState } from 'react';

export default function PgnImport({ loadPgn }) {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const handleLoad = () => {
    try {
      loadPgn(text.trim());
      setError(null);
      setText('');
      setOpen(false);
    } catch (err) {
      setError('Invalid PGN: ' + err.message);
    }
  };

  return (
    <div className="bg-[#181a20] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-[#1e2028] transition-colors"
      >
        <span>Import PGN</span>
        <span className="text-slate-500">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste PGN here…"
            rows={5}
            className="w-full bg-[#0f1117] border border-[#2a2d36] rounded px-2 py-1.5 text-xs font-mono text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-[#769656]"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            onClick={handleLoad}
            disabled={!text.trim()}
            className="py-1.5 px-3 rounded bg-[#769656] hover:bg-[#97b36a] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
          >
            Load Game
          </button>
        </div>
      )}
    </div>
  );
}
