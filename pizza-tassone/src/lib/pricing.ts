import type { PizzaSize, CartItem } from '@/types';
import { PIZZA_SIZES } from '@/data/menu';
import { getToppingById } from '@/data/toppings';

export const SIZE_MULTIPLIERS: Record<PizzaSize, number> = {
  klassik: 1.00,
  medium:  1.35,
  jumbo:   1.80,
  familie: 2.20,
};

/**
 * Calculate unit price for a pizza item in EUR cents
 */
export function calculatePizzaPrice(
  basePrice: number,
  size: PizzaSize,
  selectedToppingIds: string[],
  defaultToppingIds: string[]
): number {
  const multiplier = SIZE_MULTIPLIERS[size];
  const sizedBase = Math.round(basePrice * multiplier);

  // Extra toppings = selected but NOT in defaults
  const extraToppingCost = selectedToppingIds
    .filter(id => !defaultToppingIds.includes(id))
    .reduce((sum, id) => {
      const topping = getToppingById(id);
      return sum + (topping ? topping.priceExtra : 0);
    }, 0);

  // Scale topping costs by size multiplier
  return sizedBase + Math.round(extraToppingCost * multiplier);
}

/**
 * Get the human-readable size label
 */
export function getSizeLabel(size: PizzaSize): string {
  return PIZZA_SIZES.find(s => s.id === size)?.label ?? size;
}

/**
 * Delivery fee in EUR cents based on distance
 * Free above €25 subtotal
 */
export function calculateDeliveryFee(distanceKm: number, subtotalCents: number): number {
  if (subtotalCents >= 2500) return 0; // Free delivery over €25
  if (distanceKm <= 3)  return 199;
  if (distanceKm <= 7)  return 299;
  if (distanceKm <= 15) return 399;
  return 499;
}

/**
 * Sum all cart items' total value
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}
