import type { EditorEntity } from '../types/entities';

/**
 * Represents a rectangle defined by 4 corner points.
 */
export interface RectangleEntity extends EditorEntity {
  type: 'rectangle';
  points: [
    [number, number, number],
    [number, number, number],
    [number, number, number],
    [number, number, number]
  ];
}
