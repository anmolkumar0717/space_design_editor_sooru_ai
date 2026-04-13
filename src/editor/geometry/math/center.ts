import { Vector3 } from '@babylonjs/core';

/**
 * Calculates the geometric center (bounding box center) of a set of points.
 * Returns the center and the points relative to that center.
 */
export function normalizePoints(points: Vector3[]): { center: Vector3; relativePoints: Vector3[] } {
  if (points.length === 0) {
    return { center: Vector3.Zero(), relativePoints: [] };
  }

  const min = points[0].clone();
  const max = points[0].clone();

  for (let i = 1; i < points.length; i++) {
    min.x = Math.min(min.x, points[i].x);
    min.y = Math.min(min.y, points[i].y);
    min.z = Math.min(min.z, points[i].z);

    max.x = Math.max(max.x, points[i].x);
    max.y = Math.max(max.y, points[i].y);
    max.z = Math.max(max.z, points[i].z);
  }

  const center = new Vector3(
    (min.x + max.x) / 2,
    (min.y + max.y) / 2,
    (min.z + max.z) / 2
  );

  const relativePoints = points.map(p => p.subtract(center));

  return { center, relativePoints };
}
