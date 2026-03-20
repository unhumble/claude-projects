const styles = {
  header: {
    background: '#161616',
    borderBottom: '1px solid #2a2a2a',
    padding: '1rem 1.25rem 0.75rem',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  driverName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: '1.4rem',
    letterSpacing: '0.02em',
    color: '#f0ece4',
  },
  nameHighlight: {
    color: '#ff6a00',
  },
  signOutBtn: {
    background: 'none',
    border: '1px solid #2a2a2a',
    color: '#6b6660',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '0.75rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  progressBar: {
    flex: 1,
    height: '4px',
    background: '#2a2a2a',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#ff6a00',
    borderRadius: '2px',
    transition: 'width 0.4s ease',
  },
  progressLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '0.8rem',
    color: '#6b6660',
    whiteSpace: 'nowrap',
  },
};

export default function ProgressHeader({ name, delivered, total, onSignOut }) {
  const pct = total ? Math.round((delivered / total) * 100) : 0;

  return (
    <header style={styles.header}>
      <div style={styles.headerTop}>
        <div style={styles.driverName}>
          Hey, <span style={styles.nameHighlight}>{name}</span>
        </div>
        <button style={styles.signOutBtn} onClick={onSignOut}>
          Sign out
        </button>
      </div>
      <div style={styles.progressRow}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${pct}%` }} />
        </div>
        <div style={styles.progressLabel}>
          {delivered} / {total}
        </div>
      </div>
    </header>
  );
}
