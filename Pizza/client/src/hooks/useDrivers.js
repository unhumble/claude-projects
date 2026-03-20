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
          d.id === data.driver_id ? { ...d, status: 'idle' } : d,
        ),
      );
    },
  });

  return { drivers, setDrivers };
}
