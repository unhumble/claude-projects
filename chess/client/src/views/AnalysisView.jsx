import { useEffect, useCallback } from 'react';
import { useChessGame } from '../hooks/useChessGame.js';
import { useStockfish } from '../hooks/useStockfish.js';
import Board from '../components/Board.jsx';
import EvalBar from '../components/EvalBar.jsx';
import MoveHistory from '../components/MoveHistory.jsx';
import ControlPanel from '../components/ControlPanel.jsx';
import PgnImport from '../components/PgnImport.jsx';
import FenInput from '../components/FenInput.jsx';

export default function AnalysisView() {
  const game = useChessGame();
  const engine = useStockfish(game.position);

  // Keyboard navigation: left/right arrows
  const handleKeyDown = useCallback(
    (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft') {
        game.goToMove(game.currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        game.goToMove(game.currentIndex + 1);
      }
    },
    [game]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-dvh bg-[#0f1117] text-slate-200 p-3 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-[#769656]">♟</span> Chess Analysis
          </h1>
          <p className="text-xs text-slate-500 hidden md:block">
            Use ← → arrow keys to navigate moves
          </p>
        </div>

        {/* Main layout */}
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* Left column: eval bar + board */}
          <div className="flex gap-2 w-full md:w-auto md:flex-shrink-0">
            {/* Eval bar — hidden on very small screens */}
            <div className="hidden sm:flex self-stretch">
              <EvalBar evaluation={engine.evaluation} mateIn={engine.mateIn} />
            </div>

            {/* Board */}
            <div className="flex-1 md:w-[min(560px,80vw)]">
              <Board
                position={game.position}
                makeMove={game.makeMove}
                bestMove={engine.bestMove}
                flipped={game.flipped}
              />

              {/* Eval bar on mobile (horizontal version hint) */}
              <div className="sm:hidden mt-2 h-3 rounded overflow-hidden bg-[#1a1a1a] flex">
                <div
                  className="bg-[#f0f0f0] transition-all duration-300"
                  style={{
                    width: `${
                      engine.mateIn !== null
                        ? engine.mateIn > 0 ? 98 : 2
                        : 50 + 50 * Math.tanh(engine.evaluation / 400)
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right column: panels */}
          <div className="flex flex-col gap-3 w-full md:flex-1 md:min-w-[220px] md:max-w-[320px]">
            {/* Engine status + eval label */}
            <div className="bg-[#181a20] rounded-lg px-3 py-2 flex items-center justify-between text-sm">
              <span className="text-slate-400">Evaluation</span>
              <span className="font-mono font-semibold text-white">
                {engine.mateIn !== null
                  ? `Mate in ${Math.abs(engine.mateIn)}`
                  : ((engine.evaluation >= 0 ? '+' : '') +
                    (engine.evaluation / 100).toFixed(2))}
              </span>
            </div>

            {/* Move History */}
            <div className="bg-[#181a20] rounded-lg px-2 py-2">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Moves
              </h2>
              <MoveHistory
                history={game.history}
                currentIndex={game.currentIndex}
                goToMove={game.goToMove}
              />
            </div>

            {/* Controls */}
            <ControlPanel
              depth={engine.depth}
              setDepth={engine.setDepth}
              flipBoard={game.flipBoard}
              resetGame={game.resetGame}
              isAnalyzing={engine.isAnalyzing}
              isReady={engine.isReady}
            />

            {/* PGN Import */}
            <PgnImport loadPgn={game.loadPgn} />

            {/* FEN */}
            <FenInput setFen={game.setFen} currentFen={game.position} />
          </div>
        </div>
      </div>
    </div>
  );
}
