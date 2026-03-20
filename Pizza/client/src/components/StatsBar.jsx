export default function StatsBar({ orders = [], drivers = [] }) {
  const pending = orders.filter((o) => o.status === 'pending').length;
  const assigned = orders.filter((o) => o.status === 'assigned').length;
  const delivered = orders.filter((o) => o.status === 'delivered').length;

  const stats = [
    { label: 'Pending', value: pending },
    { label: 'Assigned', value: assigned },
    { label: 'Delivered', value: delivered },
    { label: 'Drivers', value: drivers.length },
  ];

  return (
    <div
      className="absolute top-3 right-3 z-[1000] flex gap-2"
      style={{ pointerEvents: 'none' }}
    >
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-lg px-2.5 py-1.5"
          style={{
            background: '#181a20ee',
            backdropFilter: 'blur(8px)',
            border: '1px solid #2a2d36',
          }}
        >
          <div className="text-[10px] text-[#9ca3af] uppercase tracking-wider">{label}</div>
          <div className="text-lg font-bold text-white leading-tight">{value}</div>
        </div>
      ))}
    </div>
  );
}
