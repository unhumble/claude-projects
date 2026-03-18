import { Router } from 'express';
import webPush from 'web-push';

// Configure VAPID keys if available (set in .env)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@pizzeria.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export function createPushRouter(db) {
  const router = Router();

  router.post('/driver/:token/subscription', (req, res) => {
    const driver = db.prepare('SELECT * FROM drivers WHERE token = ?').get(req.params.token);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const { subscription } = req.body;

    // Upsert: delete existing, insert new
    db.prepare('DELETE FROM push_subscriptions WHERE driver_id = ?').run(driver.id);
    db.prepare(
      'INSERT INTO push_subscriptions (driver_id, subscription) VALUES (?, ?)'
    ).run(driver.id, JSON.stringify(subscription));

    res.json({ success: true });
  });

  return router;
}

/**
 * Send a push notification to a specific driver.
 * @param {Database} db - SQLite database instance
 * @param {number} driverId - The driver's ID
 * @param {object} payload - { title, body, orderId } for the notification
 */
export async function sendPushToDriver(db, driverId, payload) {
  const row = db.prepare('SELECT subscription FROM push_subscriptions WHERE driver_id = ?').get(driverId);
  if (!row) return;

  const subscription = JSON.parse(row.subscription);
  await webPush.sendNotification(subscription, JSON.stringify(payload));
}
