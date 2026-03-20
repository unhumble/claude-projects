import { useState } from 'react';

const styles = {
  screen: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#0d0d0d',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '-30%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(255,106,0,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  logo: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 900,
    fontSize: '3.5rem',
    letterSpacing: '-0.02em',
    color: '#ff6a00',
    lineHeight: 1,
    marginBottom: '0.25rem',
    position: 'relative',
  },
  sub: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 400,
    fontSize: '0.85rem',
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    color: '#6b6660',
    marginBottom: '3.5rem',
    position: 'relative',
  },
  form: {
    width: '100%',
    maxWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'relative',
  },
  label: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '0.75rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#6b6660',
    marginBottom: '0.4rem',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '1rem 1.25rem',
    background: '#161616',
    border: '1.5px solid #2a2a2a',
    borderRadius: '10px',
    color: '#f0ece4',
    fontFamily: "'Barlow', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 500,
    outline: 'none',
    WebkitAppearance: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '1rem',
    background: '#ff6a00',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'opacity 0.15s, transform 0.1s',
  },
  error: {
    color: '#e05c5c',
    fontSize: '0.85rem',
    textAlign: 'center',
    minHeight: '1.2rem',
  },
};

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      await onLogin(trimmed);
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  }

  return (
    <div style={styles.screen}>
      <div style={styles.glow} />
      <div style={styles.logo}>🍕 PIZZERIA</div>
      <div style={styles.sub}>Driver App · Singen</div>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div>
          <label style={styles.label} htmlFor="driver-name-input">Your name</label>
          <input
            id="driver-name-input"
            style={{
              ...styles.input,
              borderColor: focused ? '#ff6a00' : '#2a2a2a',
              boxShadow: focused ? '0 0 0 3px rgba(255,106,0,0.12)' : 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            type="text"
            placeholder="e.g. Marco"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: loading ? 0.5 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          disabled={loading}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {loading ? 'Signing in...' : 'Start Shift'}
        </button>
        <div style={styles.error}>{error}</div>
      </form>
    </div>
  );
}
