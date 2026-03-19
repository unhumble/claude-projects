import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import Database from 'better-sqlite3';
import { createTables } from './db.js';
import { createSSEManager } from './sse.js';
import { createOrdersRouter } from './routes/orders.js';
import { createDriversRouter } from './routes/drivers.js';
import { createOptimizeRouter } from './routes/optimize.js';
import { createRoutesRouter } from './routes/routes.js';
import { createDriverAuthRouter } from './routes/driver-auth.js';
import { createPushRouter } from './routes/push.js';
import { createPlanRouter } from './routes/plan.js';

export function createApp(dbPath) {
  const db = new Database(dbPath || process.env.DB_PATH || 'pizza.db');
  createTables(db);

  const sse = createSSEManager();
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // SSE endpoint
  app.get('/api/events', (req, res) => {
    sse.addSubscriber(res);
  });

  // Mount routes
  app.use('/api/orders', createOrdersRouter(db, sse));
  app.use('/api/drivers', createDriversRouter(db));
  app.use('/api/optimize', createOptimizeRouter(db));
  app.use('/api/routes', createRoutesRouter(db, sse));
  app.use('/api', createDriverAuthRouter(db, sse));
  app.use('/api', createPushRouter(db));
  app.use('/api/plan', createPlanRouter(db));

  // Serve demo page
  const __dirname = dirname(fileURLToPath(import.meta.url));
  app.get('/', (req, res) => res.redirect('/demo'));
  app.get('/demo', (req, res) => {
    res.status(200).sendFile(join(__dirname, 'demo.html'));
  });
  app.get('/driver', (req, res) => {
    res.status(200).sendFile(join(__dirname, 'driver.html'));
  });

  return { app, db, sse };
}

// Start server when run directly
const __filename = fileURLToPath(import.meta.url);
if (!process.env.VITEST) {
  const PORT = process.env.PORT || 3001;
  const { app } = createApp();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
