'use client';

import { useEffect } from 'react';
import { useOrderStore } from '@/stores/orderStore';

/**
 * Polls the order status every 5 seconds and advances simulation
 */
export function useOrderTracking() {
  const { currentOrder, syncStatus } = useOrderStore();

  useEffect(() => {
    if (!currentOrder || currentOrder.status === 'geliefert') return;

    // Sync immediately on mount
    syncStatus();

    const interval = setInterval(() => {
      syncStatus();
    }, 5000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrder?.id, currentOrder?.status]);

  return currentOrder;
}
