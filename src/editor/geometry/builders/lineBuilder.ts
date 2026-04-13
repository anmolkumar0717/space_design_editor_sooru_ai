import { Vector3 } from '@babylonjs/core';

/**
 * Basic builder for line-related data structures.
 */
export class LineBuilder {
  /**
   * Returns the points for a single line segment.
   */
  public static getPoints(start: Vector3, end: Vector3): Vector3[] {
    return [start, end];
  }
}
