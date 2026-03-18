import { Router } from 'express';

const OSRM_URL = 'https://router.project-osrm.org/trip/v1/driving';

export function createOptimizeRouter(db) {
  const router = Router();

  router.post('/', async (req, res) => {
    const { orderIds } = req.body;

    if (!orderIds || orderIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 order IDs required' });
    }

    // Fetch orders from DB
    const placeholders = orderIds.map(() => '?').join(',');
    const orders = db.prepare(
      `SELECT * FROM orders WHERE id IN (${placeholders})`
    ).all(...orderIds);

    if (orders.length !== orderIds.length) {
      return res.status(400).json({ error: 'Some order IDs not found' });
    }

    // Build coordinates string (OSRM uses lng,lat)
    const orderMap = new Map(orders.map(o => [o.id, o]));
    const orderedOrders = orderIds.map(id => orderMap.get(id));
    const coords = orderedOrders.map(o => `${o.lng},${o.lat}`).join(';');

    const url = `${OSRM_URL}/${coords}?roundtrip=false&source=first&destination=last&overview=full&geometries=geojson`;

    let data;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(502).json({ error: 'Route optimization service error' });
      }
      data = await response.json();
    } catch (err) {
      return res.status(502).json({ error: 'Route optimization service error' });
    }

    if (data.code !== 'Ok') {
      return res.status(502).json({ error: 'Route optimization failed' });
    }

    // Re-map waypoint indices back to order IDs
    const optimizedOrderIds = data.waypoints.map(wp => orderIds[wp.waypoint_index]);

    res.json({
      optimizedOrderIds,
      geometry: data.trips[0].geometry,
    });
  });

  return router;
}
