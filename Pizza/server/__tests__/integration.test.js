import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../index.js';

// Mock geocode
vi.mock('../geocode.js', () => ({
  geocodeAddress: vi.fn().mockResolvedValue({ lat: 40.7128, lng: -74.006 }),
}));

// Mock OSRM fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Full integration', () => {
  let app, db;

  beforeEach(() => {
    const created = createApp(':memory:');
    app = created.app;
    db = created.db;
  });

  afterEach(() => {
    db.close();
  });

  it('full workflow: create driver -> create orders -> optimize -> assign -> deliver', async () => {
    // 1. Create a driver
    const driverRes = await request(app)
      .post('/api/drivers')
      .send({ name: 'Marco' });
    expect(driverRes.status).toBe(201);
    const driver = driverRes.body;

    // 2. Create orders
    const order1 = await request(app)
      .post('/api/orders')
      .send({ customer_name: 'Alice', address: '1 A St' });
    expect(order1.status).toBe(201);

    const order2 = await request(app)
      .post('/api/orders')
      .send({ customer_name: 'Bob', address: '2 B St' });
    expect(order2.status).toBe(201);

    // 3. Optimize route (mock OSRM)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 'Ok',
        waypoints: [{ waypoint_index: 0 }, { waypoint_index: 1 }],
        trips: [{ geometry: { type: 'LineString', coordinates: [[-74, 40], [-74, 40.1]] } }],
      }),
    });

    const optimizeRes = await request(app)
      .post('/api/optimize')
      .send({ orderIds: [order1.body.id, order2.body.id] });
    expect(optimizeRes.status).toBe(200);

    // 4. Assign route
    const routeRes = await request(app)
      .post('/api/routes')
      .send({
        driver_id: driver.id,
        orderIds: optimizeRes.body.optimizedOrderIds,
        geometry: optimizeRes.body.geometry,
      });
    expect(routeRes.status).toBe(201);

    // 5. Driver views their route
    const driverView = await request(app).get(`/api/driver/${driver.token}`);
    expect(driverView.status).toBe(200);
    expect(driverView.body.stops).toHaveLength(2);

    // 6. Mark first delivery
    const deliver1 = await request(app).patch(`/api/orders/${order1.body.id}/deliver`);
    expect(deliver1.status).toBe(200);
    expect(deliver1.body.status).toBe('delivered');

    // 7. Mark second delivery — should complete route
    const deliver2 = await request(app).patch(`/api/orders/${order2.body.id}/deliver`);
    expect(deliver2.status).toBe(200);

    // 8. Verify driver is back to idle
    const driversRes = await request(app).get('/api/drivers');
    expect(driversRes.body[0].status).toBe('idle');
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
