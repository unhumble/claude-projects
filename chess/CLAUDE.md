# Chess Analysis App

A client-only chess move analysis app built with React 19 + Vite 6 + Tailwind CSS 4.

## Running the app

```bash
cd chess/client
npm install
npm run dev      # starts on http://localhost:5173
```

Or from the chess/ root:

```bash
cd chess
npm run install:all
npm run dev
```

## Architecture

- **No backend.** Stockfish 10 (`stockfish.js`) runs in the browser as a Web Worker.
- **`chess.js`** handles all move validation, FEN/PGN parsing, and game state.
- **`react-chessboard`** provides the board UI (drag/drop, click-to-move, arrow overlays).

## Stockfish setup

The engine files live in `public/` and are served as static assets:
- `public/stockfish.wasm.js` — the Worker script (Stockfish 10, single-threaded)
- `public/stockfish.wasm` — the WebAssembly binary (546KB)

These are copied from `node_modules/stockfish.js/` automatically via the `postinstall` script.
**No NNUE file needed.** No special CORS headers required.

The `useStockfish.js` hook spawns the worker with `new Worker('/stockfish.wasm.js')` and communicates via raw UCI string messages.

## Key files

| File | Purpose |
|---|---|
| `src/hooks/useChessGame.js` | Game state — moves, history, FEN/PGN loading |
| `src/hooks/useStockfish.js` | Engine hook — UCI protocol, eval stream, best move |
| `src/views/AnalysisView.jsx` | Root layout composing all components |
| `public/stockfish.wasm.js` | Stockfish Web Worker (served statically) |
| `public/stockfish.wasm` | Stockfish WASM binary (served statically) |

## Keyboard shortcuts

- `←` / `→` — navigate move history (when not focused in a text input)
