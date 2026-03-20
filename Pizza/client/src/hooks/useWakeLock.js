import { useEffect, useRef } from 'react';

export default function useWakeLock() {
  const lockRef = useRef(null);

  async function requestLock() {
    if (!('wakeLock' in navigator)) return;
    try {
      lockRef.current = await navigator.wakeLock.request('screen');
    } catch {
      // Silently fail — wake lock is a nice-to-have
    }
  }

  useEffect(() => {
    requestLock();

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        requestLock();
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (lockRef.current) {
        lockRef.current.release().catch(() => {});
        lockRef.current = null;
      }
    };
  }, []);
}
