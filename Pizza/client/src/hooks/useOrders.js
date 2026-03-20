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
          o.id === data.orderId ? { ...o, status: 'delivered' } : o,
        ),
      );
    },

    onRouteAssigned: (data) => {
      const assignedIds = new Set((data.orders || []).map((o) => o.id));
      setOrders((prev) =>
        prev.map((o) =>
          assignedIds.has(o.id)
            ? { ...o, status: 'assigned', route_id: data.route?.id }
            : o,
        ),
      );
    },
  });

  return { orders, setOrders };
}
