/**
 * Topbar — contains logo, file menu placeholder, undo/redo, 2D/3D switch,
 * snap toggle, grid toggle.
 */

import {
  Undo2,
  Redo2,
  Grid3x3,
  Magnet,
  Save,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useUIStore } from "@/editor/store/uiStore";
import { useHistoryStore } from "@/editor/store/historyStore";
import { undo, redo } from "@/editor/core/CommandManager";
import { ViewToggle } from "./ViewToggle";

export function Topbar() {
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const snapEnabled = useUIStore((s) => s.snapEnabled);
  const toggleSnap = useUIStore((s) => s.toggleSnap);
  const gridVisible = useUIStore((s) => s.gridVisible);
  const toggleGrid = useUIStore((s) => s.toggleGrid);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const canUndo = useHistoryStore((s) => s.canUndo);
  const canRedo = useHistoryStore((s) => s.canRedo);

  return (
    <div className="topbar">
      {/* Left section: Logo + File actions */}
      <div className="topbar-section">
        <span className="topbar-logo">Space Editor</span>
        <div className="topbar-divider" />

        <button className="icon-btn" title="Open Scene (Ctrl+O)">
          <FolderOpen size={16} />
        </button>
        <button className="icon-btn" title="Save Scene (Ctrl+S)">
          <Save size={16} />
        </button>

        <div className="topbar-divider" />

        <button
          className="icon-btn"
          disabled={!canUndo}
          onClick={undo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          className="icon-btn"
          disabled={!canRedo}
          onClick={redo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>
      </div>

      {/* Center section: Spacer */}
      <div className="topbar-section" style={{ flex: 1 }} />

      {/* Right section: Toggles */}
      <div className="topbar-section">
        <button
          className={`icon-btn ${snapEnabled ? "active" : ""}`}
          onClick={toggleSnap}
          title="Toggle Snap"
        >
          <Magnet size={16} />
        </button>
        <button
          className={`icon-btn ${gridVisible ? "active" : ""}`}
          onClick={toggleGrid}
          title="Toggle Grid"
        >
          <Grid3x3 size={16} />
        </button>

        <div className="topbar-divider" />

        <button
          className="icon-btn"
          onClick={toggleSidebar}
          title="Toggle Sidebar"
        >
          {sidebarOpen ? (
            <PanelLeftClose size={16} />
          ) : (
            <PanelLeftOpen size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
