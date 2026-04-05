import { useEffect, useRef } from 'react';

function EvalChip({ value }) {
  if (value === null || value === undefined) return null;
  const pawns = value / 100;
  const label = (pawns >= 0 ? '+' : '') + pawns.toFixed(1);
  let colorClass = 'text-slate-400';
  if (pawns >= 0.5) colorClass = 'text-green-400';
  else if (pawns <= -0.5) colorClass = 'text-red-400';

  return (
    <span className={`text-xs font-mono ml-1 ${colorClass}`}>{label}</span>
  );
}

export default function MoveHistory({ history, currentIndex, goToMove }) {
  const endRef = useRef(null);

  // Pair moves: white (even index 0, 2, 4...) and black (odd index 1, 3, 5...)
  const pairs = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: history[i],
      whiteIndex: i,
      black: history[i + 1] || null,
      blackIndex: i + 1,
    });
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [history.length]);

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-slate-500 text-sm">
        Make a move to start analysis
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-64 text-sm">
      <table className="w-full">
        <tbody>
          {pairs.map((pair) => (
            <tr key={pair.number} className="border-b border-[#2a2d36]">
              <td className="py-1 px-2 text-slate-500 w-8 text-right select-none">
                {pair.number}.
              </td>
              <td className="py-1 px-1">
                <button
                  onClick={() => goToMove(pair.whiteIndex)}
                  className={`px-2 py-0.5 rounded font-mono transition-colors w-full text-left ${
                    currentIndex === pair.whiteIndex
                      ? 'bg-[#769656] text-white'
                      : 'hover:bg-[#2a2d36]'
                  }`}
                >
                  {pair.white.san}
                  <EvalChip value={pair.white.eval} />
                </button>
              </td>
              <td className="py-1 px-1">
                {pair.black && (
                  <button
                    onClick={() => goToMove(pair.blackIndex)}
                    className={`px-2 py-0.5 rounded font-mono transition-colors w-full text-left ${
                      currentIndex === pair.blackIndex
                        ? 'bg-[#769656] text-white'
                        : 'hover:bg-[#2a2d36]'
                    }`}
                  >
                    {pair.black.san}
                    <EvalChip value={pair.black.eval} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div ref={endRef} />
    </div>
  );
}
