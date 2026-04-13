/**
 * Common interface all editor tools must implement.
 * This enables polymorphic tool switching through the ToolManager.
 */

import type { PointerInfo } from '@babylonjs/core';

export interface EditorTool {
  /** Unique tool identifier */
  id: string;
  /** Display label for UI */
  label: string;
  /** Icon name from lucide-react */
  icon: string;

  /** Called when tool becomes active */
  onEnter?(): void;
  /** Called when tool is deactivated */
  onExit?(): void;

  /** Babylon pointer events forwarded by ToolManager */
  onPointerDown?(evt: PointerInfo): void;
  onPointerMove?(evt: PointerInfo): void;
  onPointerUp?(evt: PointerInfo): void;

  /** Keyboard events forwarded by ToolManager */
  onKeyDown?(evt: KeyboardEvent): void;
  onKeyUp?(evt: KeyboardEvent): void;
}

export type ToolId = 
  | 'select' 
  | 'move' 
  | 'rotate' 
  | 'line' 
  | 'rectangle' 
  | 'polyline' 
  | 'polygon' 
  | 'ellipse' 
  | 'arc'
  | 'eraser'
  | 'scale_uniform'
  | 'scale_axis'
  | 'dimension'
  | 'ruler';
