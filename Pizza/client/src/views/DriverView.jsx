import { useState, useEffect, useCallback, useRef } from 'react';
import LoginScreen from '../components/driver/LoginScreen.jsx';
import ProgressHeader from '../components/driver/ProgressHeader.jsx';
import StopList from '../components/driver/StopList.jsx';
import Toast from '../components/Toast.jsx';
import useSSE from '../hooks/useSSE.js';
import useWakeLock from '../hooks/useWakeLock.js';
import { driverLogin, deliverOrder } from '../api.js';

const STORAGE_KEY = 'pizza_driver_name';

// Inject global styles for animations that can't be done inline
const globalStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseBorder {
    0%, 100% { box-shadow: 0 0 0 1px rgba(255,106,0,0.35), inset 0 0 30px rgba(255,106,0,0.12); }
    50% { box-shadow: 0 0 0 3px rgba(255,106,0,0.35), inset 0 0 40px rgba(255,106,0,0.15); }
  }
  body { -webkit-tap-highlight-color: transparent; }
`;

function useInjectStyles(css) {
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = css;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
}

function AppScreen({ driverData, onSignOut, onStopsUpdate }) {
  useWakeLock();

  const [stops, setStops] = useState(driverData.stops || []);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const toastTimer = useRef(null);
  const driverDataRef = useRef(driverData);
  driverDataRef.current = driverData;

  function showToast(message, type = '') {
    setToast({ message, type, visible: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  }

  // Update stops when driverData changes (e.g. after route re-fetch)
  useEffect(() => {
    setStops(driverData.stops || []);
  }, [driverData]);

  const handleDeliver = useCallback(async (orderId) => {
    await deliverOrder(orderId);
    setStops((prev) =>
      prev.map((s) => (s.id === orderId ? { ...s, status: 'delivered' } : s))
    );
    showToast('Delivery confirmed \u2713', 'success');
  }, []);

  useSSE({
    onRouteAssigned: async (evt) => {
      const current = driverDataRef.current;
      if (evt.route?.driver_id !== current.driver?.id) return;
      try {
        const fresh = await driverLogin(current.driver.name);
        onStopsUpdate(fresh);
        setStops(fresh.stops || []);
        showToast('New route assigned!', 'success');
      } catch {
        showToast('New route assigned — refresh to see it');
      }
    },
    onRouteCompleted: (evt) => {
      const current = driverDataRef.current;
      if (current.route && evt.routeId === current.route.id) {
        showToast('Route complete — good work! \uD83C\uDF89', 'success');
      }
    },
  });

  const delivered = stops.filter((s) => s.status === 'delivered').length;
  const total = stops.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#0d0d0d' }}>
      <ProgressHeader
        name={driverData.driver.name}
        delivered={delivered}
        total={total}
        onSignOut={onSignOut}
      />
      <StopList stops={stops} onDeliver={handleDeliver} />
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}

export default function DriverView() {
  useInjectStyles(globalStyles);

  const [screen, setScreen] = useState('loading');
  const [driverData, setDriverData] = useState(null);

  // Auto-login on mount if name is saved
  useEffect(() => {
    const savedName = localStorage.getItem(STORAGE_KEY);
    if (!savedName) {
      setScreen('login');
      return;
    }
    driverLogin(savedName)
      .then((data) => {
        setDriverData(data);
        setScreen('app');
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setScreen('login');
      });
  }, []);

  async function handleLogin(name) {
    const data = await driverLogin(name);
    localStorage.setItem(STORAGE_KEY, name);
    setDriverData(data);
    setScreen('app');
  }

  function handleSignOut() {
    localStorage.removeItem(STORAGE_KEY);
    setDriverData(null);
    setScreen('login');
  }

  function handleStopsUpdate(freshData) {
    setDriverData(freshData);
  }

  if (screen === 'loading') {
    return (
      <div style={{ minHeight: '100dvh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6b6660', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (screen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <AppScreen
      driverData={driverData}
      onSignOut={handleSignOut}
      onStopsUpdate={handleStopsUpdate}
    />
  );
}
