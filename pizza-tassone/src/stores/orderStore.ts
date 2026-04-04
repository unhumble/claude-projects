'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, CartItem } from '@/types';
import { getCurrentStatus, getEstimatedDeliveryMinutes } from '@/lib/orderSimulation';

interface OrderStore {
  currentOrder: Order | null;
  orderHistory: Order[];

  // Actions
  placeOrder: (params: {
    items: CartItem[];
    storeId: string;
    storeName: string;
    subtotal: number;
    deliveryFee: number;
    postalCode: string;
    distanceKm: number;
  }) => string;
  syncStatus: () => void;
  clearCurrentOrder: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      currentOrder: null,
      orderHistory: [],

      placeOrder: ({ items, storeId, storeName, subtotal, deliveryFee, postalCode, distanceKm }) => {
        const id = `TAS-${Date.now().toString(36).toUpperCase()}`;
        const placedAt = Date.now();
        const deliveryMinutes = getEstimatedDeliveryMinutes(distanceKm);

        const order: Order = {
          id,
          items,
          storeId,
          storeName,
          status: 'bestellt',
          placedAt,
          estimatedDeliveryAt: placedAt + deliveryMinutes * 60 * 1000,
          customerPostalCode: postalCode,
          distanceKm,
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          statusHistory: [{ status: 'bestellt', timestamp: placedAt }],
        };

        set({ currentOrder: order });
        return id;
      },

      syncStatus: () => {
        const order = get().currentOrder;
        if (!order || order.status === 'geliefert') return;

        const newStatus = getCurrentStatus(order.placedAt, order.distanceKm);
        if (newStatus !== order.status) {
          const newEvent = { status: newStatus, timestamp: Date.now() };
          set({
            currentOrder: {
              ...order,
              status: newStatus,
              statusHistory: [...order.statusHistory, newEvent],
            },
          });
        }
      },

      clearCurrentOrder: () => {
        const order = get().currentOrder;
        if (order) {
          set(state => ({
            currentOrder: null,
            orderHistory: [order, ...state.orderHistory].slice(0, 20),
          }));
        }
      },
    }),
    {
      name: 'tassone-order',
    }
  )
);
