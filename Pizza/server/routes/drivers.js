import { Router } from 'express';
import { randomUUID } from 'crypto';

export function createDriversRouter(db) {
  const router = Router();

  router.post('/', (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const token = randomUUID();
    const stmt = db.prepare('INSERT INTO drivers (name, token) VALUES (?, ?)');
    const result = stmt.run(name, token);

    const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(driver);
  });

  router.get('/', (req, res) => {
    const drivers = db.prepare('SELECT * FROM drivers').all();

    // Enrich each driver with current route progress
    const enriched = drivers.map(driver => {
      const route = db.prepare(
        "SELECT * FROM routes WHERE driver_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1"
      ).get(driver.id);

      if (!route) return { ...driver, route: null, progress: null };

      const orderIds = JSON.parse(route.stops);
      const delivered = db.prepare(
        `SELECT COUNT(*) as count FROM orders WHERE route_id = ? AND status = 'delivered'`
      ).get(route.id);

      return {
        ...driver,
        route,
        progress: { total: orderIds.length, delivered: delivered.count },
      };
    });

    res.json(enriched);
  });

  return router;
}
