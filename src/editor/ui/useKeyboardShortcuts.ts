/**
 * useKeyboardShortcuts — global keyboard shortcut handler.
 *
 * Listens globally and dispatches to stores / tool manager / history manager.
 * Keyboard logic is centralized here — NOT scattered across components.
 */

import { useEffect } from 'react';
import { useUIStore } from '@/editor/store/uiStore';
import { useSelectionStore } from '@/editor/store/selectionStore';
import { ToolManager } from '@/editor/core/ToolManager';
import {
  undo,
  redo,
  executeCommand,
  createRemoveEntityCommand,
} from '@/editor/core/CommandManager';
import type { ToolId } from '@/editor/tools/types';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key.toLowerCase();

      // ── Editor Controls ─────────────────────────
      if (ctrl && key === 'z' && !shift) {
        e.preventDefault();
        undo();
        return;
      }

      if ((ctrl && key === 'z' && shift) || (ctrl && key === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      if (key === 'delete' || key === 'backspace') {
        e.preventDefault();
        const { selectedIds } = useSelectionStore.getState();
        for (const id of selectedIds) {
          executeCommand(createRemoveEntityCommand(id));
        }
        useSelectionStore.getState().clearSelection();
        return;
      }

      if (key === 'escape') {
        // First give the tool a chance to handle Escape (e.g. cancel drawing)
        ToolManager.onKeyDown(e);
        if (e.defaultPrevented) return;

        e.preventDefault();
        useSelectionStore.getState().clearSelection();
        // Default behavior: reset to select tool
        switchTool('select');
        return;
      }

      // ── Tool Shortcuts ──────────────────────────
      if (!ctrl && !shift) {
        const toolMap: Record<string, ToolId> = {
          v: 'select',
          g: 'move',
          r: 'rotate',
          l: 'line',
          p: 'polyline',
          e: 'ellipse',
          a: 'arc',
        };
        if (toolMap[key]) {
          e.preventDefault();
          switchTool(toolMap[key]);
          return;
        }
      }

      // Shift+R for rectangle, Shift+P for polygon
      if (shift && !ctrl) {
        if (key === 'r') {
          e.preventDefault();
          switchTool('rectangle');
          return;
        }
        if (key === 'p') {
          e.preventDefault();
          switchTool('polygon');
          return;
        }
      }

      // ── Camera Presets ──────────────────────────
      if (key === '1' && !ctrl) {
        e.preventDefault();
        useUIStore.getState().setViewMode('2d');
        return;
      }

      if (key === '3' && !ctrl) {
        e.preventDefault();
        useUIStore.getState().setViewMode('3d');
        return;
      }

      // Forward to active tool
      ToolManager.onKeyDown(e);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      ToolManager.onKeyUp(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
}

function switchTool(toolId: ToolId) {
  useUIStore.getState().setTool(toolId);
  ToolManager.setActiveTool(toolId);
}
