import type { OrderStatus, OrderStatusStep } from '@/types';

export const ORDER_TIMELINE: OrderStatusStep[] = [
  {
    status: 'bestellt',
    label: 'Bestellt',
    sublabel: 'Deine Bestellung ist eingegangen',
    icon: 'CheckCircle',
    minutesFromStart: 0,
  },
  {
    status: 'angenommen',
    label: 'Angenommen',
    sublabel: 'Das Restaurant hat deine Bestellung bestätigt',
    icon: 'Store',
    minutesFromStart: 2,
  },
  {
    status: 'in_zubereitung',
    label: 'In Zubereitung',
    sublabel: 'Deine Pizza wird frisch zubereitet',
    icon: 'ChefHat',
    minutesFromStart: 5,
  },
  {
    status: 'unterwegs',
    label: 'Unterwegs',
    sublabel: 'Dein Fahrer ist auf dem Weg zu dir',
    icon: 'Bike',
    minutesFromStart: 20,
  },
  {
    status: 'geliefert',
    label: 'Geliefert',
    sublabel: 'Guten Appetit!',
    icon: 'PartyPopper',
    minutesFromStart: 0, // calculated dynamically based on distance
  },
];

/**
 * Get the expected delivery minutes based on distance
 */
export function getEstimatedDeliveryMinutes(distanceKm: number): number {
  const prepMinutes = 20;
  const deliveryMinutes = Math.ceil(distanceKm * 3);
  return prepMinutes + deliveryMinutes;
}

/**
 * Build the full status timeline with real timestamps
 */
export function buildStatusTimeline(
  placedAt: number,
  distanceKm: number
): Array<{ status: OrderStatus; timestamp: number }> {
  const totalDeliveryMinutes = getEstimatedDeliveryMinutes(distanceKm);

  return ORDER_TIMELINE.map((step) => {
    let minutes = step.minutesFromStart;
    if (step.status === 'geliefert') {
      minutes = totalDeliveryMinutes;
    }
    return {
      status: step.status,
      timestamp: placedAt + minutes * 60 * 1000,
    };
  });
}

/**
 * Given elapsed time since order placement, return the current status
 */
export function getCurrentStatus(
  placedAt: number,
  distanceKm: number,
  now: number = Date.now()
): OrderStatus {
  const elapsedMinutes = (now - placedAt) / 1000 / 60;
  const totalDeliveryMinutes = getEstimatedDeliveryMinutes(distanceKm);

  if (elapsedMinutes >= totalDeliveryMinutes) return 'geliefert';
  if (elapsedMinutes >= 20) return 'unterwegs';
  if (elapsedMinutes >= 5)  return 'in_zubereitung';
  if (elapsedMinutes >= 2)  return 'angenommen';
  return 'bestellt';
}

/**
 * Get step index (0-based) for a status
 */
export function getStatusIndex(status: OrderStatus): number {
  return ORDER_TIMELINE.findIndex(s => s.status === status);
}

/**
 * Get status info from timeline
 */
export function getStatusStep(status: OrderStatus): OrderStatusStep | undefined {
  return ORDER_TIMELINE.find(s => s.status === status);
}
