import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createTables } from '../db.js';
import { createSSEManager } from '../sse.js';
import { createOrdersRouter } from '../routes/orders.js';

// Mock the geocode module
vi.mock('../geocode.js', () => ({
  geocodeAddress: vi.fn().mockResolvedValue({ lat: 40.7128, lng: -74.006 }),
}));

import { geocodeAddress } from '../geocode.js';

describe('Orders API', () => {
  let app, db, sse;

  beforeEach(() => {
    db = new Database(':memory:');
    createTables(db);
    sse = createSSEManager();
    app = express();
    app.use(express.json());
    app.use('/api/orders', createOrdersRouter(db, sse));
  });

  afterEach(() => {
    db.close();
    vi.clearAllMocks();
  });

  describe('POST /api/orders', () => {
    it('creates an order and geocodes the address', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'John Doe',
          address: '123 Main St',
          phone: '555-1234',
          notes: 'Ring bell',
        });

      expect(res.status).toBe(201);
      expect(res.body.customer_name).toBe('John Doe');
      expect(res.body.lat).toBe(40.7128);
      expect(res.body.lng).toBe(-74.006);
      expect(res.body.status).toBe('pending');
      expect(geocodeAddress).toHaveBeenCalledWith('123 Main St');
    });

    it('returns 400 if customer_name is missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ address: '123 Main St' });

      expect(res.status).toBe(400);
    });

    it('returns 400 if address is missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ customer_name: 'John' });

      expect(res.status).toBe(400);
    });

    it('returns 422 if geocoding fails', async () => {
      geocodeAddress.mockRejectedValueOnce(new Error('Address not found'));

      const res = await request(app)
        .post('/api/orders')
        .send({ customer_name: 'John', address: 'nonexistent' });

      expect(res.status).toBe(422);
      expect(res.body.error).toContain('Address not found');
    });
  });

  describe('GET /api/orders', () => {
    beforeEach(() => {
      db.prepare(
        "INSERT INTO orders (customer_name, address, lat, lng, status) VALUES (?, ?, ?, ?, ?)"
      ).run('Alice', '1 A St', 40.1, -74.1, 'pending');
      db.prepare(
        "INSERT INTO orders (customer_name, address, lat, lng, status) VALUES (?, ?, ?, ?, ?)"
      ).run('Bob', '2 B St', 40.2, -74.2, 'assigned');
    });

    it('returns all orders', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('filters by status', async () => {
      const res = await request(app).get('/api/orders?status=pending');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].customer_name).toBe('Alice');
    });
  });
});
