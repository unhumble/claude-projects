'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreLocation, NearestStoreResult } from '@/types';
import { findNearestStore } from '@/lib/storeMatching';
import { calculateDeliveryFee } from '@/lib/pricing';

interface StoreSelectionStore {
  selectedStore: StoreLocation | null;
  postalCode: string;
  nearestResult: NearestStoreResult | null;
  isModalOpen: boolean;
  isSearching: boolean;
  searchError: string | null;
  deliveryFee: number; // EUR cents

  // Actions
  searchByPostalCode: (plz: string) => void;
  confirmStore: () => void;
  changeStore: () => void;
  openModal: () => void;
  closeModal: () => void;
  setDeliveryFee: (subtotalCents: number) => void;
}

export const useStoreSelectionStore = create<StoreSelectionStore>()(
  persist(
    (set, get) => ({
      selectedStore: null,
      postalCode: '',
      nearestResult: null,
      isModalOpen: false,
      isSearching: false,
      searchError: null,
      deliveryFee: 299,

      searchByPostalCode: (plz) => {
        set({ isSearching: true, searchError: null });

        // Simulate brief search delay for UX
        setTimeout(() => {
          const result = findNearestStore(plz);
          if (result) {
            set({
              nearestResult: result,
              postalCode: plz,
              isSearching: false,
              isModalOpen: true,
              searchError: null,
            });
          } else {
            set({
              isSearching: false,
              searchError: 'Diese Postleitzahl liegt außerhalb unseres Liefergebiets.',
            });
          }
        }, 600);
      },

      confirmStore: () => {
        const result = get().nearestResult;
        if (result) {
          set({
            selectedStore: result.store,
            isModalOpen: false,
          });
        }
      },

      changeStore: () =>
        set({
          selectedStore: null,
          nearestResult: null,
          isModalOpen: false,
          postalCode: '',
        }),

      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),

      setDeliveryFee: (subtotalCents) => {
        const result = get().nearestResult;
        const distanceKm = result?.distanceKm ?? 3;
        set({ deliveryFee: calculateDeliveryFee(distanceKm, subtotalCents) });
      },
    }),
    {
      name: 'tassone-store',
      partialize: (state) => ({
        selectedStore: state.selectedStore,
        postalCode: state.postalCode,
        deliveryFee: state.deliveryFee,
      }),
    }
  )
);
