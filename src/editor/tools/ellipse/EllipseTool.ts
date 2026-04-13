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
import { useUIStore } from '@/editor/store/uiStore';

export class EllipseTool implements EditorTool {
  id = 'ellipse';
  label = 'Ellipse';
  icon = 'circle';

  private center: Vector3 | null = null;
  private static PREVIEW_ID = 'ellipse_tool_preview';

  constructor(private scene: Scene) { }

  onEnter(): void {
    this.center = null;
  }

  onExit(): void {
    this.center = null;
    PreviewManager.clearPreview(EllipseTool.PREVIEW_ID);
  }

  onPointerDown(evt: PointerInfo): void {
    if (evt.type !== PointerEventTypes.POINTERDOWN) return;

    const rawPoint = screenToWorld(this.scene, this.scene.pointerX, this.scene.pointerY);
    const snappedPoint = SnapManager.snap(rawPoint);

    if (snappedPoint) {
      if (!this.center) {
        this.center = snappedPoint.clone();
        PreviewManager.showEllipse(EllipseTool.PREVIEW_ID, this.center, 0.02, 0.02);
      } else {
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

    // Use raw ground hit for radii so the preview tracks the cursor smoothly; commit still snaps on click.
    if (this.center && rawPoint) {
      const rx = Math.abs(rawPoint.x - this.center.x);
      const rz = Math.abs(rawPoint.z - this.center.z);
      PreviewManager.showEllipse(EllipseTool.PREVIEW_ID, this.center, rx, rz);
      useUIStore.getState().setTempDimensions(`RX: ${rx.toFixed(2)}m RZ: ${rz.toFixed(2)}m`);
    }
  }

  onKeyDown(evt: KeyboardEvent): void {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.cancel();
    }
  }

  private cancel(): void {
    this.center = null;
    PreviewManager.clearPreview(EllipseTool.PREVIEW_ID);
  }

  private finalize(endPoint: Vector3): void {
    if (!this.center) return;
    const rx = Math.abs(endPoint.x - this.center.x);
    const rz = Math.abs(endPoint.z - this.center.z);

    if (rx < 0.1 && rz < 0.1) return;

    const entity: EditorEntity = {
      id: createId(),
      name: 'Ellipse',
      type: 'ellipse',
      position: [this.center.x, 0, this.center.z],
      rotation: [0, 0, 0],
      scale: [rx, rz, 1],
      visible: true,
      locked: false,
      metadata: {
        radiusX: rx,
        radiusZ: rz
      }
    };

    executeCommand(createAddEntityCommand(entity));

    this.center = null;
    PreviewManager.clearPreview(EllipseTool.PREVIEW_ID);
    useUIStore.getState().setTempDimensions(null);
  }

  onPointerUp(evt: PointerInfo): void { }
}
