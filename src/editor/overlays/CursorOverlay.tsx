import React, { useEffect, useState } from 'react';
import { useUIStore } from '@/editor/store/uiStore';
import { ToolManager } from '@/editor/core/ToolManager';

export function CursorOverlay() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const activeToolId = useUIStore((s) => s.activeTool);
  const activeTool = ToolManager.getActiveTool();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (activeToolId === 'select') return null;

  return (
    <div 
      className="cursor-overlay"
      style={{
        position: 'fixed',
        left: mousePos.x + 15,
        top: mousePos.y + 15,
        pointerEvents: 'none',
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
        {activeTool?.label.toUpperCase()}
      </div>
      <div style={{ opacity: 0.8 }}>
        {activeToolId === 'polyline' || activeToolId === 'polygon' 
            ? 'Click to add, Enter to finish' 
            : 'Click to start'}
      </div>
    </div>
  );
}
