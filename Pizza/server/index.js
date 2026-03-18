import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { createTables } from './db.js';
import { createSSEManager } from './sse.js';
import { createOrdersRouter } from './routes/orders.js';
import { createDriversRouter } from './routes/drivers.js';
import { createOptimizeRouter } from './routes/optimize.js';
import { createRoutesRouter } from './routes/routes.js';
import { createDriverAuthRouter } from './routes/driver-auth.js';
import { createPushRouter } from './routes/push.js';

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

  return { app, db, sse };
}

// Start server when run directly
if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const PORT = process.env.PORT || 3001;
  const { app } = createApp();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
