import { useState } from 'react';
import { planRoutes, assignRoute } from '../api.js';
import { ORIGIN, ROUTE_COLORS } from '../constants.js';

export default function RoutePlanner({
  orders,
  setOrders,
  drivers,
  setDrivers,
  plannedRoutes,
  onPlanReady,
  onAssignComplete,
}) {
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const idleDrivers = drivers.filter((d) => d.status === 'idle');

  const canPlan = pendingOrders.length > 0 && idleDrivers.length > 0 && !loading;

  async function handlePlan() {
    setLoading(true);
    try {
      const data = await planRoutes({
        orderIds: pendingOrders.map((o) => o.id),
        driverCount: idleDrivers.length,
        origin: ORIGIN,
      });
      const routes = data.routes.map((r, i) => ({
        ...r,
        driverId: idleDrivers[i]?.id ?? null,
        colorIndex: i,
      }));
      onPlanReady(routes);
    } catch (err) {
      console.error('Plan failed:', err);
    } finally {
      setLoading(false);
    }
  }

  function reassignDriver(routeIndex, newDriverId) {
    const newId = Number(newDriverId);
    const oldDriverId = plannedRoutes[routeIndex].driverId;
    const updated = plannedRoutes.map((r, i) => {
      if (i === routeIndex) return { ...r, driverId: newId };
      if (r.driverId === newId) return { ...r, driverId: oldDriverId };
      return r;
    });
    onPlanReady(updated);
  }

  async function handleAssignAll() {
    setAssigning(true);
    try {
      for (const route of plannedRoutes) {
        if (!route.driverId) continue;
        await assignRoute({
          driver_id: route.driverId,
          orderIds: route.optimizedOrderIds,
          geometry: route.geometry,
        });
      }
      // SSE will update driver/order state; also update locally for responsiveness
      const assignedOrderIds = new Set(
        plannedRoutes.flatMap((r) => r.optimizedOrderIds),
      );
      const assignedDriverIds = new Set(
        plannedRoutes.map((r) => r.driverId).filter(Boolean),
      );
      setOrders((prev) =>
        prev.map((o) =>
          assignedOrderIds.has(o.id) ? { ...o, status: 'assigned' } : o,
        ),
      );
      setDrivers((prev) =>
        prev.map((d) =>
          assignedDriverIds.has(d.id) ? { ...d, status: 'delivering' } : d,
        ),
      );
      onAssignComplete();
    } catch (err) {
      console.error('Assign failed:', err);
    } finally {
      setAssigning(false);
    }
  }

  function getDriverName(driverId) {
    const d = drivers.find((dr) => dr.id === driverId);
    return d?.name || `Driver #${driverId}`;
  }

  function getOrder(orderId) {
    return orders.find((o) => o.id === orderId);
  }

  // --- Preview state ---
  if (plannedRoutes && plannedRoutes.length > 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-[10px] uppercase tracking-wider text-[#9ca3af]">
          Route Preview
        </div>

        {plannedRoutes.map((route, idx) => (
          <div
            key={idx}
            className="bg-[#262830] rounded-lg p-2.5"
            style={{ borderLeft: `3px solid ${ROUTE_COLORS[route.colorIndex]}` }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-semibold text-[#e2e4e9]">
                Route {idx + 1} ({route.optimizedOrderIds.length} stops)
              </span>
            </div>

            {/* Stop list */}
            <div className="flex flex-col gap-1 mb-2">
              {route.optimizedOrderIds.map((orderId, stopIdx) => {
                const order = getOrder(orderId);
                if (!order) return null;
                const addrFirst = order.address?.split(',')[0] || order.address || '';
                return (
                  <div key={orderId} className="flex items-center gap-1.5 text-[11px] text-[#c4c6cc]">
                    <span
                      className="flex-shrink-0 flex items-center justify-center rounded-full font-bold text-white text-[9px]"
                      style={{
                        width: 18,
                        height: 18,
                        background: ROUTE_COLORS[route.colorIndex],
                      }}
                    >
                      {stopIdx + 1}
                    </span>
                    <span className="truncate">
                      {order.customer_name} &mdash; {addrFirst}
                    </span>
                    {order.deliver_at && (
                      <span className="ml-auto flex-shrink-0 text-[9px] text-[#9ca3af]">
                        {order.deliver_at}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Driver dropdown */}
            <select
              className="w-full text-[11px] rounded-md px-2 py-1.5"
              style={{
                background: '#1a1c23',
                color: '#e2e4e9',
                border: '1px solid #2a2d36',
              }}
              value={route.driverId ?? ''}
              onChange={(e) => reassignDriver(idx, e.target.value)}
            >
              <option value="">Unassigned</option>
              {idleDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button
          onClick={handleAssignAll}
          disabled={assigning || plannedRoutes.some((r) => !r.driverId)}
          className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40"
          style={{ background: assigning ? '#92400e' : '#f59e0b' }}
          onMouseEnter={(e) => { if (!assigning) e.target.style.background = '#d97706'; }}
          onMouseLeave={(e) => { if (!assigning) e.target.style.background = '#f59e0b'; }}
        >
          {assigning ? 'Assigning...' : 'Assign All Planned Routes'}
        </button>
      </div>
    );
  }

  // --- Idle state ---
  return (
    <div className="flex flex-col gap-3">
      <div className="text-[10px] uppercase tracking-wider text-[#9ca3af]">
        Route Planning
      </div>
      <button
        onClick={handlePlan}
        disabled={!canPlan}
        className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40"
        style={{ background: loading ? '#1e40af' : '#3b82f6' }}
        onMouseEnter={(e) => { if (canPlan) e.target.style.background = '#2563eb'; }}
        onMouseLeave={(e) => { if (canPlan) e.target.style.background = '#3b82f6'; }}
      >
        {loading ? 'Planning...' : 'Plan Routes for Idle Drivers'}
      </button>
    </div>
  );
}
