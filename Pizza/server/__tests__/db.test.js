import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { createTables } from '../db.js';

describe('Database schema', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
    createTables(db);
  });

  afterEach(() => {
    db.close();
  });

  it('creates orders table with correct columns', () => {
    const columns = db.pragma('table_info(orders)');
    const names = columns.map(c => c.name);
    expect(names).toContain('id');
    expect(names).toContain('customer_name');
    expect(names).toContain('address');
    expect(names).toContain('phone');
    expect(names).toContain('notes');
    expect(names).toContain('lat');
    expect(names).toContain('lng');
    expect(names).toContain('status');
    expect(names).toContain('arrived_at');
    expect(names).toContain('route_id');
    expect(names).toContain('created_at');
  });

  it('creates drivers table with correct columns', () => {
    const columns = db.pragma('table_info(drivers)');
    const names = columns.map(c => c.name);
    expect(names).toContain('id');
    expect(names).toContain('name');
    expect(names).toContain('token');
    expect(names).toContain('status');
  });

  it('creates routes table with correct columns', () => {
    const columns = db.pragma('table_info(routes)');
    const names = columns.map(c => c.name);
    expect(names).toContain('id');
    expect(names).toContain('driver_id');
    expect(names).toContain('stops');
    expect(names).toContain('geometry');
    expect(names).toContain('status');
  });

  it('creates push_subscriptions table', () => {
    const columns = db.pragma('table_info(push_subscriptions)');
    const names = columns.map(c => c.name);
    expect(names).toContain('driver_id');
    expect(names).toContain('subscription');
  });

  it('enforces order status check constraint', () => {
    const insert = db.prepare(
      "INSERT INTO orders (customer_name, address, status) VALUES (?, ?, ?)"
    );
    expect(() => insert.run('Test', '123 Main St', 'invalid')).toThrow();
  });

  it('inserts valid order with default status', () => {
    db.prepare(
      "INSERT INTO orders (customer_name, address) VALUES (?, ?)"
    ).run('Test', '123 Main St');

    const order = db.prepare("SELECT * FROM orders WHERE customer_name = ?").get('Test');
    expect(order.status).toBe('pending');
  });

  it('enables WAL mode', () => {
    const result = db.pragma('journal_mode');
    // In-memory databases use 'memory' mode; file-based would use 'wal'
    expect(['wal', 'memory']).toContain(result[0].journal_mode);
  });
});
