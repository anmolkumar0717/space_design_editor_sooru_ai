/**
 * Statusbar — displays active tool, view mode, snap state, object count.
 */

import { useUIStore } from '@/editor/store/uiStore';
import { useSelectionStore } from '@/editor/store/selectionStore';
import { useSceneStore } from '@/editor/store/sceneStore';

export function Statusbar() {
  const activeTool = useUIStore((s) => s.activeTool);
  const viewMode = useUIStore((s) => s.viewMode);
  const snapEnabled = useUIStore((s) => s.snapEnabled);
  const tempDimensions = useUIStore((s) => s.tempDimensions);
  const selectedCount = useSelectionStore((s) => s.selectedIds.length);
  const entityCount = useSceneStore(
    (s) => Object.keys(s.entities).length
  );

  return (
    <div className="statusbar">
      <div className="statusbar-section">
        <div className="status-item">
          <span className="status-dot" />
          <span>Ready</span>
        </div>
        <div className="status-item">
          <span>Tool:</span>
          <span style={{ color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
            {activeTool}
          </span>
        </div>
      </div>

      <div className="statusbar-section">
        {tempDimensions && (
          <div className="dimension-badge">
            {tempDimensions}
          </div>
        )}
      </div>

      <div className="statusbar-section">
        <div className="status-item">
          <span>Snap:</span>
          <span style={{ color: snapEnabled ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
            {snapEnabled ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="status-item">
          <span>Selected:</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>{selectedCount}</span>
        </div>
        <div className="status-item">
          <span>Objects:</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>{entityCount}</span>
        </div>
      </div>
    </div>
  );
}
