import { useRef, useState, useEffect, useCallback } from 'react';
import { DEPTH_DEFAULT } from '../constants.js';

function parseInfo(line) {
  // Parse "info depth N score cp X ..." or "info depth N score mate N ..."
  const depthMatch = line.match(/depth (\d+)/);
  const cpMatch = line.match(/score cp (-?\d+)/);
  const mateMatch = line.match(/score mate (-?\d+)/);
  const pvMatch = line.match(/ pv ([a-h][1-8][a-h][1-8][qrbn]?)/);

  if (!depthMatch) return null;

  return {
    depth: parseInt(depthMatch[1], 10),
    cp: cpMatch ? parseInt(cpMatch[1], 10) : null,
    mate: mateMatch ? parseInt(mateMatch[1], 10) : null,
    bestMove: pvMatch ? pvMatch[1] : null,
  };
}

export function useStockfish(position) {
  const workerRef = useRef(null);
  const debounceRef = useRef(null);
  const positionRef = useRef(position);
  const depthRef = useRef(DEPTH_DEFAULT);
  const [isReady, setIsReady] = useState(false);
  const [evaluation, setEvaluation] = useState(0);
  const [bestMove, setBestMove] = useState(null);
  const [mateIn, setMateIn] = useState(null);
  const [depth, setDepth] = useState(DEPTH_DEFAULT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    depthRef.current = depth;
  }, [depth]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Spawn stockfish.js worker on mount (stockfish.wasm.js is in /public)
  useEffect(() => {
    const worker = new Worker('/stockfish.wasm.js');

    worker.addEventListener('message', (e) => {
      const line = e.data;
      if (typeof line !== 'string') return;

      if (line === 'uciok') {
        worker.postMessage('isready');
        return;
      }

      if (line === 'readyok') {
        setIsReady(true);
        return;
      }

      if (line.startsWith('info') && line.includes('score')) {
        const parsed = parseInfo(line);
        if (parsed && parsed.depth >= 5) {
          if (parsed.mate !== null) {
            setMateIn(parsed.mate);
            setEvaluation(parsed.mate > 0 ? 9999 : -9999);
          } else if (parsed.cp !== null) {
            setMateIn(null);
            setEvaluation(parsed.cp);
          }
          if (parsed.bestMove) {
            setBestMove(parsed.bestMove);
          }
        }
      }

      if (line.startsWith('bestmove')) {
        const parts = line.split(' ');
        if (parts[1] && parts[1] !== '(none)') {
          setBestMove(parts[1]);
        }
        setIsAnalyzing(false);
      }
    });

    worker.addEventListener('error', (e) => {
      console.error('Stockfish worker error:', e);
    });

    // Initialize UCI
    worker.postMessage('uci');
    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  // Analyze when position changes
  useEffect(() => {
    if (!isReady || !position) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const worker = workerRef.current;
      if (!worker) return;

      worker.postMessage('stop');
      worker.postMessage(`position fen ${position}`);
      worker.postMessage(`go depth ${depthRef.current}`);
      setIsAnalyzing(true);
      setBestMove(null);
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [position, isReady]);

  // Re-analyze when depth changes
  useEffect(() => {
    if (!isReady || !positionRef.current) return;
    const worker = workerRef.current;
    if (!worker) return;

    worker.postMessage('stop');
    worker.postMessage(`position fen ${positionRef.current}`);
    worker.postMessage(`go depth ${depth}`);
    setIsAnalyzing(true);
    setBestMove(null);
  }, [depth]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopAnalysis = useCallback(() => {
    workerRef.current?.postMessage('stop');
    setIsAnalyzing(false);
  }, []);

  return {
    evaluation,
    bestMove,
    mateIn,
    depth,
    setDepth,
    isAnalyzing,
    isReady,
    stopAnalysis,
  };
}
