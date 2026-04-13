import { Vector3 } from '@babylonjs/core';

export class RectangleBuilder {
  /**
   * Given two opposite corner points on the XZ plane, returns all 4 corners.
   * Order: start, corner1, end, corner2
   */
  public static getCorners(start: Vector3, end: Vector3): Vector3[] {
    // start: (x1, y, z1), end: (x2, y, z2)
    // Corner 1: (x2, y, z1)
    // Corner 2: (x1, y, z2)
    
    return [
      start.clone(),
      new Vector3(end.x, start.y, start.z),
      end.clone(),
      new Vector3(start.x, start.y, end.z)
    ];
  }
}
