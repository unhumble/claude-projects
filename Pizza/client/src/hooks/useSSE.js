import { useEffect, useRef } from 'react';

let sharedES = null;
let listenerCount = 0;
const subscribers = new Set();

function getEventSource() {
  if (!sharedES || sharedES.readyState === EventSource.CLOSED) {
    sharedES = new EventSource('/api/events');
    sharedES.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      for (const cb of subscribers) cb(data);
    };
    sharedES.onerror = () => {
      sharedES.close();
      sharedES = null;
      setTimeout(() => {
        if (listenerCount > 0) getEventSource();
      }, 3000);
    };
  }
  return sharedES;
}

/**
 * Subscribe to the /api/events SSE stream (shared connection).
 */
export default function useSSE(handlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    listenerCount++;
    getEventSource();

    function onMessage(data) {
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
    }

    subscribers.add(onMessage);

    return () => {
      subscribers.delete(onMessage);
      listenerCount--;
      if (listenerCount === 0 && sharedES) {
        sharedES.close();
        sharedES = null;
      }
    };
  }, []);
}
