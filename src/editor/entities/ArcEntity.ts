import type { EditorEntity } from '../types/entities';

export interface ArcEntity extends EditorEntity {
  type: 'arc';
  start: [number, number, number];
  mid: [number, number, number];
  end: [number, number, number];
}
