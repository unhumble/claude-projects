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

  // DELETE /api/drivers/:id
  router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const activeRoute = db.prepare(
      "SELECT id FROM routes WHERE driver_id = ? AND status = 'active' LIMIT 1"
    ).get(id);
    if (activeRoute) {
      return res.status(400).json({ error: 'Driver has active routes and cannot be deleted' });
    }

    db.prepare('DELETE FROM drivers WHERE id = ?').run(id);
    res.status(200).json({ message: 'Driver deleted' });
  });

  return router;
}
