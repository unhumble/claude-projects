import { useState } from 'react';
import { Chess } from 'chess.js';

export default function FenInput({ setFen, currentFen }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const handleGo = () => {
    try {
      const temp = new Chess();
      temp.load(value.trim());
      setFen(value.trim());
      setError(null);
      setValue('');
      setOpen(false);
    } catch {
      setError('Invalid FEN position');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFen);
  };

  return (
    <div className="bg-[#181a20] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-[#1e2028] transition-colors"
      >
        <span>FEN Position</span>
        <span className="text-slate-500">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 flex flex-col gap-2">
          <div className="flex gap-1">
            <input
              type="text"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleGo()}
              placeholder="Paste FEN to jump to position…"
              className={`flex-1 bg-[#0f1117] border rounded px-2 py-1.5 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none ${
                error ? 'border-red-500' : 'border-[#2a2d36] focus:border-[#769656]'
              }`}
            />
            <button
              onClick={handleGo}
              disabled={!value.trim()}
              className="px-3 py-1.5 rounded bg-[#769656] hover:bg-[#97b36a] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-white transition-colors"
            >
              Go
            </button>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono truncate flex-1">{currentFen}</span>
            <button
              onClick={handleCopy}
              className="text-xs text-slate-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Copy FEN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
