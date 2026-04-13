/**
 * Sidebar — scene object list + selected object properties panel.
 */

import {
  Box,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { useSceneStore } from '@/editor/store/sceneStore';
import { useSelectionStore } from '@/editor/store/selectionStore';
import {
  executeCommand,
  createRemoveEntityCommand,
  createUpdateEntityCommand,
} from '@/editor/core/CommandManager';
import type { EditorEntity } from '@/editor/types/entities';

export function Sidebar() {
  const entities = useSceneStore((s) => s.entities);
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const select = useSelectionStore((s) => s.select);
  const entityList = Object.values(entities);

  // Get the first selected entity for the properties panel
  const selectedEntity = selectedIds.length === 1 ? entities[selectedIds[0]] : null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span>Scene</span>
        <span style={{ fontSize: 10, fontWeight: 400 }}>
          {entityList.length} objects
        </span>
      </div>

      <div className="sidebar-content">
        {/* Object List */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Objects</div>
          {entityList.length === 0 ? (
            <div className="empty-state">
              <Box size={24} className="empty-state-icon" />
              <span className="empty-state-text">No objects in scene</span>
            </div>
          ) : (
            entityList.map((entity) => (
              <ObjectListItem
                key={entity.id}
                entity={entity}
                isSelected={selectedIds.includes(entity.id)}
                onSelect={() => select(entity.id)}
              />
            ))
          )}
        </div>

        {/* Properties Panel */}
        {selectedEntity && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">Properties</div>
            <PropertiesPanel entity={selectedEntity} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Object List Item ────────────────────────────────

function ObjectListItem({
  entity,
  isSelected,
  onSelect,
}: {
  entity: EditorEntity;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    executeCommand(createRemoveEntityCommand(entity.id));
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    executeCommand(
      createUpdateEntityCommand(entity.id, { visible: !entity.visible })
    );
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    executeCommand(
      createUpdateEntityCommand(entity.id, { locked: !entity.locked })
    );
  };

  return (
    <div
      className={`object-list-item ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <ChevronRight size={12} className="object-icon" />
      <span className="object-name">{entity.name}</span>
      <span className="object-type">{entity.type}</span>
      <button
        className="icon-btn"
        onClick={handleToggleVisibility}
        style={{ width: 22, height: 22 }}
        title={entity.visible ? 'Hide' : 'Show'}
      >
        {entity.visible ? <Eye size={12} /> : <EyeOff size={12} />}
      </button>
      <button
        className="icon-btn"
        onClick={handleToggleLock}
        style={{ width: 22, height: 22 }}
        title={entity.locked ? 'Unlock' : 'Lock'}
      >
        {entity.locked ? <Lock size={12} /> : <Unlock size={12} />}
      </button>
      <button
        className="icon-btn"
        onClick={handleDelete}
        style={{ width: 22, height: 22 }}
        title="Delete"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ── Properties Panel ────────────────────────────────

function PropertiesPanel({ entity }: { entity: EditorEntity }) {
  const handleTransformChange = (
    axis: 0 | 1 | 2,
    field: 'position' | 'rotation' | 'scale',
    value: string
  ) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;

    const current = [...entity[field]] as [number, number, number];
    current[axis] = num;
    executeCommand(createUpdateEntityCommand(entity.id, { [field]: current }));
  };

  const labels = ['X', 'Y', 'Z'];

  return (
    <div>
      <div className="property-row">
        <span className="property-label">Name</span>
        <span className="property-value">
          <input
            className="property-input"
            value={entity.name}
            readOnly
          />
        </span>
      </div>

      <div className="property-row">
        <span className="property-label">Type</span>
        <span className="property-value">
          <input
            className="property-input"
            value={entity.type}
            readOnly
          />
        </span>
      </div>

      {/* Transform fields */}
      {(['position', 'rotation', 'scale'] as const).map((field) => (
        <div key={field} className="property-row">
          <span className="property-label" style={{ textTransform: 'capitalize' }}>
            {field}
          </span>
          <span className="property-value">
            {entity[field].map((val, i) => (
              <input
                key={i}
                className="property-input property-input-small"
                type="number"
                step={field === 'rotation' ? 0.1 : field === 'scale' ? 0.1 : 0.5}
                value={val.toFixed(2)}
                onChange={(e) =>
                  handleTransformChange(i as 0 | 1 | 2, field, e.target.value)
                }
                title={`${labels[i]}`}
              />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}
