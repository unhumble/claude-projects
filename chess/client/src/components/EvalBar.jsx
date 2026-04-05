function evalToPercent(cp) {
  // Sigmoid: tanh(cp/400) maps centipawns to [-1, 1], shift to [0, 100]
  return 50 + 50 * Math.tanh(cp / 400);
}

function formatEval(cp, mateIn) {
  if (mateIn !== null) {
    return mateIn > 0 ? `M${mateIn}` : `M${Math.abs(mateIn)}`;
  }
  const pawns = cp / 100;
  return (pawns >= 0 ? '+' : '') + pawns.toFixed(1);
}

export default function EvalBar({ evaluation, mateIn }) {
  let whitePercent;
  if (mateIn !== null) {
    whitePercent = mateIn > 0 ? 98 : 2;
  } else {
    whitePercent = evalToPercent(evaluation);
  }

  const blackPercent = 100 - whitePercent;
  const label = formatEval(evaluation, mateIn);
  const whiteAhead = evaluation >= 0 && (mateIn === null || mateIn > 0);

  return (
    <div className="flex flex-col h-full min-h-[300px] w-8 select-none" title={`Evaluation: ${label}`}>
      {/* Black side (top) */}
      <div
        className="w-full bg-[#1a1a1a] transition-all duration-300 flex items-start justify-center pt-1"
        style={{ height: `${blackPercent}%` }}
      >
        {!whiteAhead && (
          <span className="text-[10px] font-bold text-white leading-none">
            {label}
          </span>
        )}
      </div>

      {/* White side (bottom) */}
      <div
        className="w-full bg-[#f0f0f0] transition-all duration-300 flex items-end justify-center pb-1"
        style={{ height: `${whitePercent}%` }}
      >
        {whiteAhead && (
          <span className="text-[10px] font-bold text-black leading-none">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
