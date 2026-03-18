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
