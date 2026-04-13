import { Vector3 } from '@babylonjs/core';

export interface Bounds {
  min: Vector3;
  max: Vector3;
  center: Vector3;
  size: Vector3;
}

/**
 * Calculates the bounding box of a list of points.
 */
export function getBounds(points: Vector3[]): Bounds {
  if (points.length === 0) {
    return {
      min: Vector3.Zero(),
      max: Vector3.Zero(),
      center: Vector3.Zero(),
      size: Vector3.Zero()
    };
  }

  const min = points[0].clone();
  const max = points[0].clone();

  for (const p of points) {
    min.x = Math.min(min.x, p.x);
    min.y = Math.min(min.y, p.y);
    min.z = Math.min(min.z, p.z);
    max.x = Math.max(max.x, p.x);
    max.y = Math.max(max.y, p.y);
    max.z = Math.max(max.z, p.z);
  }

  const center = min.add(max).scale(0.5);
  const size = max.subtract(min);

  return { min, max, center, size };
}
