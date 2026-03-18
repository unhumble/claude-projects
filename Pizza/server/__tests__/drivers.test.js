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
});
