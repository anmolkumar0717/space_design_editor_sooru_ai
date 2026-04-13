import { Vector3 } from '@babylonjs/core';

/**
 * Calculates the Euclidean distance between two points on the XZ plane (Y=0).
 */
export function getDistance(p1: Vector3, p2: Vector3): number {
  const dx = p2.x - p1.x;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dz * dz);
}
