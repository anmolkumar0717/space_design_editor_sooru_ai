import type { EditorEntity } from '../types/entities';

export interface PolylineEntity extends EditorEntity {
  type: 'polyline';
  points: [number, number, number][];
}
