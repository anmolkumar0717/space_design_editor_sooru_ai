/**
 * UI Store — controls editor UI state (active tool, view mode, toggles).
 * Used by every UI component to stay in sync.
 */

import { create } from 'zustand';
import type { ToolId } from '@/editor/tools/types';

export type ViewMode = '2d' | '3d';

interface UIState {
  activeTool: ToolId;
  viewMode: ViewMode;
  snapEnabled: boolean;
  gridVisible: boolean;
  sidebarOpen: boolean;

  tempDimensions: string | null;
  setTool: (tool: ToolId) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleSnap: () => void;
  toggleGrid: () => void;
  toggleSidebar: () => void;
  setTempDimensions: (dim: string | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activeTool: 'select',
  viewMode: '3d',
  snapEnabled: true,
  gridVisible: true,
  sidebarOpen: true,
  tempDimensions: null,

  setTool: (tool) => set({ activeTool: tool, tempDimensions: null }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTempDimensions: (dim) => set({ tempDimensions: dim }),
}));
