import { DEPTH_MIN, DEPTH_MAX } from '../constants.js';

export default function ControlPanel({
  depth,
  setDepth,
  flipBoard,
  resetGame,
  isAnalyzing,
  isReady,
}) {
  return (
    <div className="flex flex-col gap-3 p-3 bg-[#181a20] rounded-lg">
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-400 whitespace-nowrap">
          Depth: <span className="text-white font-mono">{depth}</span>
        </label>
        <input
          type="range"
          min={DEPTH_MIN}
          max={DEPTH_MAX}
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
          className="flex-1 accent-[#769656]"
        />
      </div>

      <div className="flex items-center gap-2 text-sm">
        {isAnalyzing ? (
          <span className="flex items-center gap-1.5 text-[#97b36a]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#769656] animate-pulse" />
            Analyzing…
          </span>
        ) : isReady ? (
          <span className="text-slate-500">Ready</span>
        ) : (
          <span className="text-slate-500">Loading engine…</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={flipBoard}
          className="flex-1 py-1.5 px-3 rounded bg-[#2a2d36] hover:bg-[#363a45] text-sm transition-colors"
        >
          Flip Board
        </button>
        <button
          onClick={resetGame}
          className="flex-1 py-1.5 px-3 rounded bg-[#2a2d36] hover:bg-[#363a45] text-sm transition-colors"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
