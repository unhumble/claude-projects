import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createTables } from '../db.js';
import { createOptimizeRouter } from '../routes/optimize.js';

// Mock fetch for OSRM calls
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Optimize API', () => {
  let app, db;

  beforeEach(() => {
    db = new Database(':memory:');
    createTables(db);
    app = express();
    app.use(express.json());
    app.use('/api/optimize', createOptimizeRouter(db));

    // Seed orders
    db.prepare(
      "INSERT INTO orders (id, customer_name, address, lat, lng, status) VALUES (?, ?, ?, ?, ?, 'pending')"
    ).run(1, 'Alice', '1 A St', 40.1, -74.1);
    db.prepare(
      "INSERT INTO orders (id, customer_name, address, lat, lng, status) VALUES (?, ?, ?, ?, ?, 'pending')"
    ).run(2, 'Bob', '2 B St', 40.2, -74.2);
    db.prepare(
      "INSERT INTO orders (id, customer_name, address, lat, lng, status) VALUES (?, ?, ?, ?, ?, 'pending')"
    ).run(3, 'Carol', '3 C St', 40.3, -74.3);

    vi.clearAllMocks();
  });

  afterEach(() => {
    db.close();
  });

  it('returns optimized order IDs and geometry', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 'Ok',
        waypoints: [
          { waypoint_index: 0 },
          { waypoint_index: 2 },
          { waypoint_index: 1 },
        ],
        trips: [{
          geometry: {
            type: 'LineString',
            coordinates: [[-74.1, 40.1], [-74.3, 40.3], [-74.2, 40.2]],
          },
        }],
      }),
    });

    const res = await request(app)
      .post('/api/optimize')
      .send({ orderIds: [1, 2, 3] });

    expect(res.status).toBe(200);
    expect(res.body.optimizedOrderIds).toEqual([1, 3, 2]);
    expect(res.body.geometry).toBeDefined();
    expect(res.body.geometry.type).toBe('LineString');
  });

  it('returns 400 if fewer than 2 orders', async () => {
    const res = await request(app)
      .post('/api/optimize')
      .send({ orderIds: [1] });

    expect(res.status).toBe(400);
  });

  it('returns 400 if order IDs not found', async () => {
    const res = await request(app)
      .post('/api/optimize')
      .send({ orderIds: [99, 100] });

    expect(res.status).toBe(400);
  });

  it('returns 502 if OSRM fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const res = await request(app)
      .post('/api/optimize')
      .send({ orderIds: [1, 2, 3] });

    expect(res.status).toBe(502);
  });
});
