# Pizza Delivery Optimization — Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Express + SQLite backend for the pizza delivery optimization app, including all REST endpoints, geocoding, route optimization, SSE real-time events, and push notifications.

**Architecture:** Express.js server with SQLite (better-sqlite3) for persistence, Server-Sent Events for real-time push to the manager dashboard, and Web Push API for driver lock-screen notifications. All external calls (Nominatim for geocoding, OSRM for routing) go through server-side modules with rate limiting.

**Tech Stack:** Node.js, Express.js, better-sqlite3, web-push, node-fetch (for Nominatim/OSRM), vitest + supertest (testing)

**Spec:** `docs/superpowers/specs/2026-03-18-pizza-delivery-optimization-design.md`

---

## File Structure

```
Pizza/
├── server/
│   ├── package.json
│   ├── .gitignore
│   ├── index.js              # Express app entry, middleware, SSE setup, static serving
│   ├── db.js                 # SQLite schema creation, WAL mode, connection export
│   ├── sse.js                # SSE subscriber management and broadcast helper
│   ├── geocode.js            # Nominatim geocoding with 1 req/sec rate limiting
│   ├── routes/
│   │   ├── orders.js         # POST /api/orders, GET /api/orders
│   │   ├── drivers.js        # GET /api/drivers, POST /api/drivers
│   │   ├── optimize.js       # POST /api/optimize (OSRM Trip API)
│   │   ├── routes.js         # POST /api/routes (assign route to driver)
│   │   ├── driver-auth.js    # GET /api/driver/:token, PATCH /api/orders/:id/deliver
│   │   └── push.js           # POST /api/driver/:token/subscription, push sending
│   └── __tests__/
│       ├── db.test.js
│       ├── geocode.test.js
│       ├── orders.test.js
│       ├── drivers.test.js
│       ├── optimize.test.js
│       ├── routes.test.js
│       ├── driver-auth.test.js
│       ├── push.test.js
│       └── integration.test.js
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `Pizza/server/package.json`
- Create: `Pizza/server/index.js`

- [ ] **Step 1: Initialize package.json**

```bash
cd Pizza/server
npm init -y
```

Then edit `package.json` to set:

```json
{
  "name": "pizza-delivery-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd Pizza/server
npm install express better-sqlite3 web-push node-fetch uuid dotenv cors
npm install -D vitest supertest
```

- [ ] **Step 3: Create minimal Express server**

Create `Pizza/server/index.js`:

```js
import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, server };
```

- [ ] **Step 4: Verify server starts**

```bash
cd Pizza/server
node index.js
```

Expected: `Server running on port 3001`. Then Ctrl+C to stop.

- [ ] **Step 5: Commit**

```bash
git add Pizza/server/package.json Pizza/server/package-lock.json Pizza/server/index.js
git commit -m "feat(server): scaffold Express server with health endpoint"
```

---

## Task 2: Database Schema

**Files:**
- Create: `Pizza/server/db.js`
- Create: `Pizza/server/__tests__/db.test.js`

- [ ] **Step 1: Write the failing test**

Create `Pizza/server/__tests__/db.test.js`:

```js
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
    expect(result[0].journal_mode).toBe('wal');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd Pizza/server && npx vitest run __tests__/db.test.js
```

Expected: FAIL — `createTables` not found.

- [ ] **Step 3: Write the implementation**

Create `Pizza/server/db.js`:

```js
import Database from 'better-sqlite3';

export function createTables(db) {
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      notes TEXT,
      lat REAL,
      lng REAL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','assigned','delivered')),
      arrived_at INTEGER,
      route_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'idle' CHECK(status IN ('idle','delivering')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL,
      stops TEXT NOT NULL,
      geometry TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at INTEGER,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','completed')),
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );

    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER UNIQUE,
      subscription TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );
  `);
}

let db;

export function getDb() {
  if (!db) {
    db = new Database(process.env.DB_PATH || 'pizza.db');
    createTables(db);
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = undefined;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd Pizza/server && npx vitest run __tests__/db.test.js
```

Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add Pizza/server/db.js Pizza/server/__tests__/db.test.js
git commit -m "feat(server): add SQLite database schema with WAL mode"
```

---

## Task 3: SSE Broadcast Module

**Files:**
- Create: `Pizza/server/sse.js`
- Create: `Pizza/server/__tests__/sse.test.js`

- [ ] **Step 1: Write the failing test**

Create `Pizza/server/__tests__/sse.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { createSSEManager } from '../sse.js';

describe('SSE Manager', () => {
  let sse;

  beforeEach(() => {
    sse = createSSEManager();
  });

  it('adds and removes subscribers', () => {
    const mockRes = {
      writeHead: () => {},
      write: () => {},
      on: () => {},
    };
    sse.addSubscriber(mockRes);
    expect(sse.subscriberCount()).toBe(1);
    sse.removeSubscriber(mockRes);
    expect(sse.subscriberCount()).toBe(0);
  });

  it('broadcasts event to all subscribers', () => {
    const written = [];
    const mockRes = {
      writeHead: () => {},
      write: (data) => written.push(data),
      on: () => {},
    };
    sse.addSubscriber(mockRes);
    sse.broadcast({ type: 'order_created', order: { id: 1 } });
    expect(written.length).toBe(1);
    expect(written[0]).toContain('"type":"order_created"');
  });

  it('removes subscriber on close', () => {
    let closeHandler;
    const mockRes = {
      writeHead: () => {},
      write: () => {},
      on: (event, handler) => {
        if (event === 'close') closeHandler = handler;
      },
    };
    sse.addSubscriber(mockRes);
    expect(sse.subscriberCount()).toBe(1);
    closeHandler();
    expect(sse.subscriberCount()).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd Pizza/server && npx vitest run __tests__/sse.test.js
```

Expected: FAIL — `createSSEManager` not found.

- [ ] **Step 3: Write the implementation**

Create `Pizza/server/sse.js`:

```js
export function createSSEManager() {
  const subscribers = new Set();

  function addSubscriber(res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    subscribers.add(res);
    res.on('close', () => subscribers.delete(res));
  }

  function removeSubscriber(res) {
    subscribers.delete(res);
  }

  function broadcast(data) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of subscribers) {
      res.write(payload);
    }
  }

  function subscriberCount() {
    return subscribers.size;
  }

  return { addSubscriber, removeSubscriber, broadcast, subscriberCount };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd Pizza/server && npx vitest run __tests__/sse.test.js
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add Pizza/server/sse.js Pizza/server/__tests__/sse.test.js
git commit -m "feat(server): add SSE broadcast manager"
```

---

## Task 4: Geocoding Module (Nominatim)

**Files:**
- Create: `Pizza/server/geocode.js`
- Create: `Pizza/server/__tests__/geocode.test.js`

- [ ] **Step 1: Write the failing test**

Create `Pizza/server/__tests__/geocode.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geocodeAddress } from '../geocode.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('geocodeAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns lat/lng for a valid address', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ lat: '40.7128', lon: '-74.0060', display_name: 'New York' }],
    });

    const result = await geocodeAddress('123 Main St, New York');
    expect(result).toEqual({ lat: 40.7128, lng: -74.006 });
    expect(mockFetch).toHaveBeenCalledOnce();
    // Verify User-Agent header is set
    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1].headers['User-Agent']).toContain('PizzaDeliveryApp');
  });

  it('throws when address not found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await expect(geocodeAddress('nonexistent place xyz'))
      .rejects.toThrow('Address not found');
  });

  it('throws when Nominatim returns error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(geocodeAddress('123 Main St'))
      .rejects.toThrow('Geocoding service error');
  });

  it('rate limits to 1 request per second', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [{ lat: '40.7', lon: '-74.0', display_name: 'NYC' }],
    });

    const start = Date.now();
    await geocodeAddress('Address 1');
    await geocodeAddress('Address 2');
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(900); // ~1 second gap
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd Pizza/server && npx vitest run __tests__/geocode.test.js
```

Expected: FAIL — `geocodeAddress` not found.

- [ ] **Step 3: Write the implementation**

Create `Pizza/server/geocode.js`:

```js
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'PizzaDeliveryApp/1.0 (admin@pizzeria.com)';
const RATE_LIMIT_MS = 1000;

let lastRequestTime = 0;

async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLast));
  }
  lastRequestTime = Date.now();
}

export async function geocodeAddress(address) {
  await waitForRateLimit();

  const params = new URLSearchParams({
    q: address,
    format: 'json',
    limit: '1',
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) {
    throw new Error('Geocoding service error');
  }

  const results = await response.json();

  if (results.length === 0) {
    throw new Error('Address not found');
  }

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd Pizza/server && npx vitest run __tests__/geocode.test.js
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add Pizza/server/geocode.js Pizza/server/__tests__/geocode.test.js
git commit -m "feat(server): add Nominatim geocoding with rate limiting"
```

---

## Task 5: Orders API

**Files:**
- Create: `Pizza/server/routes/orders.js`
- Create: `Pizza/server/__tests__/orders.test.js`

- [ ] **Step 1: Write the failing test**

Create `Pizza/server/__tests__/orders.test.js`:

```js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createTables } from '../db.js';
import { createSSEManager } from '../sse.js';
import { createOrdersRouter } from '../routes/orders.js';

// Mock the geocode module
vi.mock('../geocode.js', () => ({
  geocodeAddress: vi.fn().mockResolvedValue({ lat: 40.7128, lng: -74.006 }),
}));

import { geocodeAddress } from '../geocode.js';

describe('Orders API', () => {
  let app, db, sse;

  beforeEach(() => {
    db = new Database(':memory:');
    createTables(db);
    sse = createSSEManager();
    app = express();
    app.use(express.json());
    app.use('/api/orders', createOrdersRouter(db, sse));
  });

  afterEach(() => {
    db.close();
    vi.clearAllMocks();
  });

  describe('POST /api/orders', () => {
    it('creates an order and geocodes the address', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'John Doe',
          address: '123 Main St',
          phone: '555-1234',
          notes: 'Ring bell',
        });

      expect(res.status).toBe(201);
      expect(res.body.customer_name).toBe('John Doe');
      expect(res.body.lat).toBe(40.7128);
      expect(res.body.lng).toBe(-74.006);
      expect(res.body.status).toBe('pending');
      expect(geocodeAddress).toHaveBeenCalledWith('123 Main St');
    });

    it('returns 400 if customer_name is missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ address: '123 Main St' });

      expect(res.status).toBe(400);
    });

    it('returns 400 if address is missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ customer_name: 'John' });

      expect(res.status).toBe(400);
    });

    it('returns 422 if geocoding fails', async () => {
      geocodeAddress.mockRejectedValueOnce(new Error('Address not found'));

      const res = await request(app)
        .post('/api/orders')
        .send({ customer_name: 'John', address: 'nonexistent' });

      expect(res.status).toBe(422);
      expect(res.body.error).toContain('Address not found');
    });
  });

  describe('GET /api/orders', () => {
    beforeEach(() => {
      db.prepare(
        "INSERT INTO orders (customer_name, address, lat, lng, status) VALUES (?, ?, ?, ?, ?)"
      ).run('Alice', '1 A St', 40.1, -74.1, 'pending');
      db.prepare(
        "INSERT INTO orders (customer_name, address, lat, lng, status) VALUES (?, ?, ?, ?, ?)"
      ).run('Bob', '2 B St', 40.2, -74.2, 'assigned');
    });

    it('returns all orders', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('filters by status', async () => {
      const res = await request(app).get('/api/orders?status=pending');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].customer_name).toBe('Alice');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd Pizza/server && npx vitest run __tests__/orders.test.js
```

Expected: FAIL — `createOrdersRouter` not found.

- [ ] **Step 3: Write the implementation**

Create `Pizza/server/routes/orders.js`:

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd Pizza/server && npx vitest run __tests__/orders.test.js
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add Pizza/server/routes/orders.js Pizza/server/__tests__/orders.test.js
git commit -m "feat(server): add Orders API with geocoding and SSE broadcast"
```

---

## Task 6: Drivers API

**Files:**
- Create: `Pizza/server/routes/drivers.js`
- Create: `Pizza/server/__tests__/drivers.test.js`

- [ ] **Step 1: Write the failing test**

Create `Pizza/server/__tests__/drivers.test.js`:

```js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createTables } from '../db.js';
import { createDriversRouter } from '../routes/drivers.js';

describe('Drivers API', () => {
  let app, db;

  beforeEach(() => {
    db = new Database(':memory:');
    createTables(db);
    app = express();
    app.use(express.json());
    app.use('/api/drivers', createDriversRouter(db));
  });

  afterEach(() => {
    db.close();
  });

  describe('POST /api/drivers', () => {
    it('creates a driver with a unique token', async () => {
      const res = await request(app)
        .post('/api/drivers')
        .send({ name: 'Marco' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Marco');
      expect(res.body.token).toBeDefined();
      expect(res.body.token.length).toBeGreaterThan(10);
      expect(res.body.status).toBe('idle');
    });

    it('returns 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/drivers')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/drivers', () => {
    it('returns all drivers', async () => {
      db.prepare("INSERT INTO drivers (name, token) VALUES (?, ?)").run('Marco', 'tok1');
      db.prepare("INSERT INTO drivers (name, token) VALUES (?, ?)").run('Luigi', 'tok2');

      const res = await request(app).get('/api/drivers');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd Pizza/server && npx vitest run __tests__/drivers.test.js
```

Expected: FAIL — `createDriversRouter` not found.

- [ ] **Step 3: Write the implementation**

Create `Pizza/server/routes/drivers.js`:

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd Pizza/server && npx vitest run __tests__/drivers.test.js
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add Pizza/server/routes/drivers.js Pizza/server/__tests__/drivers.test.js
git commit -m "feat(server): add Drivers API with UUID token generation"
```

---

## Task 7: Route Optimization (OSRM)

**Files:**
- Create: `Pizza/server/routes/optimize.js`
- Create: `Pizza/server/__tests__/optimize.test.js`

- [ ] **Step 1: Write the failing test**

Create `Pizza/server/__tests__/optimize.test.js`:

```js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createTables } from '../db.js';
import { createOptimizeRouter } from '../routes/optimize.js';

// Mock fetch for OSRM calls
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Optimize API', () => {
  let app, db;

  beforeEach(() => {
    db = new Database(':memory:');
    createTables(db);
    app = express();
    app.use(express.json());
    app.use('/api/optimize', createOptimizeRouter(db));

    // Seed orders
    db.prepare(
      "INSERT INTO orders (id, customer_name, address, lat, lng, status) VALUES (?, ?, ?, ?, ?, 'pending')"
    ).run(1, 'Alice', '1 A St', 40.1, -74.1);
    db.prepare(
      "INSERT INTO orders (id, customer_name, address, lat, lng, status) VALUES (?, ?, ?, ?, ?, 'pending')"
    ).run(2, 'Bob', '2 B St', 40.2, -74.2);
    db.prepare(
      "INSERT INTO orders (id, customer_name, address, lat, lng, status) VALUES (?, ?, ?, ?, ?, 'pending')"
    ).run(3, 'Carol', '3 C St', 40.3, -74.3);

    vi.clearAllMocks();
  });

  afterEach(() => {
    db.close();
  });

  it('returns optimized order IDs and geometry', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 'Ok',
        waypoints: [
          { waypoint_index: 0 },
          { waypoint_index: 2 },
          { waypoint_index: 1 },
        ],
        trips: [{
          geometry: {
            type: 'LineString',
            coordinates: [[-74.1, 40.1], [-74.3, 40.3], [-74.2, 40.2]],
          },
        }],
      }),
    });

    const res = await request(app)
      .post('/api/optimize')
      .send({ orderIds: [1, 2, 3] });

    expect(res.status).toBe(200);
    // OSRM reorders: index 0->order1, index 2->order3, index 1->order2
    expect(res.body.optimizedOrderIds).toEqual([1, 3, 2]);
    expect(res.body.geometry).toBeDefined();
    expect(res.body.geometry.type).toBe('LineString');
  });

  it('returns 400 if fewer than 2 orders', async () => {
    const res = await request(app)
      .post('/api/optimize')
      .send({ orderIds: [1] });

    expect(res.status).toBe(400);
  });

  it('returns 400 if order IDs not found', async () => {
    const res = await request(app)
      .post('/api/optimize')
      .send({ orderIds: [99, 100] });

    expect(res.status).toBe(400);
  });

  it('returns 502 if OSRM fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const res = await request(app)
      .post('/api/optimize')
      .send({ orderIds: [1, 2, 3] });

    expect(res.status).toBe(502);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd Pizza/server && npx vitest run __tests__/optimize.test.js
```

Expected: FAIL — `createOptimizeRouter` not found.

- [ ] **Step 3: Write the implementation**

Create `Pizza/server/routes/optimize.js`:

```js
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
    // Maintain the order of orderIds for correct waypoint mapping
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd Pizza/server && npx vitest run __tests__/optimize.test.js
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add Pizza/server/routes/optimize.js Pizza/server/__tests__/optimize.test.js
git commit -m "feat(server): add route optimization via OSRM Trip API"
```

---

## Task 8: Route Assignment API

**Files:**
- Create: `Pizza/server/routes/routes.js`
- Create: `Pizza/server/__tests__/routes.test.js`

- [ ] **Step 1: Write the failing test**

Create `Pizza/server/__tests__/routes.test.js`:

```js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createTables } from '../db.js';
import { createSSEManager } from '../sse.js';
import { createRoutesRouter } from '../routes/routes.js';

describe('Routes API', () => {
  let app, db, sse;

  beforeEach(() => {
    db = new Database(':memory:');
    createTables(db);
    sse = createSSEManager();
    app = express();
    app.use(express.json());
    app.use('/api/routes', createRoutesRouter(db, sse));

    // Seed driver
    db.prepare("INSERT INTO drivers (id, name, token, status) VALUES (1, 'Marco', 'tok1', 'idle')").run();

    // Seed orders
    db.prepare(
      "INSERT INTO orders (id, customer_name, address, lat, lng, status) VALUES (?, ?, ?, ?, ?, 'pending')"
    ).run(1, 'Alice', '1 A St', 40.1, -74.1);
    db.prepare(
      "INSERT INTO orders (id, customer_name, address, lat, lng, status) VALUES (?, ?, ?, ?, ?, 'pending')"
    ).run(2, 'Bob', '2 B St', 40.2, -74.2);
  });

  afterEach(() => {
    db.close();
  });

  it('creates a route, assigns orders, and updates driver status', async () => {
    const geometry = { type: 'LineString', coordinates: [[-74.1, 40.1], [-74.2, 40.2]] };

    const res = await request(app)
      .post('/api/routes')
      .send({ driver_id: 1, orderIds: [1, 2], geometry });

    expect(res.status).toBe(201);
    expect(res.body.driver_id).toBe(1);
    expect(res.body.status).toBe('active');

    // Verify orders are assigned
    const o1 = db.prepare('SELECT * FROM orders WHERE id = 1').get();
    expect(o1.status).toBe('assigned');
    expect(o1.route_id).toBe(res.body.id);

    // Verify driver status
    const driver = db.prepare('SELECT * FROM drivers WHERE id = 1').get();
    expect(driver.status).toBe('delivering');
  });

  it('returns 400 if driver_id missing', async () => {
    const res = await request(app)
      .post('/api/routes')
      .send({ orderIds: [1, 2] });

    expect(res.status).toBe(400);
  });

  it('returns 400 if orderIds missing or empty', async () => {
    const res = await request(app)
      .post('/api/routes')
      .send({ driver_id: 1, orderIds: [] });

    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd Pizza/server && npx vitest run __tests__/routes.test.js
```

Expected: FAIL — `createRoutesRouter` not found.

- [ ] **Step 3: Write the implementation**

Create `Pizza/server/routes/routes.js`:

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd Pizza/server && npx vitest run __tests__/routes.test.js
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add Pizza/server/routes/routes.js Pizza/server/__tests__/routes.test.js
git commit -m "feat(server): add route assignment API with transaction"
```

---

## Task 9: Driver Auth & Delivery Confirmation

**Files:**
- Create: `Pizza/server/routes/driver-auth.js`
- Create: `Pizza/server/__tests__/driver-auth.test.js`

- [ ] **Step 1: Write the failing test**

Create `Pizza/server/__tests__/driver-auth.test.js`:

```js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createTables } from '../db.js';
import { createSSEManager } from '../sse.js';
import { createDriverAuthRouter } from '../routes/driver-auth.js';

describe('Driver Auth API', () => {
  let app, db, sse;

  beforeEach(() => {
    db = new Database(':memory:');
    createTables(db);
    sse = createSSEManager();
    app = express();
    app.use(express.json());
    app.use('/api', createDriverAuthRouter(db, sse));

    // Seed data
    db.prepare("INSERT INTO drivers (id, name, token, status) VALUES (1, 'Marco', 'secret-token', 'delivering')").run();
    db.prepare(
      "INSERT INTO routes (id, driver_id, stops, status) VALUES (1, 1, '[1,2]', 'active')"
    ).run();
    db.prepare(
      "INSERT INTO orders (id, customer_name, address, lat, lng, status, route_id) VALUES (?, ?, ?, ?, ?, 'assigned', 1)"
    ).run(1, 'Alice', '1 A St', 40.1, -74.1);
    db.prepare(
      "INSERT INTO orders (id, customer_name, address, lat, lng, status, route_id) VALUES (?, ?, ?, ?, ?, 'assigned', 1)"
    ).run(2, 'Bob', '2 B St', 40.2, -74.2);
  });

  afterEach(() => {
    db.close();
  });

  describe('GET /api/driver/:token', () => {
    it('returns driver info with stops and route', async () => {
      const res = await request(app).get('/api/driver/secret-token');
      expect(res.status).toBe(200);
      expect(res.body.driver.name).toBe('Marco');
      expect(res.body.stops).toHaveLength(2);
      expect(res.body.route).toBeDefined();
    });

    it('returns 404 for invalid token', async () => {
      const res = await request(app).get('/api/driver/bad-token');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/orders/:id/deliver', () => {
    it('marks order as delivered', async () => {
      const res = await request(app).patch('/api/orders/1/deliver');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('delivered');
      expect(res.body.arrived_at).toBeDefined();
    });

    it('completes route when all orders delivered', async () => {
      await request(app).patch('/api/orders/1/deliver');
      await request(app).patch('/api/orders/2/deliver');

      const route = db.prepare('SELECT * FROM routes WHERE id = 1').get();
      expect(route.status).toBe('completed');

      const driver = db.prepare('SELECT * FROM drivers WHERE id = 1').get();
      expect(driver.status).toBe('idle');
    });

    it('returns 404 for nonexistent order', async () => {
      const res = await request(app).patch('/api/orders/99/deliver');
      expect(res.status).toBe(404);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd Pizza/server && npx vitest run __tests__/driver-auth.test.js
```

Expected: FAIL — `createDriverAuthRouter` not found.

- [ ] **Step 3: Write the implementation**

Create `Pizza/server/routes/driver-auth.js`:

```js
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

    // Broadcast events outside the transaction, in spec order
    sse.broadcast({ type: 'delivery_confirmed', orderId, driverId: result.driverId });
    if (result.routeCompleted) {
      sse.broadcast({ type: 'route_completed', routeId: order.route_id });
    }

    res.json({ id: orderId, status: 'delivered', arrived_at: arrivedAt });
  });

  return router;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd Pizza/server && npx vitest run __tests__/driver-auth.test.js
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add Pizza/server/routes/driver-auth.js Pizza/server/__tests__/driver-auth.test.js
git commit -m "feat(server): add driver auth and delivery confirmation with route completion"
```

---

## Task 10: Push Notifications

**Files:**
- Create: `Pizza/server/routes/push.js`
- Create: `Pizza/server/__tests__/push.test.js`

- [ ] **Step 1: Write the failing test**

Create `Pizza/server/__tests__/push.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd Pizza/server && npx vitest run __tests__/push.test.js
```

Expected: FAIL — `createPushRouter` not found.

- [ ] **Step 3: Write the implementation**

Create `Pizza/server/routes/push.js`:

```js
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
 * Called when driver taps "I'm Here" — sends lock-screen action to confirm delivery.
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd Pizza/server && npx vitest run __tests__/push.test.js
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add Pizza/server/routes/push.js Pizza/server/__tests__/push.test.js
git commit -m "feat(server): add push notification subscription endpoint"
```

---

## Task 11: Wire Everything Into index.js + SSE Endpoint

**Files:**
- Modify: `Pizza/server/index.js`
- Create: `Pizza/server/__tests__/integration.test.js`

- [ ] **Step 1: Write the integration test**

Create `Pizza/server/__tests__/integration.test.js`:

```js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../index.js';

// Mock geocode
vi.mock('../geocode.js', () => ({
  geocodeAddress: vi.fn().mockResolvedValue({ lat: 40.7128, lng: -74.006 }),
}));

// Mock OSRM fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Full integration', () => {
  let app, db;

  beforeEach(() => {
    const created = createApp(':memory:');
    app = created.app;
    db = created.db;
  });

  afterEach(() => {
    db.close();
  });

  it('full workflow: create driver -> create orders -> optimize -> assign -> deliver', async () => {
    // 1. Create a driver
    const driverRes = await request(app)
      .post('/api/drivers')
      .send({ name: 'Marco' });
    expect(driverRes.status).toBe(201);
    const driver = driverRes.body;

    // 2. Create orders
    const order1 = await request(app)
      .post('/api/orders')
      .send({ customer_name: 'Alice', address: '1 A St' });
    expect(order1.status).toBe(201);

    const order2 = await request(app)
      .post('/api/orders')
      .send({ customer_name: 'Bob', address: '2 B St' });
    expect(order2.status).toBe(201);

    // 3. Optimize route (mock OSRM)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 'Ok',
        waypoints: [{ waypoint_index: 0 }, { waypoint_index: 1 }],
        trips: [{ geometry: { type: 'LineString', coordinates: [[-74, 40], [-74, 40.1]] } }],
      }),
    });

    const optimizeRes = await request(app)
      .post('/api/optimize')
      .send({ orderIds: [order1.body.id, order2.body.id] });
    expect(optimizeRes.status).toBe(200);

    // 4. Assign route
    const routeRes = await request(app)
      .post('/api/routes')
      .send({
        driver_id: driver.id,
        orderIds: optimizeRes.body.optimizedOrderIds,
        geometry: optimizeRes.body.geometry,
      });
    expect(routeRes.status).toBe(201);

    // 5. Driver views their route
    const driverView = await request(app).get(`/api/driver/${driver.token}`);
    expect(driverView.status).toBe(200);
    expect(driverView.body.stops).toHaveLength(2);

    // 6. Mark first delivery
    const deliver1 = await request(app).patch(`/api/orders/${order1.body.id}/deliver`);
    expect(deliver1.status).toBe(200);
    expect(deliver1.body.status).toBe('delivered');

    // 7. Mark second delivery — should complete route
    const deliver2 = await request(app).patch(`/api/orders/${order2.body.id}/deliver`);
    expect(deliver2.status).toBe(200);

    // 8. Verify driver is back to idle
    const driversRes = await request(app).get('/api/drivers');
    expect(driversRes.body[0].status).toBe('idle');
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd Pizza/server && npx vitest run __tests__/integration.test.js
```

Expected: FAIL — `createApp` not found (index.js doesn't export it yet).

- [ ] **Step 3: Rewrite index.js to wire all routes**

Rewrite `Pizza/server/index.js`:

```js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { createTables } from './db.js';
import { createSSEManager } from './sse.js';
import { createOrdersRouter } from './routes/orders.js';
import { createDriversRouter } from './routes/drivers.js';
import { createOptimizeRouter } from './routes/optimize.js';
import { createRoutesRouter } from './routes/routes.js';
import { createDriverAuthRouter } from './routes/driver-auth.js';
import { createPushRouter } from './routes/push.js';

export function createApp(dbPath) {
  const db = new Database(dbPath || process.env.DB_PATH || 'pizza.db');
  createTables(db);

  const sse = createSSEManager();
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // SSE endpoint
  app.get('/api/events', (req, res) => {
    sse.addSubscriber(res);
  });

  // Mount routes
  app.use('/api/orders', createOrdersRouter(db, sse));
  app.use('/api/drivers', createDriversRouter(db));
  app.use('/api/optimize', createOptimizeRouter(db));
  app.use('/api/routes', createRoutesRouter(db, sse));
  app.use('/api', createDriverAuthRouter(db, sse));
  app.use('/api', createPushRouter(db));

  return { app, db, sse };
}

// Start server when run directly
if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const PORT = process.env.PORT || 3001;
  const { app } = createApp();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

- [ ] **Step 4: Run all tests**

```bash
cd Pizza/server && npx vitest run
```

Expected: All tests across all files PASS.

- [ ] **Step 5: Commit**

```bash
git add Pizza/server/index.js Pizza/server/__tests__/integration.test.js
git commit -m "feat(server): wire all routes into Express app with SSE and integration test"
```

---

## Task 12: Update Pizza CLAUDE.md

**Files:**
- Modify: `Pizza/CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md for the new project**

Replace `Pizza/CLAUDE.md` contents with:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working in the Pizza/ directory.

## Project

Pizza Delivery Optimization Web App — helps a pizzeria manager optimize delivery routes and lets drivers confirm deliveries from their phones.

## Architecture

- **Server:** Express.js + SQLite (better-sqlite3) in `server/`
- **Client:** React + Vite PWA in `client/` (not yet implemented)
- **Real-time:** Server-Sent Events (SSE) for manager dashboard updates
- **External APIs:** Nominatim (geocoding), OSRM (route optimization) — both free, no API keys

## Running the server

```bash
cd Pizza/server
npm install
npm run dev        # Starts on port 3001 with --watch
```

## Running tests

```bash
cd Pizza/server
npm test           # vitest run (all tests)
npm run test:watch # vitest in watch mode
```

## Key patterns

- All route modules export a factory function (e.g., `createOrdersRouter(db, sse)`) that receives dependencies
- Database is SQLite with WAL mode for concurrent reads during SSE
- Tests use in-memory SQLite (`:memory:`) — no test database files
- External API calls (Nominatim, OSRM) are mocked in tests via `vi.mock` / `vi.stubGlobal`
```

- [ ] **Step 2: Commit**

```bash
git add Pizza/CLAUDE.md
git commit -m "docs: update Pizza CLAUDE.md for delivery optimization app"
```

---

## Task 13: Add .gitignore

**Files:**
- Create: `Pizza/server/.gitignore`

- [ ] **Step 1: Create .gitignore**

Create `Pizza/server/.gitignore`:

```
node_modules/
*.db
.env
```

- [ ] **Step 2: Commit**

```bash
git add Pizza/server/.gitignore
git commit -m "chore: add server .gitignore"
```
