const STATUS_DOT = {
  pending: '#ef4444',
  assigned: '#22c55e',
  delivered: '#6b7280',
};

const STATUS_BADGE = {
  pending: { bg: '#ef444433', color: '#ef4444' },
  assigned: { bg: '#22c55e33', color: '#22c55e' },
  delivered: { bg: '#6b728033', color: '#9ca3af' },
};

function formatTime(isoString) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function OrderCard({ order }) {
  const dotColor = STATUS_DOT[order.status] || '#6b7280';
  const badge = STATUS_BADGE[order.status] || STATUS_BADGE.delivered;
  const addressFirst = order.address?.split(',')[0] || '';
  const createdAt = formatTime(order.created_at);

  return (
    <div
      className="flex items-center gap-2 rounded-lg p-2"
      style={{ background: '#262830' }}
    >
      {/* Status dot */}
      <div
        className="flex-shrink-0"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: dotColor,
        }}
      />

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white truncate">
            {order.customer_name}
          </span>
          {createdAt && (
            <span className="text-[10px] text-[#6b7280] flex-shrink-0">
              {createdAt}
            </span>
          )}
        </div>
        <div className="text-xs text-[#9ca3af] truncate">{addressFirst}</div>
      </div>

      {/* Deliver-at badge */}
      {order.deliver_at && (
        <span
          className="flex-shrink-0 text-[10px] rounded px-1.5 py-0.5"
          style={{ background: '#f59e0b33', color: '#f59e0b' }}
        >
          {'\u23F0'} {order.deliver_at}
        </span>
      )}

      {/* Status badge */}
      <span
        className="flex-shrink-0 text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5 font-semibold"
        style={{ background: badge.bg, color: badge.color }}
      >
        {order.status}
      </span>
    </div>
  );
}

export default function OrderList({ orders = [] }) {
  if (orders.length === 0) {
    return (
      <div className="text-xs text-[#6b7280] text-center py-4">
        No orders yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
