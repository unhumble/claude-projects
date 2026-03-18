// ─── Menu Models ───────────────────────────────────────────────────────────────

export type PizzaSize = 'klassik' | 'medium' | 'jumbo' | 'familie';

export interface PizzaSizeOption {
  id: PizzaSize;
  label: string;
  diameter: string;
  serves: string;
  priceMultiplier: number;
}

export type MenuCategory = 'pizza' | 'pasta' | 'dessert' | 'drink';

export interface MenuItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: MenuCategory;
  basePrice: number; // EUR cents
  image: string;
  tags: string[];
  isAvailable: boolean;
  availableSizes?: PizzaSize[];
  defaultToppingIds?: string[];
  allowCustomization?: boolean;
  // Non-pizza options
  options?: ItemOption[];
}

export interface ItemOption {
  id: string;
  label: string;
  priceExtra: number; // EUR cents
}

export interface Topping {
  id: string;
  name: string;
  category: 'cheese' | 'meat' | 'vegetable' | 'sauce' | 'extra';
  priceExtra: number; // EUR cents
  isDefault: boolean;
  emoji: string;
}

// ─── Store Models ──────────────────────────────────────────────────────────────

export interface StoreLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  postalCode: string;
  lat: number;
  lng: number;
  phone: string;
  openingHours: OpeningHours;
  isActive: boolean;
}

export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface OpeningHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string;  // "11:00"
  close: string; // "23:00"
}

// ─── Cart Models ───────────────────────────────────────────────────────────────

export interface CartItem {
  id: string; // UUID
  menuItemId: string;
  name: string;
  size?: PizzaSize;
  sizeName?: string;
  selectedToppingIds: string[];
  removedToppingIds: string[];
  quantity: number;
  unitPrice: number; // EUR cents
  image: string;
  notes?: string;
}

// ─── Order Models ──────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'bestellt'
  | 'angenommen'
  | 'in_zubereitung'
  | 'unterwegs'
  | 'geliefert';

export interface OrderStatusStep {
  status: OrderStatus;
  label: string;
  sublabel: string;
  icon: string;
  minutesFromStart: number;
}

export interface StatusEvent {
  status: OrderStatus;
  timestamp: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  storeId: string;
  storeName: string;
  status: OrderStatus;
  placedAt: number; // Unix timestamp ms
  estimatedDeliveryAt: number;
  customerPostalCode: string;
  customerAddress?: string;
  distanceKm: number;
  subtotal: number; // EUR cents
  deliveryFee: number; // EUR cents
  total: number; // EUR cents
  statusHistory: StatusEvent[];
}

// ─── Store Selection ───────────────────────────────────────────────────────────

export interface NearestStoreResult {
  store: StoreLocation;
  distanceKm: number;
  isExactMatch: boolean;
}
