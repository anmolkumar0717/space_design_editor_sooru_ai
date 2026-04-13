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
import { LineMachine } from './lineMachine';
import { LinePreview } from './linePreview';
import { createAddEntityCommand, executeCommand } from '../../core/CommandManager';
import { createId } from '@/shared/utils/ids';
import type { EditorEntity } from '../../types/entities';
import { useUIStore } from '@/editor/store/uiStore';
import { getDistance } from '../../geometry/math/distance';
import { normalizePoints } from '../../geometry/math/center';

export class LineTool implements EditorTool {
  id = 'line';
  label = 'Line';
  icon = 'minus';

  private machine = new LineMachine();

  constructor(private scene: Scene) {}

  onEnter(): void {
    this.machine.reset();
  }

  onExit(): void {
    this.machine.reset();
    LinePreview.clear();
    useUIStore.getState().setTempDimensions(null);
  }

  onPointerDown(evt: PointerInfo): void {
    const rawPoint = screenToWorld(this.scene, this.scene.pointerX, this.scene.pointerY);
    const snappedPoint = SnapManager.snap(rawPoint);

    if (snappedPoint) {
      if (this.machine.isIdle()) {
        this.machine.setFirstPoint(snappedPoint);
        const s = this.machine.getState().start!;
        LinePreview.update(s, s.clone());
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
      LinePreview.update(start, rawPoint);
      const dist = getDistance(start, rawPoint);
      useUIStore.getState().setTempDimensions(`L: ${dist.toFixed(2)}m`);
    }
  }

  onPointerUp(evt: PointerInfo): void {
    // Click-click interaction doesn't depend on PointerUp
  }

  onKeyDown(evt: KeyboardEvent): void {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.cancel();
    }
  }

  private cancel(): void {
    this.machine.reset();
    LinePreview.clear();
    useUIStore.getState().setTempDimensions(null);
  }

  private finalize(endPoint: Vector3): void {
    const state = this.machine.getState();
    if (!state.start) return;

    // Minimum distance check
    if (Vector3.Distance(state.start, endPoint) < 0.1) return;

    const { center, relativePoints } = normalizePoints([state.start, endPoint]);

    const entity: EditorEntity = {
      id: createId(),
      name: 'Line',
      type: 'line',
      position: [center.x, 0, center.z], 
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
      locked: false,
      points: relativePoints.map(p => [p.x, 0, p.z]) as [number, number, number][]
    };

    executeCommand(createAddEntityCommand(entity));
    
    this.machine.reset();
    LinePreview.clear();
    useUIStore.getState().setTempDimensions(null);
  }
}
