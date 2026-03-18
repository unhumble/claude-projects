import type { NearestStoreResult, StoreLocation } from '@/types';
import { STORES, PLZ_STORE_MAP, getStoreById } from '@/data/stores';
import { PLZ_COORDINATES } from '@/data/postalCodes';
import { haversineDistance } from './distance';

/**
 * Find the nearest store for a given German postal code.
 *
 * Strategy:
 * 1. Exact 5-digit PLZ match in PLZ_STORE_MAP
 * 2. 4-digit prefix match in PLZ_STORE_MAP
 * 3. 3-digit prefix match in PLZ_STORE_MAP
 * 4. Haversine distance fallback using PLZ_COORDINATES lookup table
 * 5. Returns null if PLZ is outside the service area
 */
export function findNearestStore(plz: string): NearestStoreResult | null {
  const normalized = plz.trim().replace(/\s/g, '');

  // Validate: must be exactly 5 digits
  if (!/^\d{5}$/.test(normalized)) return null;

  const stores = STORES.filter(s => s.isActive);

  // Tier 1: exact PLZ match
  const exactMatch = PLZ_STORE_MAP[normalized];
  if (exactMatch) {
    const store = getStoreById(exactMatch);
    if (store) {
      const coords = PLZ_COORDINATES[normalized];
      const distanceKm = coords
        ? haversineDistance(coords[0], coords[1], store.lat, store.lng)
        : 0;
      return { store, distanceKm, isExactMatch: true };
    }
  }

  // Tier 2: 4-digit prefix
  const prefix4 = normalized.slice(0, 4);
  const prefix4Match = PLZ_STORE_MAP[prefix4];
  if (prefix4Match) {
    const store = getStoreById(prefix4Match);
    if (store) {
      const coords = PLZ_COORDINATES[normalized];
      const distanceKm = coords
        ? haversineDistance(coords[0], coords[1], store.lat, store.lng)
        : estimateDistanceFromPrefix(prefix4, store);
      return { store, distanceKm, isExactMatch: false };
    }
  }

  // Tier 3: 3-digit prefix
  const prefix3 = normalized.slice(0, 3);
  const prefix3Match = PLZ_STORE_MAP[prefix3];
  if (prefix3Match) {
    const store = getStoreById(prefix3Match);
    if (store) {
      const coords = PLZ_COORDINATES[normalized];
      const distanceKm = coords
        ? haversineDistance(coords[0], coords[1], store.lat, store.lng)
        : estimateDistanceFromPrefix(prefix3, store);
      return { store, distanceKm, isExactMatch: false };
    }
  }

  // Tier 4: Haversine fallback using known PLZ coordinates
  const coords = PLZ_COORDINATES[normalized];
  if (coords) {
    let nearest: StoreLocation | null = null;
    let minDistance = Infinity;

    for (const store of stores) {
      const d = haversineDistance(coords[0], coords[1], store.lat, store.lng);
      if (d < minDistance) {
        minDistance = d;
        nearest = store;
      }
    }

    if (nearest && minDistance <= 40) { // 40km max service radius
      return { store: nearest, distanceKm: minDistance, isExactMatch: false };
    }
  }

  return null;
}

/**
 * Rough distance estimate when exact PLZ coords aren't in the table
 */
function estimateDistanceFromPrefix(prefix: string, store: StoreLocation): number {
  // Find any known PLZ with same prefix to get approximate region coords
  const knownPLZ = Object.keys(PLZ_COORDINATES).find(k => k.startsWith(prefix));
  if (knownPLZ) {
    const coords = PLZ_COORDINATES[knownPLZ];
    return haversineDistance(coords[0], coords[1], store.lat, store.lng);
  }
  return 5; // Default estimate
}
