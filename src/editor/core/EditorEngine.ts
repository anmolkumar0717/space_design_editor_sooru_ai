/**
 * Editor Engine — top-level orchestrator that wires together
 * the ToolManager, SceneRegistry, and stores.
 * 
 * Initialized once when the Babylon scene is ready.
 * Provides a clean API for the rest of the application.
 */

import type { Scene } from '@babylonjs/core';
import { ToolManager } from './ToolManager';
import { SceneRegistry } from './SceneRegistry';
import { SelectTool } from '@/editor/tools/SelectTool';
import { MoveTool } from '@/editor/tools/MoveTool';
import { RotateTool } from '@/editor/tools/RotateTool';
import { LineTool } from '@/editor/tools/line/LineTool';
import { RectangleTool } from '@/editor/tools/rectangle/RectangleTool';
import { PolylineTool } from '@/editor/tools/polyline/PolylineTool';
import { PolygonTool } from '@/editor/tools/polygon/PolygonTool';
import { EllipseTool } from '@/editor/tools/ellipse/EllipseTool';
import { ArcTool } from '@/editor/tools/arc/ArcTool';
import { PreviewManager } from '@/editor/geometry/preview/PreviewManager';

class EditorEngineClass {
  private _scene: Scene | null = null;
  private _initialized = false;

  get scene(): Scene | null {
    return this._scene;
  }

  get isInitialized(): boolean {
    return this._initialized;
  }

  /** Initialize the editor engine with a Babylon scene */
  init(scene: Scene): void {
    if (this._initialized) return;

    this._scene = scene;

    // Initialize Systems
    PreviewManager.init(scene);

    // Register all tools
    ToolManager.registerTool(new SelectTool(scene));
    ToolManager.registerTool(new MoveTool(scene));
    ToolManager.registerTool(new RotateTool(scene));
    ToolManager.registerTool(new LineTool(scene));
    ToolManager.registerTool(new RectangleTool(scene));
    ToolManager.registerTool(new PolylineTool(scene));
    ToolManager.registerTool(new PolygonTool(scene));
    ToolManager.registerTool(new EllipseTool(scene));
    ToolManager.registerTool(new ArcTool(scene));

    // Set default tool
    ToolManager.setActiveTool('select');

    this._initialized = true;
    console.log('[EditorEngine] Initialized');
  }

  /** Clean up the editor engine */
  dispose(): void {
    SceneRegistry.clear();
    this._scene = null;
    this._initialized = false;
    console.log('[EditorEngine] Disposed');
  }
}

/** Singleton instance */
export const EditorEngine = new EditorEngineClass();
