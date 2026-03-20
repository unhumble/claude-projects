import { useState, useEffect } from 'react';
import { fetchDrivers } from '../api.js';
import useSSE from './useSSE.js';

export default function useDrivers() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetchDrivers().then(setDrivers).catch(console.error);
  }, []);

  useSSE({
    onDriverCreated: (data) => {
      setDrivers((prev) => {
        if (prev.some((d) => d.id === data.driver.id)) return prev;
        return [...prev, data.driver];
      });
    },

    onDriverLogin: (data) => {
      setDrivers((prev) => {
        if (prev.some((d) => d.id === data.driver.id)) return prev;
        return [...prev, data.driver];
      });
    },

    onRouteCompleted: (data) => {
      setDrivers((prev) =>
        prev.map((d) =>
          d.route?.id === data.routeId
            ? { ...d, status: 'idle', route: null, progress: null }
            : d,
        ),
      );
    },

    onRouteAssigned: (data) => {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === data.route?.driver_id
            ? { ...d, status: 'delivering' }
            : d,
        ),
      );
    },
  });

  return { drivers, setDrivers };
}
