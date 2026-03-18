import { Router } from 'express';
import { geocodeAddress } from '../geocode.js';

export function createOrdersRouter(db, sse) {
  const router = Router();

  router.post('/', async (req, res) => {
    const { customer_name, address, phone, notes } = req.body;

    if (!customer_name || !address) {
      return res.status(400).json({ error: 'customer_name and address are required' });
    }

    let lat, lng;
    try {
      const coords = await geocodeAddress(address);
      lat = coords.lat;
      lng = coords.lng;
    } catch (err) {
      return res.status(422).json({ error: err.message });
    }

    const stmt = db.prepare(
      `INSERT INTO orders (customer_name, address, phone, notes, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(customer_name, address, phone || null, notes || null, lat, lng);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);

    sse.broadcast({ type: 'order_created', order });

    res.status(201).json(order);
  });

  router.get('/', (req, res) => {
    const { status } = req.query;

    let orders;
    if (status) {
      orders = db.prepare('SELECT * FROM orders WHERE status = ?').all(status);
    } else {
      orders = db.prepare('SELECT * FROM orders').all();
    }

    res.json(orders);
  });

  return router;
}
