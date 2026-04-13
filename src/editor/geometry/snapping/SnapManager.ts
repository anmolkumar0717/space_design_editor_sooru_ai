import { Vector3 } from '@babylonjs/core';
import { useUIStore } from '@/editor/store/uiStore';
import { snapToGrid } from './snapGrid';

export class SnapManager {
  /**
   * Evaluates the raw world coordinate, returning an adjusted snapped vector
   * if snapping logic is globally enabled.
   */
  public static snap(worldPoint: Vector3 | null): Vector3 | null {
    if (!worldPoint) return null;

    const snapEnabled = useUIStore.getState().snapEnabled;
    const gridSize = 1.0; // Phase 2 fixed grid size. Phase 3 might make this dynamic

    if (!snapEnabled) {
      return worldPoint.clone();
    }

    // Pass through core snap logic
    return snapToGrid(worldPoint, gridSize);
  }
}
