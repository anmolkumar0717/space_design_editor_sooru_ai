/**
 * GizmoManager — integrates Babylon's built-in gizmos with our editor state.
 *
 * It listens to useSelectionStore to attach gizmos to selected meshes,
 * and listens to useUIStore to determine which gizmo (move/rotate) to show.
 */

import {
  UtilityLayerRenderer,
  PositionGizmo,
  RotationGizmo,
  type Scene,
  type TransformNode,
} from '@babylonjs/core';
import { useSelectionStore } from '@/editor/store/selectionStore';
import { useUIStore } from '@/editor/store/uiStore';
import { useSceneStore } from '@/editor/store/sceneStore';
import { SceneRegistry } from '@/editor/core/SceneRegistry';
import { createUpdateEntityCommand, executeCommand } from '@/editor/core/CommandManager';
import { SnapManager } from '@/editor/geometry/snapping/SnapManager';

export class EditorGizmoManager {
  private utilityLayer: UtilityLayerRenderer;
  private positionGizmo: PositionGizmo;
  private rotationGizmo: RotationGizmo;
  
  private unsubSelection!: () => void;
  private unsubUI!: () => void;

  constructor(private scene: Scene) {
    this.utilityLayer = new UtilityLayerRenderer(scene);
    
    // Position Gizmo
    this.positionGizmo = new PositionGizmo(this.utilityLayer);
    this.positionGizmo.attachedNode = null;
    
    // Rotation Gizmo
    this.rotationGizmo = new RotationGizmo(this.utilityLayer);
    this.rotationGizmo.attachedNode = null;
    this.rotationGizmo.updateGizmoRotationToMatchAttachedMesh = false; // Vertical Y-axis always upright
    this.rotationGizmo.scaleRatio = 1.2; 

    // Set up dragging observables to commit changes to our store
    this.setupObservables();

    // Set up subscriptions to Zustand stores
    this.setupSubscriptions();
  }

  private setupObservables() {
    // We want to capture the state only when a drag completes.
    // While dragging, Babylon natively updates the mesh. When done, we push the command.

    const onDragEnd = () => {
      const activeTool = useUIStore.getState().activeTool;
      const selectedIds = useSelectionStore.getState().selectedIds;
      if (selectedIds.length === 0) return;
      
      const entityId = selectedIds[0];
      const node = SceneRegistry.getNode(entityId);
      if (!node) return;

      if (activeTool === 'move') {
        executeCommand(createUpdateEntityCommand(entityId, {
          position: [node.position.x, node.position.y, node.position.z]
        }));
      } else if (activeTool === 'rotate') {
        let rot = node.rotation;
        if (node.rotationQuaternion) {
          rot = node.rotationQuaternion.toEulerAngles();
        }
        executeCommand(createUpdateEntityCommand(entityId, {
          rotation: [rot.x, rot.y, rot.z]
        }));
      }
    };

    // Attach to position axes
    const applySnap = () => {
      const node = this.positionGizmo.attachedNode as TransformNode;
      if (node) {
        const snapped = SnapManager.snap(node.position);
        if (snapped) {
          node.position.copyFrom(snapped);
        }
      }
    };

    this.positionGizmo.xGizmo.dragBehavior.onDragObservable.add(applySnap);
    this.positionGizmo.zGizmo.dragBehavior.onDragObservable.add(applySnap);

    this.positionGizmo.xGizmo.dragBehavior.onDragEndObservable.add(onDragEnd);
    this.positionGizmo.yGizmo.dragBehavior.onDragEndObservable.add(onDragEnd);
    this.positionGizmo.zGizmo.dragBehavior.onDragEndObservable.add(onDragEnd);

    // Attach to rotation axes
    this.rotationGizmo.xGizmo.dragBehavior.onDragEndObservable.add(onDragEnd);
    this.rotationGizmo.yGizmo.dragBehavior.onDragEndObservable.add(onDragEnd);
    this.rotationGizmo.zGizmo.dragBehavior.onDragEndObservable.add(onDragEnd);
  }

  private setupSubscriptions() {
    const updateGizmoState = () => {
      // Manual Logic: disabling Babylon gizmos to use direct dragging in tools
      this.positionGizmo.attachedNode = null;
      this.rotationGizmo.attachedNode = null;
    };

    // Subscriptions without reference equality checks for maximum responsiveness
    this.unsubSelection = useSelectionStore.subscribe(updateGizmoState);
    this.unsubUI = useUIStore.subscribe(updateGizmoState);

    // Initial state
    updateGizmoState();
  }

  dispose() {
    if (this.unsubSelection) this.unsubSelection();
    if (this.unsubUI) this.unsubUI();
    this.positionGizmo.dispose();
    this.rotationGizmo.dispose();
    this.utilityLayer.dispose();
  }
}
