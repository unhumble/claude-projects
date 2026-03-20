import { useState, useMemo } from 'react';
import useOrders from '../hooks/useOrders.js';
import useDrivers from '../hooks/useDrivers.js';
import MapView from '../components/MapView.jsx';
import DriverPanel from '../components/DriverPanel.jsx';
import OrderForm from '../components/OrderForm.jsx';
import OrderList from '../components/OrderList.jsx';
import StatsBar from '../components/StatsBar.jsx';
import RoutePlanner from '../components/RoutePlanner.jsx';
import DeliveryTracker from '../components/DeliveryTracker.jsx';
import { ROUTE_COLORS } from '../constants.js';

export default function ManagerDashboard() {
  const { orders, setOrders } = useOrders();
  const { drivers, setDrivers } = useDrivers();
  const [plannedRoutes, setPlannedRoutes] = useState(null);
  const [activeDeliveries, setActiveDeliveries] = useState([]);

  // Build map visualization data
  const { mapRoutes, routeMarkers } = useMemo(() => {
    const allRoutes = [];
    const allMarkers = [];

    // Preview (planned but not yet assigned) routes
    if (plannedRoutes) {
      for (const route of plannedRoutes) {
        allRoutes.push({
          geometry: route.geometry,
          color: ROUTE_COLORS[route.colorIndex],
          assigned: false,
        });
        route.optimizedOrderIds.forEach((orderId, idx) => {
          allMarkers.push({
            orderId,
            stopNumber: idx + 1,
            color: ROUTE_COLORS[route.colorIndex],
          });
        });
      }
    }

    // Active (assigned) delivery routes
    for (const ad of activeDeliveries) {
      if (ad.geometry) {
        allRoutes.push({
          geometry: ad.geometry,
          color: ROUTE_COLORS[ad.colorIndex],
          assigned: true,
        });
      }
      ad.orderIds.forEach((orderId, idx) => {
        // Don't add markers for orders already shown in preview
        if (!plannedRoutes) {
          allMarkers.push({
            orderId,
            stopNumber: idx + 1,
            color: ROUTE_COLORS[ad.colorIndex],
          });
        }
      });
    }

    return { mapRoutes: allRoutes, routeMarkers: allMarkers };
  }, [plannedRoutes, activeDeliveries]);

  function handlePlanReady(routes) {
    setPlannedRoutes(routes);
  }

  function handleAssignComplete() {
    // Move planned routes into active deliveries
    if (plannedRoutes) {
      const newDeliveries = plannedRoutes
        .filter((r) => r.driverId)
        .map((r) => ({
          driverId: r.driverId,
          orderIds: r.optimizedOrderIds,
          colorIndex: r.colorIndex,
          geometry: r.geometry,
        }));
      setActiveDeliveries((prev) => [...prev, ...newDeliveries]);
    }
    setPlannedRoutes(null);
  }

  // Clean up completed deliveries (all orders delivered)
  const cleanActiveDeliveries = useMemo(() => {
    return activeDeliveries.filter((ad) => {
      const routeOrders = ad.orderIds
        .map((id) => orders.find((o) => o.id === id))
        .filter(Boolean);
      const allDone = routeOrders.length > 0 && routeOrders.every((o) => o.status === 'delivered');
      // Keep for a moment so "All delivered!" shows, driver SSE will set idle
      const driverStillDelivering = drivers.some(
        (d) => d.id === ad.driverId && d.status === 'delivering',
      );
      return !allDone || driverStillDelivering;
    });
  }, [activeDeliveries, orders, drivers]);

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

          {/* Divider */}
          <div style={{ borderTop: '1px solid #2a2d36' }} />

          <OrderForm orders={orders} setOrders={setOrders} />

          <div className="flex flex-col gap-3">
            <div className="text-[10px] uppercase tracking-wider text-[#9ca3af]">
              Orders
            </div>
            <OrderList orders={orders} />
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #2a2d36' }} />

          <RoutePlanner
            orders={orders}
            setOrders={setOrders}
            drivers={drivers}
            setDrivers={setDrivers}
            plannedRoutes={plannedRoutes}
            onPlanReady={handlePlanReady}
            onAssignComplete={handleAssignComplete}
          />

          <DeliveryTracker
            orders={orders}
            setOrders={setOrders}
            drivers={drivers}
            activeDeliveries={cleanActiveDeliveries}
          />
        </div>
      </aside>

      {/* Map area */}
      <main className="flex-1 relative">
        <MapView
          orders={orders}
          routes={mapRoutes}
          routeMarkers={routeMarkers}
        />
        <StatsBar orders={orders} drivers={drivers} />
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
