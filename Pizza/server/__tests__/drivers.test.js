import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createTables } from '../db.js';
import { createDriversRouter } from '../routes/drivers.js';

describe('Drivers API', () => {
  let app, db;

  beforeEach(() => {
    db = new Database(':memory:');
    createTables(db);
    app = express();
    app.use(express.json());
    app.use('/api/drivers', createDriversRouter(db));
  });

  afterEach(() => {
    db.close();
  });

  describe('POST /api/drivers', () => {
    it('creates a driver with a unique token', async () => {
      const res = await request(app)
        .post('/api/drivers')
        .send({ name: 'Marco' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Marco');
      expect(res.body.token).toBeDefined();
      expect(res.body.token.length).toBeGreaterThan(10);
      expect(res.body.status).toBe('idle');
    });

    it('returns 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/drivers')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/drivers', () => {
    it('returns all drivers', async () => {
      db.prepare("INSERT INTO drivers (name, token) VALUES (?, ?)").run('Marco', 'tok1');
      db.prepare("INSERT INTO drivers (name, token) VALUES (?, ?)").run('Luigi', 'tok2');

      const res = await request(app).get('/api/drivers');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('DELETE /api/drivers/:id', () => {
    beforeEach(() => {
      db.prepare("INSERT INTO drivers (id, name, token, status) VALUES (10, 'Rossi', 'tok-rossi', 'idle')").run();
      db.prepare("INSERT INTO drivers (id, name, token, status) VALUES (11, 'Bianchi', 'tok-bianchi', 'delivering')").run();
      db.prepare("INSERT INTO routes (id, driver_id, stops, status) VALUES (100, 11, '[1]', 'active')").run();
    });

    it('deletes a driver with no active routes and returns 200', async () => {
      const res = await request(app).delete('/api/drivers/10');
      expect(res.status).toBe(200);
      const gone = db.prepare('SELECT * FROM drivers WHERE id = 10').get();
      expect(gone).toBeUndefined();
    });

    it('returns 404 when driver does not exist', async () => {
      const res = await request(app).delete('/api/drivers/9999');
      expect(res.status).toBe(404);
    });

    it('returns 400 when driver has an active route', async () => {
      const res = await request(app).delete('/api/drivers/11');
      expect(res.status).toBe(400);
      // Driver should still exist
      const still = db.prepare('SELECT * FROM drivers WHERE id = 11').get();
      expect(still).toBeDefined();
    });
  });
});
