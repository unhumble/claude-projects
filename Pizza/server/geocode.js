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
