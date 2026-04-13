import { Vector3 } from '@babylonjs/core';

/**
 * Calculates the angle (in radians) of the vector from p1 to p2.
 */
export function getAngle(p1: Vector3, p2: Vector3): number {
  return Math.atan2(p2.x - p1.x, p2.z - p1.z);
}
