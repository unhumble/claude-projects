import { useRef, useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { INITIAL_FEN } from '../constants.js';

function buildHistory(chess) {
  const moves = chess.history({ verbose: true });
  const temp = new Chess();
  return moves.map((move) => {
    temp.move(move.san);
    return { san: move.san, fenAfter: temp.fen(), eval: null };
  });
}

export function useChessGame() {
  const chess = useRef(new Chess());
  const [position, setPosition] = useState(INITIAL_FEN);
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [flipped, setFlipped] = useState(false);

  const makeMove = useCallback((from, to, promotion = 'q') => {
    const move = chess.current.move({ from, to, promotion });
    if (!move) return false;

    const newHistory = buildHistory(chess.current);
    const newIndex = newHistory.length - 1;
    setHistory(newHistory);
    setCurrentIndex(newIndex);
    setPosition(chess.current.fen());
    return true;
  }, []);

  const goToMove = useCallback((index) => {
    const temp = new Chess();
    const allMoves = chess.current.history();

    if (index < 0) {
      setCurrentIndex(-1);
      setPosition(INITIAL_FEN);
      return;
    }

    for (let i = 0; i <= index && i < allMoves.length; i++) {
      temp.move(allMoves[i]);
    }
    setCurrentIndex(index);
    setPosition(temp.fen());
  }, []);

  const loadPgn = useCallback((pgnText) => {
    const temp = new Chess();
    temp.loadPgn(pgnText); // throws on invalid PGN
    chess.current = new Chess();
    chess.current.loadPgn(pgnText);
    const newHistory = buildHistory(chess.current);
    setHistory(newHistory);
    setCurrentIndex(-1);
    setPosition(INITIAL_FEN);
  }, []);

  const setFen = useCallback((fen) => {
    const temp = new Chess();
    temp.load(fen); // throws on invalid FEN
    chess.current = new Chess();
    chess.current.load(fen);
    setHistory([]);
    setCurrentIndex(-1);
    setPosition(fen);
  }, []);

  const flipBoard = useCallback(() => setFlipped((f) => !f), []);

  const resetGame = useCallback(() => {
    chess.current = new Chess();
    setHistory([]);
    setCurrentIndex(-1);
    setPosition(INITIAL_FEN);
  }, []);

  const updateMoveEval = useCallback((index, evalValue) => {
    setHistory((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, eval: evalValue } : entry
      )
    );
  }, []);

  return {
    position,
    history,
    currentIndex,
    flipped,
    makeMove,
    goToMove,
    loadPgn,
    setFen,
    flipBoard,
    resetGame,
    updateMoveEval,
    isGameOver: chess.current.isGameOver(),
    turn: chess.current.turn(),
  };
}
