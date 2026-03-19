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

## Workflow for Pizza development

### Before implementing features
- Plan route optimization changes upfront — verify algorithm correctness with tests before integration
- For delivery sequencing: always validate against real coordinates (Nominatim) in dev before claiming it works
- Use SSE verification: manually test dashboard updates in browser before marking delivery features complete

### When fixing bugs
- Check server logs first — most issues are stale Node processes or database locks (see main CLAUDE.md)
- Always run the full test suite after route optimization changes (affects multiple endpoints)
- For delivery failures: trace through database state and mocked API calls to find the root cause

### Verification checklist
- ✓ Tests pass: `npm test`
- ✓ Server starts cleanly without stale process errors
- ✓ SSE updates flow to dashboard (open browser console and check)
- ✓ Mocked API responses match expected formats
- ✓ Route calculations produce sensible sequences (spot-check coordinates)
