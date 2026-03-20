import { useState } from 'react';
import { createDriver, deleteDriver } from '../api.js';
import { ROUTE_COLORS } from '../constants.js';

export default function DriverPanel({ drivers, setDrivers }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const driver = await createDriver({ name: trimmed });
      setDrivers((prev) => {
        if (prev.some((d) => d.id === driver.id)) return prev;
        return [...prev, driver];
      });
      setName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd();
  }

  async function handleDelete(driver) {
    if (driver.status === 'delivering') return;
    try {
      await deleteDriver(driver.id);
      setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <p className="uppercase text-[10px] tracking-wider text-[#9ca3af] font-semibold">
        Drivers
      </p>

      {/* Add driver row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Driver name"
          className="flex-1 rounded px-2.5 py-1.5 text-sm text-[#e2e4e9] placeholder-[#6b7280]"
          style={{
            background: '#111318',
            border: '1px solid #2a2d36',
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#f59e0b')}
          onBlur={(e) => (e.target.style.borderColor = '#2a2d36')}
          disabled={loading}
        />
        <button
          onClick={handleAdd}
          disabled={loading || !name.trim()}
          className="px-3 py-1.5 rounded text-sm font-semibold text-black disabled:opacity-40 transition-colors"
          style={{ background: loading || !name.trim() ? '#f59e0b99' : '#f59e0b' }}
          onMouseEnter={(e) => { if (!loading && name.trim()) e.target.style.background = '#fbbf24'; }}
          onMouseLeave={(e) => { if (!loading && name.trim()) e.target.style.background = '#f59e0b'; }}
        >
          Add
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-[#ef4444] text-xs">{error}</p>
      )}

      {/* Driver cards */}
      <div className="flex flex-col gap-2">
        {drivers.length === 0 && (
          <p className="text-[#6b7280] text-sm text-center py-4">No drivers yet</p>
        )}
        {drivers.map((driver, index) => {
          const color = ROUTE_COLORS[index % ROUTE_COLORS.length];
          const isDelivering = driver.status === 'delivering';
          const tokenSnippet = driver.token ? driver.token.slice(0, 8) : '--------';

          return (
            <div
              key={driver.id}
              className="flex items-center gap-2.5 rounded-lg p-2"
              style={{ background: '#262830' }}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                style={{ background: color + '33', border: `2px solid ${color}` }}
              >
                👨‍🍳
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#e2e4e9] truncate">{driver.name}</p>
                <p className="text-[11px] text-[#6b7280] font-mono">{tokenSnippet}…</p>
              </div>

              {/* Status badge */}
              <span
                className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                style={
                  isDelivering
                    ? { background: '#f59e0b33', color: '#f59e0b' }
                    : { background: '#6b728033', color: '#9ca3af' }
                }
              >
                {driver.status || 'idle'}
              </span>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(driver)}
                disabled={isDelivering}
                title={isDelivering ? 'Cannot delete while delivering' : 'Remove driver'}
                className="w-6 h-6 rounded flex items-center justify-center text-white text-xs flex-shrink-0 disabled:opacity-30 transition-colors"
                style={{ background: '#ef4444' }}
                onMouseEnter={(e) => { if (!isDelivering) e.target.style.background = '#dc2626'; }}
                onMouseLeave={(e) => { if (!isDelivering) e.target.style.background = '#ef4444'; }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
