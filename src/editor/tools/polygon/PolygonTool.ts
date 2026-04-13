import { 
  type PointerInfo, 
  PointerEventTypes, 
  Vector3,
  type Scene
} from '@babylonjs/core';
import type { EditorTool } from '../types';
import { screenToWorld } from '../../geometry/picking/screenToWorld';
import { SnapManager } from '../../geometry/snapping/SnapManager';
import { PreviewManager } from '../../geometry/preview/PreviewManager';
import { PathMachine } from '../polyline/pathMachine';
import { createAddEntityCommand, executeCommand } from '../../core/CommandManager';
import { createId } from '@/shared/utils/ids';
import type { EditorEntity } from '../../types/entities';
import { normalizePoints } from '../../geometry/math/center';

export class PolygonTool implements EditorTool {
  id = 'polygon';
  label = 'Polygon';
  icon = 'pentagon';

  private machine = new PathMachine();
  private static PREVIEW_ID = 'polygon_tool_preview';

  constructor(private scene: Scene) {}

  onEnter(): void {
    this.machine.reset();
  }

  onExit(): void {
    this.machine.reset();
    PreviewManager.clearPreview(PolygonTool.PREVIEW_ID);
  }

  onPointerDown(evt: PointerInfo): void {
    if (evt.type === PointerEventTypes.POINTERDOWN) {
      const rawPoint = screenToWorld(this.scene, this.scene.pointerX, this.scene.pointerY);
      const snappedPoint = SnapManager.snap(rawPoint);

      if (snappedPoint) {
        this.machine.addPoint(snappedPoint);
      }
    }
    
    if (evt.type === PointerEventTypes.POINTERDOUBLETAP) {
      this.finalize();
    }
  }

  onPointerMove(evt: PointerInfo): void {
    const rawPoint = screenToWorld(this.scene, this.scene.pointerX, this.scene.pointerY);
    const snappedPoint = rawPoint ? SnapManager.snap(rawPoint) : null;

    if (snappedPoint) {
      PreviewManager.updateSnapHint(snappedPoint);
    } else {
      PreviewManager.updateSnapHint(null);
    }

    if (this.machine.isDrawing() && rawPoint) {
      const state = this.machine.getState();
      PreviewManager.showPath(PolygonTool.PREVIEW_ID, state.points, rawPoint, true);
    }
  }

  onKeyDown(evt: KeyboardEvent): void {
    if (evt.key === 'Enter') {
      this.finalize();
    } else if (evt.key === 'Escape') {
      evt.preventDefault();
      this.cancel();
    }
  }

  private cancel(): void {
    this.machine.reset();
    PreviewManager.clearPreview(PolygonTool.PREVIEW_ID);
  }

  private finalize(): void {
    const state = this.machine.getState();
    if (state.points.length < 3) {
      this.cancel();
      return;
    }

    const { center, relativePoints } = normalizePoints(state.points);

    const entity: EditorEntity = {
      id: createId(),
      name: 'Polygon',
      type: 'polygon',
      position: [center.x, 0, center.z],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: false,
      points: relativePoints.map(p => [p.x, 0, p.z]) as [number, number, number][]
    };

    executeCommand(createAddEntityCommand(entity));
    
    this.machine.reset();
    PreviewManager.clearPreview(PolygonTool.PREVIEW_ID);
  }

  onPointerUp(evt: PointerInfo): void {}
}
