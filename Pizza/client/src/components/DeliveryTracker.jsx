import { deliverOrder } from '../api.js';
import { ROUTE_COLORS } from '../constants.js';

export default function DeliveryTracker({
  orders,
  setOrders,
  drivers,
  activeDeliveries,
}) {
  const deliveringDrivers = drivers.filter((d) => d.status === 'delivering');

  if (deliveringDrivers.length === 0 && (!activeDeliveries || activeDeliveries.length === 0)) {
    return null;
  }

  // Build delivery cards from activeDeliveries state
  const deliveries = (activeDeliveries || []).map((ad) => {
    const driver = drivers.find((d) => d.id === ad.driverId);
    const routeOrders = ad.orderIds
      .map((id) => orders.find((o) => o.id === id))
      .filter(Boolean);
    const deliveredCount = routeOrders.filter((o) => o.status === 'delivered').length;
    const nextUndelivered = routeOrders.find((o) => o.status !== 'delivered');
    return {
      ...ad,
      driver,
      routeOrders,
      deliveredCount,
      totalCount: routeOrders.length,
      nextUndelivered,
      allDone: deliveredCount === routeOrders.length && routeOrders.length > 0,
    };
  });

  async function handleDeliver(orderId) {
    try {
      await deliverOrder(orderId);
      // Update locally for responsiveness; SSE will also update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'delivered' } : o)),
      );
    } catch (err) {
      console.error('Deliver failed:', err);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-[10px] uppercase tracking-wider text-[#9ca3af]">
        Active Deliveries
      </div>

      {deliveries.map((del) => (
        <div
          key={del.driverId}
          className="bg-[#262830] rounded-lg p-2.5"
          style={{ borderLeft: `3px solid ${ROUTE_COLORS[del.colorIndex]}` }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-semibold text-[#e2e4e9]">
              {del.driver?.name || `Driver #${del.driverId}`}
            </span>
            <span className="text-[11px] text-[#9ca3af]">
              {del.deliveredCount}/{del.totalCount} delivered
            </span>
          </div>

          {/* Stop list with status */}
          <div className="flex flex-col gap-1 mb-2">
            {del.routeOrders.map((order, idx) => {
              const addrFirst = order.address?.split(',')[0] || order.address || '';
              const isDone = order.status === 'delivered';
              return (
                <div
                  key={order.id}
                  className="flex items-center gap-1.5 text-[11px]"
                  style={{ color: isDone ? '#6b7280' : '#c4c6cc' }}
                >
                  <span
                    className="flex-shrink-0 flex items-center justify-center rounded-full font-bold text-white text-[9px]"
                    style={{
                      width: 18,
                      height: 18,
                      background: isDone ? '#6b7280' : ROUTE_COLORS[del.colorIndex],
                    }}
                  >
                    {isDone ? '\u2713' : idx + 1}
                  </span>
                  <span className="truncate" style={{ textDecoration: isDone ? 'line-through' : 'none' }}>
                    {order.customer_name} &mdash; {addrFirst}
                  </span>
                </div>
              );
            })}
          </div>

          {del.allDone ? (
            <div className="text-[11px] font-semibold text-[#22c55e] text-center py-1">
              All delivered!
            </div>
          ) : del.nextUndelivered ? (
            <button
              onClick={() => handleDeliver(del.nextUndelivered.id)}
              className="w-full py-1.5 rounded-md text-[11px] font-semibold text-white transition-colors"
              style={{ background: '#22c55e' }}
              onMouseEnter={(e) => { e.target.style.background = '#16a34a'; }}
              onMouseLeave={(e) => { e.target.style.background = '#22c55e'; }}
            >
              Mark &quot;{del.nextUndelivered.customer_name}&quot; Delivered
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
