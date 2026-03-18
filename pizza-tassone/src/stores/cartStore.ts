'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';
import { calculateSubtotal } from '@/lib/pricing';

interface CartStore {
  items: CartItem[];
  isDrawerOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Computed
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (itemData) => {
        const id = crypto.randomUUID();
        set(state => ({
          items: [...state.items, { ...itemData, id }],
          isDrawerOpen: true,
        }));
      },

      removeItem: (id) =>
        set(state => ({ items: state.items.filter(i => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set(state => ({
          items: state.items.map(i => i.id === id ? { ...i, quantity } : i),
        }));
      },

      clearCart: () => set({ items: [] }),

      openDrawer:  () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set(state => ({ isDrawerOpen: !state.isDrawerOpen })),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => calculateSubtotal(get().items),
    }),
    {
      name: 'tassone-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
