/**
 * EditorLayout — the full UI shell.
 *
 * Responsible for composing:
 *   top bar, left toolbar, left sidebar, center canvas, bottom status bar
 *
 * This is the editor frame. No editor logic lives here.
 */

import { Topbar } from "@/editor/ui/Topbar";
import { Toolbar } from "@/editor/ui/Toolbar";
import { Sidebar } from "@/editor/ui/Sidebar";
import { Statusbar } from "@/editor/ui/Statusbar";
import { BabylonCanvas } from "@/editor/scene/BabylonCanvas";
import { useKeyboardShortcuts } from "@/editor/ui/useKeyboardShortcuts";
import { useUIStore } from "@/editor/store/uiStore";
import { CursorOverlay } from "@/editor/overlays/CursorOverlay";
import { DimensionsOverlay } from "@/editor/overlays/DimensionsOverlay";
import { ViewControls } from "@/editor/ui/ViewControls";

export function EditorLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  // Wire global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className={`editor-root ${sidebarOpen ? "" : "sidebar-closed"}`}>
      <Topbar />
      <Toolbar />
      <BabylonCanvas />

      {/* Floating Viewport Controls */}
      <ViewControls />

      {sidebarOpen && <Sidebar />}
      <Statusbar />

      {/* Overlays */}
      <CursorOverlay />
      <DimensionsOverlay />
    </div>
  );
}
