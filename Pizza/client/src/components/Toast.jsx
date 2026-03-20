import { useEffect, useRef } from 'react';

const baseStyle = {
  position: 'fixed',
  bottom: '1.5rem',
  left: '50%',
  transform: 'translateX(-50%) translateY(80px)',
  background: '#1f1f1f',
  border: '1px solid #2a2a2a',
  borderRadius: '8px',
  padding: '0.65rem 1.25rem',
  fontSize: '0.875rem',
  color: '#9b9690',
  zIndex: 100,
  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
};

const visibleStyle = {
  transform: 'translateX(-50%) translateY(0)',
};

const successStyle = {
  color: '#4caf79',
  borderColor: 'rgba(76,175,121,0.3)',
};

export default function Toast({ message, type, visible }) {
  return (
    <div
      style={{
        ...baseStyle,
        ...(visible ? visibleStyle : {}),
        ...(type === 'success' ? successStyle : {}),
      }}
    >
      {message}
    </div>
  );
}
