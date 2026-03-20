import StopCard from './StopCard.jsx';

const styles = {
  list: {
    flex: 1,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    paddingBottom: '2rem',
  },
  noRoute: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2rem',
    textAlign: 'center',
    gap: '1rem',
  },
  noRouteIcon: {
    fontSize: '3rem',
    opacity: 0.3,
  },
  noRouteTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#9b9690',
    letterSpacing: '0.05em',
  },
  noRouteSub: {
    fontSize: '0.9rem',
    color: '#6b6660',
    lineHeight: 1.5,
  },
  allDone: {
    margin: '1rem',
    padding: '1.5rem',
    background: 'rgba(76,175,121,0.12)',
    border: '1.5px solid rgba(76,175,121,0.3)',
    borderRadius: '12px',
    textAlign: 'center',
  },
  allDoneTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#4caf79',
    marginBottom: '0.3rem',
  },
  allDoneSub: {
    fontSize: '0.875rem',
    color: '#6b6660',
  },
};

export default function StopList({ stops, onDeliver }) {
  if (!stops || stops.length === 0) {
    return (
      <div style={styles.noRoute}>
        <div style={styles.noRouteIcon}>🛵</div>
        <div style={styles.noRouteTitle}>No active route</div>
        <div style={styles.noRouteSub}>
          The manager will assign your deliveries shortly. Hang tight.
        </div>
      </div>
    );
  }

  const allDone = stops.every((s) => s.status === 'delivered');
  const nextIdx = stops.findIndex((s) => s.status !== 'delivered');

  return (
    <>
      {allDone && (
        <div style={styles.allDone}>
          <div style={styles.allDoneTitle}>All delivered ✓</div>
          <div style={styles.allDoneSub}>Route complete. Head back to the pizzeria.</div>
        </div>
      )}
      <div style={styles.list}>
        {stops.map((stop, i) => (
          <StopCard
            key={stop.id}
            stop={stop}
            index={i}
            isNext={i === nextIdx}
            isDone={stop.status === 'delivered'}
            onDeliver={onDeliver}
          />
        ))}
      </div>
    </>
  );
}
