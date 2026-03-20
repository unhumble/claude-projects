import { useState, useEffect } from 'react';
import { fetchOrders } from '../api.js';
import useSSE from './useSSE.js';

export default function useOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders().then(setOrders).catch(console.error);
  }, []);

  useSSE({
    onOrderCreated: (data) => {
      setOrders((prev) => {
        // Avoid duplicates if server already echoed it
        if (prev.some((o) => o.id === data.order.id)) return prev;
        return [data.order, ...prev];
      });
    },

    onDeliveryConfirmed: (data) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === data.id
            ? { ...o, status: data.status, arrived_at: data.arrived_at }
            : o,
        ),
      );
    },

    onRouteAssigned: (data) => {
      // data.orderIds contains the ids whose status changed to 'assigned'
      setOrders((prev) =>
        prev.map((o) =>
          data.orderIds?.includes(o.id) ? { ...o, status: 'assigned' } : o,
        ),
      );
    },
  });

  return { orders, setOrders };
}
