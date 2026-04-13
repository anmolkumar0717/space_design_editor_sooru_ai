import type { EditorEntity } from '../types/entities';

export interface PolygonEntity extends EditorEntity {
  type: 'polygon';
  points: [number, number, number][];
}
