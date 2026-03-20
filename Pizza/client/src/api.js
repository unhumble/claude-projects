const BASE = '/api';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

// Orders
export const createOrder = (data) =>
  request('POST', '/orders', data);

export const fetchOrders = (status) =>
  request('GET', status ? `/orders?status=${status}` : '/orders');

export const deliverOrder = (id) =>
  request('PATCH', `/orders/${id}/deliver`);

// Drivers
export const createDriver = (data) =>
  request('POST', '/drivers', data);

export const fetchDrivers = () =>
  request('GET', '/drivers');

export const deleteDriver = (id) =>
  request('DELETE', `/drivers/${id}`);

// Driver login
export const driverLogin = (name) =>
  request('GET', `/driver/login?name=${encodeURIComponent(name)}`);

// Route planning
export const planRoutes = (data) =>
  request('POST', '/plan', data);

export const assignRoute = (data) =>
  request('POST', '/routes', data);

// Push subscription
export const registerPushSubscription = (token, subscription) =>
  request('POST', `/driver/${token}/subscription`, subscription);

// Nominatim geocoding (external, not proxied)
export const searchAddress = async (street) => {
  const params = new URLSearchParams({
    street,
    format: 'json',
    addressdetails: '1',
    limit: '15',
    countrycodes: 'de',
    bounded: '1',
    viewbox: '8.6,47.85,9.1,47.65',
  });
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { 'Accept-Language': 'de' } },
  );
  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);
  return res.json();
};
