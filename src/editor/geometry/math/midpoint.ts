import { Vector3 } from '@babylonjs/core';

/**
 * Calculates the midpoint between two vectors.
 */
export function getMidpoint(p1: Vector3, p2: Vector3): Vector3 {
  return new Vector3(
    (p1.x + p2.x) / 2,
    (p1.y + p2.y) / 2,
    (p1.z + p2.z) / 2
  );
}
