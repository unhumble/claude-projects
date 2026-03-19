import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createTables } from '../db.js';
import { createSSEManager } from '../sse.js';
import { createDriverAuthRouter } from '../routes/driver-auth.js';

describe('Driver Auth API', () => {
  let app, db, sse;

  beforeEach(() => {
    db = new Database(':memory:');
    createTables(db);
    sse = createSSEManager();
    app = express();
    app.use(express.json());
    app.use('/api', createDriverAuthRouter(db, sse));

    // Seed data
    db.prepare("INSERT INTO drivers (id, name, token, status) VALUES (1, 'Marco', 'secret-token', 'delivering')").run();
    db.prepare(
      "INSERT INTO routes (id, driver_id, stops, status) VALUES (1, 1, '[1,2]', 'active')"
    ).run();
    db.prepare(
      "INSERT INTO orders (id, customer_name, address, lat, lng, status, route_id) VALUES (?, ?, ?, ?, ?, 'assigned', 1)"
    ).run(1, 'Alice', '1 A St', 40.1, -74.1);
    db.prepare(
      "INSERT INTO orders (id, customer_name, address, lat, lng, status, route_id) VALUES (?, ?, ?, ?, ?, 'assigned', 1)"
    ).run(2, 'Bob', '2 B St', 40.2, -74.2);
  });

  afterEach(() => {
    db.close();
  });

  describe('GET /api/driver/login', () => {
    it('creates a new driver when name does not exist', async () => {
      const res = await request(app).get('/api/driver/login?name=NewDriver');
      expect(res.status).toBe(201);
      expect(res.body.driver.name).toBe('NewDriver');
      expect(res.body.driver.token).toBeDefined();
      expect(res.body.route).toBeNull();
      expect(res.body.stops).toHaveLength(0);
    });

    it('returns existing driver with route and stops when name exists', async () => {
      const res = await request(app).get('/api/driver/login?name=Marco');
      expect(res.status).toBe(200);
      expect(res.body.driver.name).toBe('Marco');
      expect(res.body.driver.id).toBe(1);
      expect(res.body.route).toBeDefined();
      expect(res.body.stops).toHaveLength(2);
    });

    it('returns 400 when name query param is missing', async () => {
      const res = await request(app).get('/api/driver/login');
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/orders/:id/deliver', () => {
    it('marks order as delivered', async () => {
      const res = await request(app).patch('/api/orders/1/deliver');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('delivered');
      expect(res.body.arrived_at).toBeDefined();
    });

    it('completes route when all orders delivered', async () => {
      await request(app).patch('/api/orders/1/deliver');
      await request(app).patch('/api/orders/2/deliver');

      const route = db.prepare('SELECT * FROM routes WHERE id = 1').get();
      expect(route.status).toBe('completed');

      const driver = db.prepare('SELECT * FROM drivers WHERE id = 1').get();
      expect(driver.status).toBe('idle');
    });

    it('returns 404 for nonexistent order', async () => {
      const res = await request(app).patch('/api/orders/99/deliver');
      expect(res.status).toBe(404);
    });
  });
});
