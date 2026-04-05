import { useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { BEST_MOVE_ARROW_COLOR } from '../constants.js';

function uciToArrow(uciMove, color = BEST_MOVE_ARROW_COLOR) {
  if (!uciMove || uciMove.length < 4) return null;
  const from = uciMove.slice(0, 2);
  const to = uciMove.slice(2, 4);
  return [from, to, color];
}

export default function Board({ position, makeMove, bestMove, flipped }) {
  const [selectedSquare, setSelectedSquare] = useState(null);

  const onPieceDrop = useCallback(
    (sourceSquare, targetSquare) => {
      const success = makeMove(sourceSquare, targetSquare);
      setSelectedSquare(null);
      return success;
    },
    [makeMove]
  );

  const onSquareClick = useCallback(
    (square) => {
      if (selectedSquare) {
        const success = makeMove(selectedSquare, square);
        setSelectedSquare(null);
        if (!success) {
          // Maybe they clicked a new piece to select
          setSelectedSquare(square);
        }
      } else {
        setSelectedSquare(square);
      }
    },
    [selectedSquare, makeMove]
  );

  const customArrows = [];
  const arrow = uciToArrow(bestMove);
  if (arrow) customArrows.push(arrow);

  const customSquareStyles = {};
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
  }

  return (
    <div className="w-full max-w-[min(100vw,80vh)] mx-auto">
      <Chessboard
        position={position}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        boardOrientation={flipped ? 'black' : 'white'}
        customArrows={customArrows}
        customSquareStyles={customSquareStyles}
        animationDuration={150}
        customDarkSquareStyle={{ backgroundColor: '#769656' }}
        customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
      />
    </div>
  );
}
