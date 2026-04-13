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
import { createAddEntityCommand, executeCommand } from '../../core/CommandManager';
import { createId } from '@/shared/utils/ids';
import type { EditorEntity } from '../../types/entities';
import { normalizePoints } from '../../geometry/math/center';
import { tessellateArcThroughThreePointsXZ } from '../../geometry/math/arcThroughThreePoints';

export class ArcTool implements EditorTool {
  id = 'arc';
  label = 'Arc';
  icon = 'database'; // lucide-react doesn't have a perfect arc icon, using database or just square for placeholder

  private points: Vector3[] = [];
  private static PREVIEW_ID = 'arc_tool_preview';

  constructor(private scene: Scene) {}

  onEnter(): void {
    this.points = [];
  }

  onExit(): void {
    this.points = [];
    PreviewManager.clearPreview(ArcTool.PREVIEW_ID);
  }

  onPointerDown(evt: PointerInfo): void {
    if (evt.type !== PointerEventTypes.POINTERDOWN) return;
    
    const rawPoint = screenToWorld(this.scene, this.scene.pointerX, this.scene.pointerY);
    const snappedPoint = SnapManager.snap(rawPoint);

    if (snappedPoint) {
      this.points.push(snappedPoint.clone());
      if (this.points.length === 3) {
        this.finalize();
      }
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

    if (rawPoint) {
      this.updatePreview(rawPoint);
    }
  }

  private updatePreview(current: Vector3): void {
    if (this.points.length === 0) return;

    if (this.points.length === 1) {
      PreviewManager.showLine(ArcTool.PREVIEW_ID, this.points[0], current);
      return;
    }

    const arcPts = tessellateArcThroughThreePointsXZ(
      this.points[0],
      this.points[1],
      current,
      36
    );
    PreviewManager.showPolyline(ArcTool.PREVIEW_ID, arcPts);
  }

  onKeyDown(evt: KeyboardEvent): void {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.cancel();
    }
  }

  private cancel(): void {
    this.points = [];
    PreviewManager.clearPreview(ArcTool.PREVIEW_ID);
  }

  private finalize(): void {
    if (this.points.length < 3) return;

    const arcWorld = tessellateArcThroughThreePointsXZ(
      this.points[0],
      this.points[1],
      this.points[2],
      48
    );
    const { center, relativePoints } = normalizePoints(arcWorld.map((p) => p.clone()));

    const entity: EditorEntity = {
      id: createId(),
      name: 'Arc',
      type: 'arc',
      position: [center.x, 0, center.z],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: false,
      points: relativePoints.map((p) => [p.x, 0, p.z]) as [number, number, number][],
    };

    executeCommand(createAddEntityCommand(entity));
    
    this.points = [];
    PreviewManager.clearPreview(ArcTool.PREVIEW_ID);
  }

  onPointerUp(evt: PointerInfo): void {}
}
