import {
  Vector3,
  type Scene,
  type PointerInfo,
  PointerEventTypes
} from '@babylonjs/core';
import { SelectTool } from './SelectTool';
import { SceneRegistry } from '@/editor/core/SceneRegistry';
import { useSelectionStore } from '@/editor/store/selectionStore';
import { screenToWorld } from '../geometry/picking/screenToWorld';
import { createUpdateEntityCommand, executeCommand } from '../core/CommandManager';
import { useUIStore } from '@/editor/store/uiStore';

export class RotateTool extends SelectTool {
  id = 'rotate';
  label = 'Rotate';
  icon = 'rotate-cw';

  private static ROTATE_CURSOR = `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgdmlld0JveD0nMCAwIDI0IDI0JyBmaWxsPSdub25lJyBzdHJva2U9J2JsYWNrJyBzdHJva2Utd2lkdGg9JzInIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCc+PHBhdGggZD0nTTIxIDEyYTkgOSAwIDEgMS05LTljMi41MiAwIDQuOTMgMSA2Ljc0IDIuNzRMMjEgOCcvPjxwb2x5bGluZSBwb2ludHM9JzIxIDMgMjEgOCAxNiA4Jy8+PC9zdmc+"), auto`;

  private rotatingEntityId: string | null = null;
  private initialRotationY = 0;
  private initialAngle = 0;

  constructor(scene: Scene) {
    super(scene);
  }

  onEnter(): void {
    const canvas = this.scene.getEngine().getRenderingCanvas();
    if (canvas) {
      canvas.style.cursor = RotateTool.ROTATE_CURSOR;
    }
  }

  onExit(): void {
    const canvas = this.scene.getEngine().getRenderingCanvas();
    if (canvas) {
      canvas.style.cursor = 'default';
    }
    useUIStore.getState().setTempDimensions(null);
    super.onExit();
    this.rotatingEntityId = null;
  }

  onPointerDown(evt: PointerInfo): void {
    if (evt.type !== PointerEventTypes.POINTERDOWN) return;

    const pickResult = this.scene.pick(
      this.scene.pointerX,
      this.scene.pointerY
    );

    if (pickResult?.hit && pickResult.pickedMesh) {
      const entityId = SceneRegistry.getEntityId(pickResult.pickedMesh);
      if (entityId) {
        // 1. Select the entity
        useSelectionStore.getState().select(entityId);

        // 2. Initialize rotation
        const worldPoint = screenToWorld(this.scene, this.scene.pointerX, this.scene.pointerY);
        const node = SceneRegistry.getNode(entityId);

        if (worldPoint && node) {
          this.rotatingEntityId = entityId;
          this.initialRotationY = node.rotation.y;

          // Calculate angle from entity center to pick point
          this.initialAngle = Math.atan2(
            worldPoint.z - node.position.z,
            worldPoint.x - node.position.x
          );
        }
        return;
      }
    }

    // Clicked empty space
    useSelectionStore.getState().clearSelection();
  }

  onPointerMove(evt: PointerInfo): void {
    if (this.rotatingEntityId) {
      const worldPoint = screenToWorld(this.scene, this.scene.pointerX, this.scene.pointerY);
      const node = SceneRegistry.getNode(this.rotatingEntityId);

      if (worldPoint && node) {
        // Calculate current angle
        const currentAngle = Math.atan2(
          worldPoint.z - node.position.z,
          worldPoint.x - node.position.x
        );

        const deltaAngle = currentAngle - this.initialAngle;

        // Update rotation (Y-axis only for architectural consistency)
        node.rotation.y = this.initialRotationY - deltaAngle;

        // Feedback: Show angle in degrees
        let deg = (node.rotation.y * 180 / Math.PI) % 360;
        if (deg < 0) deg += 360;
        useUIStore.getState().setTempDimensions(`A: ${deg.toFixed(1)}°`);
      }
    } else {
      super.onPointerMove(evt);
    }
  }

  onPointerUp(): void {
    if (this.rotatingEntityId) {
      const node = SceneRegistry.getNode(this.rotatingEntityId);
      if (node) {
        executeCommand(createUpdateEntityCommand(this.rotatingEntityId, {
          rotation: [node.rotation.x, node.rotation.y, node.rotation.z]
        }));
      }
      this.rotatingEntityId = null;
      useUIStore.getState().setTempDimensions(null);
    }
  }
}

