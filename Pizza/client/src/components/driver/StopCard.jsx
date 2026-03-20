import { useState } from 'react';

const cardBase = {
  background: '#161616',
  border: '1.5px solid #2a2a2a',
  borderRadius: '12px',
  padding: '1rem 1.1rem',
  position: 'relative',
  overflow: 'hidden',
  animation: 'fadeUp 0.3s ease both',
};

const cardNext = {
  borderColor: '#ff6a00',
  boxShadow: '0 0 0 1px rgba(255,106,0,0.35), inset 0 0 30px rgba(255,106,0,0.12)',
  animation: 'pulseBorder 2.5s ease-in-out infinite',
};

const cardDone = {
  opacity: 0.4,
};

const styles = {
  stopNum: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    color: '#6b6660',
  },
  stopNumNext: {
    color: '#ff6a00',
    fontWeight: 700,
  },
  tag: {
    display: 'inline-block',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    marginBottom: '0.5rem',
  },
  tagNext: {
    background: 'rgba(255,106,0,0.12)',
    color: '#ff6a00',
  },
  tagPending: {
    background: '#1f1f1f',
    color: '#6b6660',
  },
  tagDone: {
    background: 'rgba(76,175,121,0.12)',
    color: '#4caf79',
  },
  customerName: {
    fontWeight: 600,
    fontSize: '1rem',
    marginBottom: '0.2rem',
    color: '#f0ece4',
  },
  customerNameDone: {
    textDecoration: 'line-through',
  },
  address: {
    fontSize: '0.875rem',
    color: '#9b9690',
    lineHeight: 1.4,
    marginBottom: '0.9rem',
  },
  addressDone: {
    textDecoration: 'line-through',
  },
  actions: {
    display: 'flex',
    gap: '0.6rem',
  },
  btnNav: {
    flex: 1,
    padding: '0.65rem',
    background: '#1f1f1f',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    color: '#9b9690',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    transition: 'background 0.15s, color 0.15s',
  },
  btnDeliver: {
    flex: 2,
    padding: '0.65rem 1rem',
    background: '#ff6a00',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'opacity 0.15s, transform 0.1s',
  },
  deliveredBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: '#4caf79',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
};

export default function StopCard({ stop, index, isNext, isDone, onDeliver }) {
  const [delivering, setDelivering] = useState(false);

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.address)}`;
  const wazeUrl = `https://waze.com/ul?ll=${stop.lat},${stop.lng}&navigate=yes`;

  async function handleDeliver() {
    if (delivering) return;
    setDelivering(true);
    try {
      await onDeliver(stop.id);
    } catch {
      setDelivering(false);
    }
  }

  const cardStyle = {
    ...cardBase,
    ...(isNext ? cardNext : {}),
    ...(isDone ? cardDone : {}),
    animationDelay: `${index * 0.05}s`,
  };

  const tag = isDone ? 'Delivered' : isNext ? 'Next stop' : 'Upcoming';
  const tagStyle = isDone ? styles.tagDone : isNext ? styles.tagNext : styles.tagPending;

  return (
    <div style={cardStyle}>
      <div style={{ ...styles.stopNum, ...(isNext ? styles.stopNumNext : {}) }}>
        #{index + 1}
      </div>

      <div style={{ ...styles.tag, ...tagStyle }}>
        {isDone ? '\u2713 Delivered' : tag}
      </div>

      <div style={{ ...styles.customerName, ...(isDone ? styles.customerNameDone : {}) }}>
        {stop.customer_name}
      </div>
      <div style={{ ...styles.address, ...(isDone ? styles.addressDone : {}) }}>
        {stop.address}
      </div>

      {isDone ? (
        <div style={styles.deliveredBadge}>
          <span>&#10003;</span> Done
        </div>
      ) : (
        <div style={styles.actions}>
          <a
            style={styles.btnNav}
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            🗺 Maps
          </a>
          <a
            style={styles.btnNav}
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            🔵 Waze
          </a>
          <button
            style={{
              ...styles.btnDeliver,
              opacity: delivering ? 0.5 : 1,
              cursor: delivering ? 'not-allowed' : 'pointer',
            }}
            onClick={handleDeliver}
            disabled={delivering}
            onMouseDown={(e) => { if (!delivering) e.currentTarget.style.transform = 'scale(0.96)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {delivering ? '...' : 'Mark Delivered'}
          </button>
        </div>
      )}
    </div>
  );
}
