import { Vector3, Plane, Ray } from '@babylonjs/core';
import type { Scene } from '@babylonjs/core';

// Represents the ground plane where all our 2D/3D drawing anchors
// Equation: 0x + 1y + 0z = 0 (Y=0 plane)
const GROUND_PLANE = new Plane(0, 1, 0, 0);

/**
 * Converts screen coordinates to a 3D point on the architectural floor (Y=0).
 * Always uses a ray vs the infinite ground plane — never mesh picking — so strokes
 * stay on the floor even when the cursor is over slabs, discs, or other geometry.
 */
export function screenToWorld(
  scene: Scene,
  pointerX: number,
  pointerY: number
): Vector3 | null {
  const camera = scene.activeCamera;
  if (!camera) return null;

  const ray: Ray = scene.createPickingRay(pointerX, pointerY, null, camera);

  const distance = ray.intersectsPlane(GROUND_PLANE);

  if (distance === null) {
    return null;
  }

  const hit = ray.origin.add(ray.direction.scale(distance));
  hit.y = 0;
  return hit;
}
