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
import { RectangleMachine } from './rectangleMachine';
import { RectanglePreview } from './rectanglePreview';
import { RectangleBuilder } from '../../geometry/builders/rectangleBuilder';
import { createAddEntityCommand, executeCommand } from '../../core/CommandManager';
import { createId } from '@/shared/utils/ids';
import type { EditorEntity } from '../../types/entities';
import { useUIStore } from '@/editor/store/uiStore';
import { normalizePoints } from '../../geometry/math/center';

export class RectangleTool implements EditorTool {
  id = 'rectangle';
  label = 'Rectangle';
  icon = 'square';

  private machine = new RectangleMachine();

  constructor(private scene: Scene) {}

  onEnter(): void {
    this.machine.reset();
  }

  onExit(): void {
    this.machine.reset();
    RectanglePreview.clear();
  }

  onPointerDown(evt: PointerInfo): void {
    const rawPoint = screenToWorld(this.scene, this.scene.pointerX, this.scene.pointerY);
    const snappedPoint = SnapManager.snap(rawPoint);

    if (snappedPoint) {
      if (this.machine.isIdle()) {
        this.machine.setFirstPoint(snappedPoint);
        const s = this.machine.getState().start!;
        RectanglePreview.update(s, s.clone());
      } else if (this.machine.isDragging()) {
        this.finalize(snappedPoint);
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

    if (this.machine.isDragging() && rawPoint) {
      const start = this.machine.getState().start!;
      RectanglePreview.update(start, rawPoint);
      const w = Math.abs(rawPoint.x - start.x);
      const h = Math.abs(rawPoint.z - start.z);
      useUIStore.getState().setTempDimensions(`W: ${w.toFixed(2)}m H: ${h.toFixed(2)}m`);
    }
  }

  onPointerUp(evt: PointerInfo): void {}

  onKeyDown(evt: KeyboardEvent): void {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.cancel();
    }
  }

  private cancel(): void {
    this.machine.reset();
    RectanglePreview.clear();
    useUIStore.getState().setTempDimensions(null);
  }

  private finalize(endPoint: Vector3): void {
    const state = this.machine.getState();
    if (!state.start) return;

    if (Vector3.Distance(state.start, endPoint) < 0.1) return;

    const corners = RectangleBuilder.getCorners(state.start, endPoint);

    const { center, relativePoints } = normalizePoints(corners);

    const entity: EditorEntity = {
      id: createId(),
      name: 'Rectangle',
      type: 'rectangle',
      position: [center.x, 0, center.z],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: false,
      points: relativePoints.map(p => [p.x, 0, p.z]) as [number, number, number][]
    };

    executeCommand(createAddEntityCommand(entity));
    
    this.machine.reset();
    RectanglePreview.clear();
    useUIStore.getState().setTempDimensions(null);
  }
}
