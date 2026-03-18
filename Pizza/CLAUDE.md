# CLAUDE.md

This file provides guidance to Claude Code when working in the Pizza/ directory.

## Project

Pizza Delivery Optimization Web App — helps a pizzeria manager optimize delivery routes and lets drivers confirm deliveries from their phones.

## Architecture

- **Server:** Express.js + SQLite (better-sqlite3) in `server/`
- **Client:** React + Vite PWA in `client/` (not yet implemented)
- **Real-time:** Server-Sent Events (SSE) for manager dashboard updates
- **External APIs:** Nominatim (geocoding), OSRM (route optimization) — both free, no API keys

## Running the server

```bash
cd Pizza/server
npm install
npm run dev        # Starts on port 3001 with --watch
```

## Running tests

```bash
cd Pizza/server
npm test           # vitest run (all tests)
npm run test:watch # vitest in watch mode
```

## Key patterns

- All route modules export a factory function (e.g., `createOrdersRouter(db, sse)`) that receives dependencies
- Database is SQLite with WAL mode for concurrent reads during SSE
- Tests use in-memory SQLite (`:memory:`) — no test database files
- External API calls (Nominatim, OSRM) are mocked in tests via `vi.mock` / `vi.stubGlobal`
