/**
 * Format integer EUR cents to display string: 899 → "8,99 €"
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

/**
 * Format distance to human-readable: 2.347 → "2,3 km" | 0.8 → "800 m"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1).replace('.', ',')} km`;
}

/**
 * Format a Unix timestamp (ms) to local HH:MM
 */
export function formatTime(timestampMs: number): string {
  return new Date(timestampMs).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format minutes as readable ETA range: 35 → "~35–40 min"
 */
export function formatETA(minutes: number): string {
  const jitter = 5;
  return `~${minutes}–${minutes + jitter} min`;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Day name in German
 */
export const DAY_NAMES_DE: Record<string, string> = {
  monday:    'Montag',
  tuesday:   'Dienstag',
  wednesday: 'Mittwoch',
  thursday:  'Donnerstag',
  friday:    'Freitag',
  saturday:  'Samstag',
  sunday:    'Sonntag',
};
