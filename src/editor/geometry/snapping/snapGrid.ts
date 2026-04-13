import { Vector3 } from '@babylonjs/core';

/**
 * Computes a snapped grid point for a given absolute vector.
 */
export function snapToGrid(
  point: Vector3,
  gridSize: number
): Vector3 {
  if (gridSize <= 0) return point;

  return new Vector3(
    Math.round(point.x / gridSize) * gridSize,
    point.y,
    Math.round(point.z / gridSize) * gridSize
  );
}
