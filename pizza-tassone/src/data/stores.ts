import type { StoreLocation } from '@/types';

export const STORES: StoreLocation[] = [
  {
    id: 'store-singen',
    name: 'Tassone Singen',
    city: 'Singen',
    address: 'Schwarzwaldstraße 42',
    postalCode: '78224',
    lat: 47.7616,
    lng: 8.8396,
    phone: '+49 7731 185111',
    isActive: true,
    openingHours: {
      monday:    { open: '11:00', close: '23:00' },
      tuesday:   { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday:  { open: '11:00', close: '23:00' },
      friday:    { open: '11:00', close: '23:30' },
      saturday:  { open: '11:00', close: '23:30' },
      sunday:    { open: '12:00', close: '22:30' },
    },
  },
  {
    id: 'store-konstanz',
    name: 'Tassone Konstanz',
    city: 'Konstanz',
    address: 'Radolfzeller Str. 50',
    postalCode: '78467',
    lat: 47.6779,
    lng: 9.1732,
    phone: '+49 7531 698888',
    isActive: true,
    openingHours: {
      monday:    { open: '11:00', close: '23:00' },
      tuesday:   { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday:  { open: '11:00', close: '23:00' },
      friday:    { open: '11:00', close: '23:30' },
      saturday:  { open: '11:00', close: '23:30' },
      sunday:    { open: '12:00', close: '22:30' },
    },
  },
  {
    id: 'store-radolfzell',
    name: 'Tassone Radolfzell',
    city: 'Radolfzell',
    address: 'Schützenstraße 95',
    postalCode: '78315',
    lat: 47.7353,
    lng: 8.9704,
    phone: '+49 7732 XXXXXX',
    isActive: true,
    openingHours: {
      monday:    { open: '11:00', close: '23:00' },
      tuesday:   { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday:  { open: '11:00', close: '23:00' },
      friday:    { open: '11:00', close: '23:30' },
      saturday:  { open: '11:00', close: '23:30' },
      sunday:    { open: '12:00', close: '22:30' },
    },
  },
  {
    id: 'store-ueberlingen',
    name: 'Tassone Überlingen',
    city: 'Überlingen',
    address: 'Tulpenweg 1',
    postalCode: '88662',
    lat: 47.7675,
    lng: 9.1636,
    phone: '+49 7551 XXXXXX',
    isActive: true,
    openingHours: {
      monday:    { open: '11:00', close: '23:00' },
      tuesday:   { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday:  { open: '11:00', close: '23:00' },
      friday:    { open: '11:00', close: '23:30' },
      saturday:  { open: '11:00', close: '23:30' },
      sunday:    { open: '12:00', close: '22:30' },
    },
  },
  {
    id: 'store-bodman',
    name: 'Tassone Bodman-Ludwigshafen',
    city: 'Bodman-Ludwigshafen',
    address: 'Überlinger Str. 14',
    postalCode: '78351',
    lat: 47.8090,
    lng: 9.0215,
    phone: '+49 7773 XXXXXX',
    isActive: true,
    openingHours: {
      monday:    { open: '11:00', close: '23:00' },
      tuesday:   { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday:  { open: '11:00', close: '23:00' },
      friday:    { open: '11:00', close: '23:30' },
      saturday:  { open: '11:00', close: '23:30' },
      sunday:    { open: '12:00', close: '22:30' },
    },
  },
  {
    id: 'store-meersburg',
    name: 'Tassone Meersburg',
    city: 'Meersburg',
    address: 'Stettener Str. 1',
    postalCode: '88709',
    lat: 47.6948,
    lng: 9.2729,
    phone: '+49 7532 XXXXXX',
    isActive: true,
    openingHours: {
      monday:    { open: '11:00', close: '23:00' },
      tuesday:   { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday:  { open: '11:00', close: '23:00' },
      friday:    { open: '11:00', close: '23:30' },
      saturday:  { open: '11:00', close: '23:30' },
      sunday:    { open: '12:00', close: '22:30' },
    },
  },
  {
    id: 'store-stockach',
    name: 'Tassone Stockach',
    city: 'Stockach',
    address: 'Zoznegg 2',
    postalCode: '78333',
    lat: 47.8504,
    lng: 9.0107,
    phone: '+49 7771 XXXXXX',
    isActive: true,
    openingHours: {
      monday:    { open: '11:00', close: '23:00' },
      tuesday:   { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday:  { open: '11:00', close: '23:00' },
      friday:    { open: '11:00', close: '23:30' },
      saturday:  { open: '11:00', close: '23:30' },
      sunday:    { open: '12:00', close: '22:30' },
    },
  },
  {
    id: 'store-donaueschingen',
    name: 'Tassone Donaueschingen',
    city: 'Donaueschingen',
    address: 'Karlstraße 24',
    postalCode: '78166',
    lat: 47.9532,
    lng: 8.4981,
    phone: '+49 771 XXXXXX',
    isActive: true,
    openingHours: {
      monday:    { open: '11:00', close: '23:00' },
      tuesday:   { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday:  { open: '11:00', close: '23:00' },
      friday:    { open: '11:00', close: '23:30' },
      saturday:  { open: '11:00', close: '23:30' },
      sunday:    { open: '12:00', close: '22:30' },
    },
  },
];

// PLZ prefix → store ID for fast O(1) lookup
// Tier 1: exact 5-digit PLZ matches
// Tier 2: 4-digit prefix
// Tier 3: 3-digit prefix (fallback to Haversine if not found)
export const PLZ_STORE_MAP: Record<string, string> = {
  // Singen area
  '78224': 'store-singen',
  '78244': 'store-singen', // Gottmadingen
  '78234': 'store-singen', // Engen
  '78247': 'store-singen', // Hilzingen
  '78250': 'store-singen', // Tengen
  '78256': 'store-singen', // Volkertshausen

  // Konstanz area
  '78462': 'store-konstanz',
  '78464': 'store-konstanz',
  '78465': 'store-konstanz',
  '78467': 'store-konstanz',
  '78479': 'store-konstanz', // Reichenau

  // Radolfzell area
  '78315': 'store-radolfzell',
  '78333': 'store-stockach',
  '78351': 'store-bodman',
  '78354': 'store-bodman', // Sipplingen

  // Überlingen area
  '88662': 'store-ueberlingen',
  '88690': 'store-ueberlingen', // Uhldingen-Mühlhofen
  '88682': 'store-ueberlingen', // Salem

  // Meersburg area
  '88709': 'store-meersburg',
  '88719': 'store-meersburg', // Stetten
  '88085': 'store-meersburg', // Langenargen

  // Donaueschingen area
  '78166': 'store-donaueschingen',
  '78176': 'store-donaueschingen',
  '78194': 'store-donaueschingen',

  // 3-digit prefix fallbacks
  '781': 'store-singen',
  '783': 'store-radolfzell',
  '784': 'store-konstanz',
  '886': 'store-ueberlingen',
  '887': 'store-meersburg',
};

export const getStoreById = (id: string): StoreLocation | undefined =>
  STORES.find(s => s.id === id);

export const getActiveStores = (): StoreLocation[] =>
  STORES.filter(s => s.isActive);

export const isStoreOpen = (store: StoreLocation): boolean => {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof store.openingHours;
  const hours = store.openingHours[day];
  if (!hours) return false;
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return currentTime >= hours.open && currentTime <= hours.close;
};
