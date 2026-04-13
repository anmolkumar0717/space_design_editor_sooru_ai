import React from 'react';
import { useUIStore } from '@/editor/store/uiStore';

export function DimensionsOverlay() {
  const tempDimensions = useUIStore((s) => s.tempDimensions);

  if (!tempDimensions) return null;

  return (
    <div 
      className="dimensions-overlay"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '80px',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '24px',
        fontSize: '14px',
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        pointerEvents: 'none'
      }}
    >
      {tempDimensions}
    </div>
  );
}
