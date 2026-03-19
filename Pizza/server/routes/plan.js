import { Router } from 'express';

const OSRM_URL = 'https://router.project-osrm.org/trip/v1/driving';

/**
 * Geographic clustering + OSRM optimization for multi-driver route planning.
 * Groups orders by proximity, then optimizes each group's route.
 */
export function createPlanRouter(db) {
  const router = Router();

  // POST /api/plan — plan routes for multiple drivers
  // Body: { orderIds: [...], driverCount: N, origin: { lat, lng } }
  // Returns: { routes: [{ orderIds, optimizedOrderIds, geometry }, ...] }
  router.post('/', async (req, res) => {
    const { orderIds, driverCount, origin } = req.body;

    if (!orderIds || orderIds.length < 1) {
      return res.status(400).json({ error: 'At least 1 order ID required' });
    }
    if (!driverCount || driverCount < 1) {
      return res.status(400).json({ error: 'driverCount must be at least 1' });
    }

    // Fetch orders
    const placeholders = orderIds.map(() => '?').join(',');
    const orders = db.prepare(
      `SELECT * FROM orders WHERE id IN (${placeholders})`
    ).all(...orderIds);

    if (orders.length !== orderIds.length) {
      return res.status(400).json({ error: 'Some order IDs not found' });
    }

    const numClusters = Math.min(driverCount, orders.length);

    // Cluster orders geographically using k-means on lat/lng
    const clusters = kMeansCluster(orders, numClusters, origin);

    // Optimize each cluster's route via OSRM
    const routes = [];
    for (const cluster of clusters) {
      if (cluster.length === 0) continue;

      if (cluster.length === 1) {
        // Single order — build a simple route from origin to the order
        const o = cluster[0];
        let geometry = null;
        if (origin) {
          try {
            const coords = `${origin.lng},${origin.lat};${o.lng},${o.lat}`;
            const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
            const response = await fetch(url);
            if (response.ok) {
              const data = await response.json();
              if (data.code === 'Ok') {
                geometry = data.routes[0].geometry;
              }
            }
          } catch (err) {
            // Fall back to no geometry
          }
        }
        routes.push({
          orderIds: [o.id],
          optimizedOrderIds: [o.id],
          geometry,
        });
        continue;
      }

      // Multiple orders — use OSRM trip API
      let coordsList = cluster.map(o => `${o.lng},${o.lat}`);
      const clusterOrderIds = cluster.map(o => o.id);

      const hasOrigin = origin && origin.lat != null && origin.lng != null;
      if (hasOrigin) {
        coordsList.unshift(`${origin.lng},${origin.lat}`);
      }

      const coords = coordsList.join(';');
      const url = `${OSRM_URL}/${coords}?roundtrip=false&source=first&destination=any&overview=full&geometries=geojson`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          routes.push({ orderIds: clusterOrderIds, optimizedOrderIds: clusterOrderIds, geometry: null });
          continue;
        }
        const data = await response.json();
        if (data.code !== 'Ok') {
          routes.push({ orderIds: clusterOrderIds, optimizedOrderIds: clusterOrderIds, geometry: null });
          continue;
        }

        const originOffset = hasOrigin ? 1 : 0;
        const optimizedOrderIds = data.waypoints
          .slice(originOffset)
          .map(wp => clusterOrderIds[wp.waypoint_index - originOffset]);

        routes.push({
          orderIds: clusterOrderIds,
          optimizedOrderIds,
          geometry: data.trips[0].geometry,
        });
      } catch (err) {
        routes.push({ orderIds: clusterOrderIds, optimizedOrderIds: clusterOrderIds, geometry: null });
      }
    }

    res.json({ routes });
  });

  return router;
}

/**
 * Sector-based clustering from origin.
 *
 * Sorts orders by angle from origin (direction), then splits into k sectors.
 * Orders along the same direction from the pizzeria stay in the same cluster,
 * so a driver heading to the furthest order naturally passes through closer ones.
 *
 * Within each cluster, orders are sorted by scheduled deliver_at first,
 * then by creation time (id) — earlier orders get priority.
 */
function kMeansCluster(orders, k, origin) {
  if (k >= orders.length) {
    return orders.map(o => [o]);
  }

  const originLat = origin ? origin.lat : orders.reduce((s, o) => s + o.lat, 0) / orders.length;
  const originLng = origin ? origin.lng : orders.reduce((s, o) => s + o.lng, 0) / orders.length;

  // Compute angle and distance from origin for each order
  const annotated = orders.map(o => ({
    order: o,
    angle: Math.atan2(o.lat - originLat, o.lng - originLng),
    dist: haversine(o.lat, o.lng, originLat, originLng),
  }));

  // Sort by angle — groups orders in the same direction together
  annotated.sort((a, b) => a.angle - b.angle);

  // Split into k sectors by angle
  const clusters = Array.from({ length: k }, () => []);
  const sectorSize = Math.ceil(annotated.length / k);
  for (let i = 0; i < annotated.length; i++) {
    const clusterIdx = Math.min(Math.floor(i / sectorSize), k - 1);
    clusters[clusterIdx].push(annotated[i].order);
  }

  // Sort orders within each cluster: scheduled time first, then creation order
  for (const cluster of clusters) {
    cluster.sort((a, b) => {
      if (a.deliver_at && b.deliver_at) return a.deliver_at.localeCompare(b.deliver_at);
      if (a.deliver_at) return -1;
      if (b.deliver_at) return 1;
      return a.id - b.id; // earlier orders first
    });
  }

  return clusters.filter(c => c.length > 0);
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
