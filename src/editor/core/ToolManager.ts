/**
 * Tool Manager — holds all tool instances, switches active tool,
 * and forwards input events to the currently active tool.
 *
 * Flow:
 *   Toolbar click → uiStore.activeTool changes → ToolManager activates tool
 *   → Babylon pointer events go to active tool
 */

import type { PointerInfo } from '@babylonjs/core';
import type { EditorTool, ToolId } from '@/editor/tools/types';

class ToolManagerClass {
  private tools = new Map<ToolId, EditorTool>();
  private activeToolId: ToolId | null = null;

  /** Register a tool instance */
  registerTool(tool: EditorTool): void {
    this.tools.set(tool.id as ToolId, tool);
  }

  /** Get a tool by ID */
  getTool(id: ToolId): EditorTool | undefined {
    return this.tools.get(id);
  }

  /** Get all registered tools */
  getAllTools(): EditorTool[] {
    return Array.from(this.tools.values());
  }

  /** Switch to a new tool, calling onExit/onEnter lifecycle hooks */
  setActiveTool(id: ToolId): void {
    if (this.activeToolId === id) return;

    // Exit current tool
    const currentTool = this.activeToolId ? this.tools.get(this.activeToolId) : null;
    currentTool?.onExit?.();

    // Enter new tool
    this.activeToolId = id;
    const newTool = this.tools.get(id);
    newTool?.onEnter?.();
  }

  /** Get the currently active tool */
  getActiveTool(): EditorTool | undefined {
    return this.activeToolId ? this.tools.get(this.activeToolId) : undefined;
  }

  // ── Event Forwarding ──────────────────────────────

  onPointerDown(evt: PointerInfo): void {
    this.getActiveTool()?.onPointerDown?.(evt);
  }

  onPointerMove(evt: PointerInfo): void {
    this.getActiveTool()?.onPointerMove?.(evt);
  }

  onPointerUp(evt: PointerInfo): void {
    this.getActiveTool()?.onPointerUp?.(evt);
  }

  onKeyDown(evt: KeyboardEvent): void {
    this.getActiveTool()?.onKeyDown?.(evt);
  }

  onKeyUp(evt: KeyboardEvent): void {
    this.getActiveTool()?.onKeyUp?.(evt);
  }
}

/** Singleton instance */
export const ToolManager = new ToolManagerClass();
