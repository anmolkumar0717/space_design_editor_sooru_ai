import type { EditorEntity } from '../types/entities';

/**
 * Represents a straight line segment defined by two points.
 */
export interface LineEntity extends EditorEntity {
  type: 'line';
  points: [[number, number, number], [number, number, number]];
  color?: string;
}
