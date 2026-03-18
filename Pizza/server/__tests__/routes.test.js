import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createTables } from '../db.js';
import { createSSEManager } from '../sse.js';
import { createRoutesRouter } from '../routes/routes.js';

describe('Routes API', () => {
  let app, db, sse;

  beforeEach(() => {
    db = new Database(':memory:');
    createTables(db);
    sse = createSSEManager();
    app = express();
    app.use(express.json());
    app.use('/api/routes', createRoutesRouter(db, sse));

    // Seed driver
    db.prepare("INSERT INTO drivers (id, name, token, status) VALUES (1, 'Marco', 'tok1', 'idle')").run();

    // Seed orders
    db.prepare(
      "INSERT INTO orders (id, customer_name, address, lat, lng, status) VALUES (?, ?, ?, ?, ?, 'pending')"
    ).run(1, 'Alice', '1 A St', 40.1, -74.1);
    db.prepare(
      "INSERT INTO orders (id, customer_name, address, lat, lng, status) VALUES (?, ?, ?, ?, ?, 'pending')"
    ).run(2, 'Bob', '2 B St', 40.2, -74.2);
  });

  afterEach(() => {
    db.close();
  });

  it('creates a route, assigns orders, and updates driver status', async () => {
    const geometry = { type: 'LineString', coordinates: [[-74.1, 40.1], [-74.2, 40.2]] };

    const res = await request(app)
      .post('/api/routes')
      .send({ driver_id: 1, orderIds: [1, 2], geometry });

    expect(res.status).toBe(201);
    expect(res.body.driver_id).toBe(1);
    expect(res.body.status).toBe('active');

    // Verify orders are assigned
    const o1 = db.prepare('SELECT * FROM orders WHERE id = 1').get();
    expect(o1.status).toBe('assigned');
    expect(o1.route_id).toBe(res.body.id);

    // Verify driver status
    const driver = db.prepare('SELECT * FROM drivers WHERE id = 1').get();
    expect(driver.status).toBe('delivering');
  });

  it('returns 400 if driver_id missing', async () => {
    const res = await request(app)
      .post('/api/routes')
      .send({ orderIds: [1, 2] });

    expect(res.status).toBe(400);
  });

  it('returns 400 if orderIds missing or empty', async () => {
    const res = await request(app)
      .post('/api/routes')
      .send({ driver_id: 1, orderIds: [] });

    expect(res.status).toBe(400);
  });
});
