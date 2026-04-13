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
import { SnapManager } from '../geometry/snapping/SnapManager';
import { createUpdateEntityCommand, executeCommand } from '../core/CommandManager';

export class MoveTool extends SelectTool {
  id = 'move';
  label = 'Move';
  icon = 'move';

  private draggedEntityId: string | null = null;
  private dragOffset = Vector3.Zero();

  constructor(scene: Scene) {
    super(scene);
  }

  onEnter(): void {
    const canvas = this.scene.getEngine().getRenderingCanvas();
    if (canvas) {
      canvas.style.cursor = 'grab';
    }
  }

  onExit(): void {
    const canvas = this.scene.getEngine().getRenderingCanvas();
    if (canvas) {
      canvas.style.cursor = 'default';
    }
    super.onExit();
    this.draggedEntityId = null;
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

        // 2. Initialize drag
        const worldPoint = screenToWorld(this.scene, this.scene.pointerX, this.scene.pointerY);
        const node = SceneRegistry.getNode(entityId);

        if (worldPoint && node) {
          this.draggedEntityId = entityId;
          // Calculate offset between pick point and entity origin
          this.dragOffset = worldPoint.subtract(node.position);

          // Visual Feedback
          const canvas = this.scene.getEngine().getRenderingCanvas();
          if (canvas) canvas.style.cursor = 'grabbing';
        }
        return;
      }
    }

    // Clicked empty space
    useSelectionStore.getState().clearSelection();
  }

  onPointerMove(evt: PointerInfo): void {
    if (this.draggedEntityId) {
      const worldPoint = screenToWorld(this.scene, this.scene.pointerX, this.scene.pointerY);
      const node = SceneRegistry.getNode(this.draggedEntityId);

      if (worldPoint && node) {
        const newPos = worldPoint.subtract(this.dragOffset);
        const snappedPos = SnapManager.snap(newPos);

        if (snappedPos) {
          // Keep strictly to ground
          node.position.set(snappedPos.x, 0, snappedPos.z);
        }
      }
    } else {
      super.onPointerMove(evt);
    }
  }

  onPointerUp(): void {
    if (this.draggedEntityId) {
      const node = SceneRegistry.getNode(this.draggedEntityId);
      if (node) {
        executeCommand(createUpdateEntityCommand(this.draggedEntityId, {
          position: [node.position.x, 0, node.position.z]
        }));
      }
      this.draggedEntityId = null;

      // Reset cursor
      const canvas = this.scene.getEngine().getRenderingCanvas();
      if (canvas) canvas.style.cursor = 'grab';
    }
  }
}
