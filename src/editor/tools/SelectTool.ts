/**
 * Select Tool — the first and most fundamental tool.
 *
 * On click:
 *   Babylon pick → mesh → SceneRegistry lookup → entity ID → selection store
 * On empty space:
 *   Clear selection
 */

import {
  type Scene,
  type PointerInfo,
  PointerEventTypes,
} from '@babylonjs/core';
import type { EditorTool } from './types';
import { SceneRegistry } from '@/editor/core/SceneRegistry';
import { useSelectionStore } from '@/editor/store/selectionStore';

export class SelectTool implements EditorTool {
  id = 'select';
  label = 'Select';
  icon = 'mouse-pointer-2';

  constructor(protected scene: Scene) {}

  onEnter(): void {
    // Could change cursor style, etc.
  }

  onExit(): void {
    // Clean up any hover states
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
        const nativeEvent = evt.event as PointerEvent;
        if (nativeEvent.ctrlKey || nativeEvent.metaKey) {
          // Multi-select with Ctrl/Cmd
          useSelectionStore.getState().toggleSelect(entityId);
        } else {
          useSelectionStore.getState().select(entityId);
        }
        return;
      }
    }

    // Clicked empty space → clear
    useSelectionStore.getState().clearSelection();
  }

  onPointerMove(evt: PointerInfo): void {
    if (evt.type !== PointerEventTypes.POINTERMOVE) return;

    const pickResult = this.scene.pick(
      this.scene.pointerX,
      this.scene.pointerY
    );

    if (pickResult?.hit && pickResult.pickedMesh) {
      const entityId = SceneRegistry.getEntityId(pickResult.pickedMesh);
      useSelectionStore.getState().setHover(entityId ?? null);
    } else {
      useSelectionStore.getState().setHover(null);
    }
  }

  onPointerUp(): void {
    // Reserved for drag-select box later
  }
}
