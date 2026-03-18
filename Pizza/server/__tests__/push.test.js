import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createTables } from '../db.js';
import { createPushRouter, sendPushToDriver } from '../routes/push.js';

// Mock web-push
vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue({}),
  },
}));

import webPush from 'web-push';

describe('Push API', () => {
  let app, db;

  beforeEach(() => {
    db = new Database(':memory:');
    createTables(db);
    app = express();
    app.use(express.json());
    app.use('/api', createPushRouter(db));

    // Seed driver
    db.prepare("INSERT INTO drivers (id, name, token, status) VALUES (1, 'Marco', 'tok1', 'idle')").run();

    vi.clearAllMocks();
  });

  afterEach(() => {
    db.close();
  });

  describe('POST /api/driver/:token/subscription', () => {
    it('saves a push subscription for the driver', async () => {
      const subscription = { endpoint: 'https://fcm.googleapis.com/...', keys: { p256dh: 'abc', auth: 'xyz' } };

      const res = await request(app)
        .post('/api/driver/tok1/subscription')
        .send({ subscription });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const saved = db.prepare('SELECT * FROM push_subscriptions WHERE driver_id = 1').get();
      expect(saved).toBeDefined();
      expect(JSON.parse(saved.subscription).endpoint).toBe(subscription.endpoint);
    });

    it('replaces existing subscription on re-subscribe', async () => {
      const sub1 = { endpoint: 'https://old', keys: { p256dh: 'a', auth: 'b' } };
      const sub2 = { endpoint: 'https://new', keys: { p256dh: 'c', auth: 'd' } };

      await request(app).post('/api/driver/tok1/subscription').send({ subscription: sub1 });
      await request(app).post('/api/driver/tok1/subscription').send({ subscription: sub2 });

      const all = db.prepare('SELECT * FROM push_subscriptions WHERE driver_id = 1').all();
      expect(all).toHaveLength(1);
      expect(JSON.parse(all[0].subscription).endpoint).toBe('https://new');
    });

    it('returns 404 for invalid token', async () => {
      const res = await request(app)
        .post('/api/driver/bad/subscription')
        .send({ subscription: {} });

      expect(res.status).toBe(404);
    });
  });

  describe('sendPushToDriver', () => {
    it('sends a push notification to a subscribed driver', async () => {
      const subscription = { endpoint: 'https://fcm.googleapis.com/test', keys: { p256dh: 'abc', auth: 'xyz' } };
      db.prepare(
        'INSERT INTO push_subscriptions (driver_id, subscription) VALUES (?, ?)'
      ).run(1, JSON.stringify(subscription));

      await sendPushToDriver(db, 1, { title: 'Delivery', body: 'Mark as delivered?', orderId: 42 });

      expect(webPush.sendNotification).toHaveBeenCalledOnce();
      const [sub, payload] = webPush.sendNotification.mock.calls[0];
      expect(sub.endpoint).toBe('https://fcm.googleapis.com/test');
      const parsed = JSON.parse(payload);
      expect(parsed.title).toBe('Delivery');
      expect(parsed.orderId).toBe(42);
    });

    it('does nothing if driver has no subscription', async () => {
      await sendPushToDriver(db, 1, { title: 'Test', body: 'Test' });
      expect(webPush.sendNotification).not.toHaveBeenCalled();
    });
  });
});
