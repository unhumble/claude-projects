import { useEffect, useRef } from 'react';

/**
 * Subscribe to the /api/events SSE stream.
 *
 * @param {object} handlers - { onOrderCreated, onDeliveryConfirmed, onRouteAssigned,
 *                              onRouteCompleted, onDriverCreated, onDriverLogin }
 */
export default function useSSE(handlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let es;
    let retryTimer;

    function connect() {
      es = new EventSource('/api/events');

      es.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        const h = handlersRef.current;
        switch (data.type) {
          case 'order_created':
            h.onOrderCreated?.(data);
            break;
          case 'delivery_confirmed':
            h.onDeliveryConfirmed?.(data);
            break;
          case 'route_assigned':
            h.onRouteAssigned?.(data);
            break;
          case 'route_completed':
            h.onRouteCompleted?.(data);
            break;
          case 'driver_created':
            h.onDriverCreated?.(data);
            break;
          case 'driver_login':
            h.onDriverLogin?.(data);
            break;
          default:
            break;
        }
      };

      es.onerror = () => {
        es.close();
        retryTimer = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      clearTimeout(retryTimer);
      es?.close();
    };
  }, []);
}
