import { Router } from 'express';

export function createDriverAuthRouter(db, sse) {
  const router = Router();

  // GET /api/driver/:token — driver view
  router.get('/driver/:token', (req, res) => {
    const driver = db.prepare('SELECT * FROM drivers WHERE token = ?').get(req.params.token);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const route = db.prepare(
      "SELECT * FROM routes WHERE driver_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1"
    ).get(driver.id);

    let stops = [];
    if (route) {
      const orderIds = JSON.parse(route.stops);
      const placeholders = orderIds.map(() => '?').join(',');
      const orders = db.prepare(
        `SELECT * FROM orders WHERE id IN (${placeholders})`
      ).all(...orderIds);

      // Return stops in optimized order
      const orderMap = new Map(orders.map(o => [o.id, o]));
      stops = orderIds.map(id => orderMap.get(id)).filter(Boolean);
    }

    res.json({ driver, stops, route: route || null });
  });

  // PATCH /api/orders/:id/deliver — mark delivery
  router.patch('/orders/:id/deliver', (req, res) => {
    const orderId = parseInt(req.params.id);
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const arrivedAt = Date.now();

    // Wrap in transaction to prevent race conditions on route completion
    const result = db.transaction(() => {
      db.prepare(
        "UPDATE orders SET status = 'delivered', arrived_at = ? WHERE id = ?"
      ).run(arrivedAt, orderId);

      let routeCompleted = false;
      let driverId = null;

      if (order.route_id) {
        const route = db.prepare('SELECT * FROM routes WHERE id = ?').get(order.route_id);
        driverId = route?.driver_id;

        const remaining = db.prepare(
          "SELECT COUNT(*) as count FROM orders WHERE route_id = ? AND status != 'delivered'"
        ).get(order.route_id);

        if (remaining.count === 0) {
          db.prepare(
            "UPDATE routes SET status = 'completed', completed_at = ? WHERE id = ?"
          ).run(Date.now(), order.route_id);
          db.prepare("UPDATE drivers SET status = 'idle' WHERE id = ?").run(driverId);
          routeCompleted = true;
        }
      }

      return { routeCompleted, driverId };
    })();

    // Broadcast events outside the transaction
    sse.broadcast({ type: 'delivery_confirmed', orderId, driverId: result.driverId });
    if (result.routeCompleted) {
      sse.broadcast({ type: 'route_completed', routeId: order.route_id });
    }

    res.json({ id: orderId, status: 'delivered', arrived_at: arrivedAt });
  });

  return router;
}
