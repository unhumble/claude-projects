import { Router } from 'express';

export function createRoutesRouter(db, sse) {
  const router = Router();

  router.post('/', (req, res) => {
    const { driver_id, orderIds, geometry } = req.body;

    if (!driver_id || !orderIds || orderIds.length === 0) {
      return res.status(400).json({ error: 'driver_id and orderIds are required' });
    }

    const assignRoute = db.transaction(() => {
      // Create the route
      const result = db.prepare(
        'INSERT INTO routes (driver_id, stops, geometry) VALUES (?, ?, ?)'
      ).run(driver_id, JSON.stringify(orderIds), geometry ? JSON.stringify(geometry) : null);

      const routeId = result.lastInsertRowid;

      // Update all orders to assigned
      const updateOrder = db.prepare(
        "UPDATE orders SET status = 'assigned', route_id = ? WHERE id = ?"
      );
      for (const orderId of orderIds) {
        updateOrder.run(routeId, orderId);
      }

      // Update driver status
      db.prepare("UPDATE drivers SET status = 'delivering' WHERE id = ?").run(driver_id);

      return routeId;
    });

    const routeId = assignRoute();

    const route = db.prepare('SELECT * FROM routes WHERE id = ?').get(routeId);
    const orders = db.prepare(
      `SELECT * FROM orders WHERE route_id = ?`
    ).all(routeId);

    sse.broadcast({ type: 'route_assigned', route, orders });

    res.status(201).json(route);
  });

  return router;
}
