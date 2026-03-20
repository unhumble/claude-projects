import useOrders from '../hooks/useOrders.js';
import useDrivers from '../hooks/useDrivers.js';
import MapView from '../components/MapView.jsx';
import DriverPanel from '../components/DriverPanel.jsx';

export default function ManagerDashboard() {
  const { orders, setOrders } = useOrders();
  const { drivers, setDrivers } = useDrivers();

  return (
    <div
      className="manager-layout flex w-full"
      style={{ height: '100dvh', minHeight: '100vh' }}
    >
      {/* Sidebar */}
      <aside
        className="flex flex-col overflow-y-auto flex-shrink-0"
        style={{
          width: '420px',
          background: 'var(--color-bg-surface)',
          borderRight: '1px solid #2a2d36',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid #2a2d36' }}
        >
          <span className="text-2xl leading-none">🍕</span>
          <h1
            className="font-semibold text-base text-[#e2e4e9] tracking-tight"
            style={{ fontFamily: 'var(--font-family-condensed)' }}
          >
            Pizza Delivery &mdash; Singen
          </h1>
        </div>

        {/* Sidebar content */}
        <div className="flex flex-col gap-6 p-4">
          <DriverPanel drivers={drivers} setDrivers={setDrivers} />
        </div>
      </aside>

      {/* Map area */}
      <main className="flex-1 relative">
        <MapView orders={orders} drivers={drivers} />
      </main>

      {/* Responsive: stack vertically on narrow screens */}
      <style>{`
        @media (max-width: 767px) {
          .manager-layout {
            flex-direction: column !important;
          }
          .manager-layout aside {
            width: 100% !important;
            height: auto !important;
            max-height: 50vh;
            border-right: none !important;
            border-bottom: 1px solid #2a2d36;
          }
          .manager-layout main {
            height: 50vh;
          }
        }
      `}</style>
    </div>
  );
}
