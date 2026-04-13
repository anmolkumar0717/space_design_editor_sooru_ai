import { useUIStore } from '@/editor/store/uiStore';
import type { EditorEntity } from '@/editor/types/entities';
import type { ToolId } from '@/editor/tools/types';

/** Tools that place geometry on the XZ floor plane via screenToWorld (not mesh picking). */
const PLANAR_DRAW_TOOLS: ReadonlySet<ToolId> = new Set([
  'line',
  'rectangle',
  'polyline',
  'polygon',
  'ellipse',
  'arc',
]);

export function isPlanarDrawingToolActive(): boolean {
  return PLANAR_DRAW_TOOLS.has(useUIStore.getState().activeTool);
}

/** Whether entity geometry should participate in Babylon picking (selection, etc.). */
export function meshPickableForEntity(entity: EditorEntity): boolean {
  if (!entity.visible) return false;
  if (entity.locked) return false;
  if (isPlanarDrawingToolActive()) return false;
  return true;
}
